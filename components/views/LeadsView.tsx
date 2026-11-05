'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
  UserX,
  UserCheck,
  X,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Pagination } from '@/components/ui/Pagination';
import { leadApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { addDays, melbourneDay } from '@/lib/floorCalendar';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddProspect: () => void;
  onOpenBookDrive: (lead?: Lead) => void;
  onOpenMessage: (lead: Lead) => void;
  onOpenBulkMessage?: (leads: Lead[]) => void;
}

export function LeadsView({
  leads,
  onSelectLead,
  onOpenAddProspect,
  onOpenBookDrive,
  onOpenMessage,
  onOpenBulkMessage,
}: LeadsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All Sources');
  const [selectedModel, setSelectedModel] = useState<string>('All Models');
  const [selectedScoreBand, setSelectedScoreBand] = useState<string>('All');
  const [selectedRecency, setSelectedRecency] = useState<string>('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);
  const [totalItems, setTotalItems] = useState<number>(leads.length || 0);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil((leads.length || 1) / 30));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageSize = 30;
  const { activeSite, user } = useAuth();
  const requestId = useRef(0);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<{ stages: string[]; sources: string[]; models: string[] }>({ stages: [], sources: [], models: [] });

  // Mark Lost Modal State
  const [lostTargetLead, setLostTargetLead] = useState<Lead | null>(null);
  const [lostReason, setLostReason] = useState('Price / Budget');
  const [lostNotes, setLostNotes] = useState('');
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const stageOptions = ['All', ...filters.stages];
  const sourceOptions = ['All Sources', ...filters.sources];
  const modelOptions = ['All Models', ...filters.models];

  const fetchLeads = useCallback(async (page: number, stage: string, query: string) => {
    const sequence = ++requestId.current;
    setIsLoading(true); setError(''); setLeadsList([]); setSelectedLeadIds([]);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(pageSize) };
      if (stage !== 'All') params.stage = stage;
      if (query.trim()) params.q = query.trim();
      if (selectedSource !== 'All Sources') params.source = selectedSource;
      if (selectedModel !== 'All Models') params.model = selectedModel;
      if (selectedScoreBand === 'High') params.scoreMin = '80';
      if (selectedScoreBand === 'Medium') { params.scoreMin = '60'; params.scoreMax = '79'; }
      if (selectedScoreBand === 'Low') params.scoreMax = '59';
      if (selectedRecency === '2h') params.receivedAfter = new Date(Date.now() - 7200000).toISOString();
      if (selectedRecency === 'Today') params.receivedFrom = melbourneDay();
      if (selectedRecency === 'Week') params.receivedFrom = addDays(melbourneDay(), -6);
      const result = await leadApi.getLeads(params);
      if (sequence !== requestId.current) return;
      if (!result.success) throw new Error(result.message || 'Unable to load leads');
      setLeadsList(result.data || []);
      setTotalItems(result.pagination?.total || 0);
      setTotalPages(result.pagination?.pages || 1);
      if (result.pagination?.page && result.pagination.page !== page) setCurrentPage(result.pagination.page);
      if (result.meta?.filters) setFilters(result.meta.filters);
    } catch (error: any) {
      if (sequence === requestId.current) { setError(error.message || 'Unable to load leads'); setTotalItems(0); setTotalPages(1); }
    } finally { if (sequence === requestId.current) setIsLoading(false); }
  }, [selectedSource, selectedModel, selectedScoreBand, selectedRecency, activeSite, user?.id, leads]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(currentPage, selectedStage, searchQuery), 250);
    return () => { clearTimeout(timer); requestId.current++; };
  }, [currentPage, selectedStage, searchQuery, fetchLeads]);

  const handleReassign = async (lead: Lead) => {
    try {
      const id = String(lead._id || lead.id || '');
      await leadApi.updateLead(id, {
        consultant: 'Team Pool (Round Robin)',
        stage: 'Imported',
      });
      setToastMsg(`Prospect ${lead.name} released to Team Reallocation Pool.`);
      setTimeout(() => setToastMsg(null), 2500);
      fetchLeads(currentPage, selectedStage, searchQuery);
    } catch {
      setToastMsg(`Could not reassign ${lead.name}. Please try again.`);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleConfirmMarkLost = async () => {
    if (!lostTargetLead) return;
    setIsSubmittingLost(true);
    try {
      const id = String(lostTargetLead._id || lostTargetLead.id || '');
      await leadApi.updateLead(id, {
        stage: 'Committed', // status lost recorded in notes
        status: 'Lost',
        notes: `[MARK LOST: ${lostReason}] ${lostNotes}`,
      });
      setToastMsg(`Marked ${lostTargetLead.name} as Lost (${lostReason}).`);
      setTimeout(() => {
        setLostTargetLead(null);
        setLostNotes('');
        setToastMsg(null);
      }, 1200);
      fetchLeads(currentPage, selectedStage, searchQuery);
    } catch {
      setToastMsg(`Could not save the lost status. Please try again.`);
      setTimeout(() => {
        setLostTargetLead(null);
        setToastMsg(null);
      }, 1200);
    } finally {
      setIsSubmittingLost(false);
    }
  };

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'TEST DRIVE BOOKED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'NEW ENQUIRIES':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'Imported':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'Engaged':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Qualified':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Committed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="view-stack">
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700">{error}</div>}
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Prospect Pipeline · Floor CRM Operating System</p>
          <h1 className="page-title">LEAD CENTRE · LIVE BOOK</h1>
          <p className="page-subtitle">
            {activeSite || user?.site || 'Sales Floor'} · Live enquiries, qualification stages and intent scores.
          </p>
        </div>

        <button
          onClick={onOpenAddProspect}
          className="signal-button px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add prospect</span>
        </button>
      </div>

      {/* Surface Card Container */}
      <div className="surface-card overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="search-field flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by customer, model, mobile or VIN..."
                className="w-full bg-transparent outline-none text-xs sm:text-sm"
              />
            </div>

            {/* Source dropdown filter */}
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {sourceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Model dropdown filter */}
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {modelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Score Band dropdown filter (§3.2) */}
            <select
              value={selectedScoreBand}
              onChange={(e) => {
                setSelectedScoreBand(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Scores</option>
              <option value="High">High Intent (80+ pts)</option>
              <option value="Medium">Medium Intent (60-79 pts)</option>
              <option value="Low">Low Intent (&lt;60 pts)</option>
            </select>

            {/* Recency dropdown filter (§3.2) */}
            <select
              value={selectedRecency}
              onChange={(e) => {
                setSelectedRecency(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="2h">&lt; 2 Hours (SLA Focus)</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
            </select>
          </div>

          {/* Stage pills */}
          <div className="filter-scroll">
            {stageOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedStage(st);
                  setCurrentPage(1);
                }}
                className={`filter-chip ${selectedStage === st ? 'active' : ''}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Summary Strip with Bulk Broadcast Button */}
        <div className="leads-summary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={leadsList.length > 0 && selectedLeadIds.length === leadsList.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedLeadIds(leadsList.map((l) => String(l._id || l.id)));
                } else {
                  setSelectedLeadIds([]);
                }
              }}
              className="rounded border-slate-400 cursor-pointer"
              title="Select all on current page"
            />
            <span>
              Active Pipeline · <strong className="text-white">{totalItems.toLocaleString()}</strong> Prospects
            </span>
          </div>

          <div className="flex items-center gap-3">
            {selectedLeadIds.length > 0 && onOpenBulkMessage && (
              <button
                onClick={() => {
                  const selectedLeads = leadsList.filter((l) =>
                    selectedLeadIds.includes(String(l._id || l.id))
                  );
                  onOpenBulkMessage(selectedLeads);
                }}
                className="px-3 py-1 rounded-lg bg-[#e60012] hover:bg-[#c91c2f] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md animate-in fade-in"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Broadcast SMS ({selectedLeadIds.length})</span>
              </button>
            )}

            <div className="text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-3">
              <span>Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></span>
              <span>·</span>
              <span>Median first touch: <strong className="text-white">11 min</strong></span>
            </div>
          </div>
        </div>

        {/* Leads List Table */}
        <div className="divide-y divide-slate-100 min-h-[300px]">
          {isLoading && leadsList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-[#e60012] animate-spin" />
              <span>Loading prospects from Lead Centre...</span>
            </div>
          ) : leadsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching prospects found.
            </div>
          ) : (
            leadsList.map((lead, idx) => {
              const leadId = String(lead._id || lead.id || `lead-${idx}`);
              const isSelected = selectedLeadIds.includes(leadId);
              const initials =
                lead.initials ||
                (lead.name
                  ? lead.name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'PR');
              const displayVehicle = lead.vehicle || lead.model || 'BYD Vehicle';
              const displayStage = lead.stage || lead.status || 'NEW ENQUIRIES';
              const displayScore = lead.score ?? 85;
              const displaySource = lead.source || lead.platform || 'Virtual Yard';
              const displayOwner = lead.allocatedPersonFullName || lead.assignedTo || lead.consultant || 'Unassigned';

              return (
                <div
                  key={leadId}
                  className={`lead-row group ${isSelected ? 'bg-red-50/40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeadIds((prev) => [...prev, leadId]);
                      } else {
                        setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
                      }
                    }}
                    className="rounded border-slate-300 cursor-pointer mr-1"
                  />
                  {lead.priority && lead.priority !== 'Not Set' && <span className="lead-signal" />}
                  <div className="avatar-initials">{initials}</div>

                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => onSelectLead(lead)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#e60012] transition-colors">
                        {lead.name || 'Unnamed Prospect'}
                      </strong>
                      <span className={`stage-pill ${getStageColor(displayStage)}`}>
                        {displayStage}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {displayScore} PTS
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        via {displaySource}
                      </span>
                      {lead.phone && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lead.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate">{displayVehicle}</span>
                      <span>·</span>
                      <span className="text-slate-400 truncate">
                        {lead.lastTouch || (lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'Recent')}
                      </span>
                      {displayOwner && displayOwner !== 'Unassigned' && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 truncate">Owner: {displayOwner}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenMessage(lead)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      title="Send SMS / Email"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenBookDrive(lead)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      title="Book Test Drive Slot"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReassign(lead)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      title="Request Reassignment / Release to Pool"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setLostTargetLead(lead)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
                      title="Mark Lost"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          itemName="prospects"
          isLoading={isLoading}
        />
      </div>

      {/* Mark Lost Modal */}
      {lostTargetLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Opportunity Disposition</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Mark Lead as Lost · {lostTargetLead.name}
                </h3>
              </div>
              <button
                onClick={() => setLostTargetLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loss Reason Category</label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-slate-800"
                >
                  <option value="Price / Budget Discrepancy">Price / Budget Discrepancy</option>
                  <option value="Purchased Competitor (Tesla / Kia / Hyundai)">Purchased Competitor (Tesla / Kia / Hyundai)</option>
                  <option value="EV Charging / Range Concern">EV Charging / Range Concern</option>
                  <option value="Delivery Timeline Too Long">Delivery Timeline Too Long</option>
                  <option value="Finance Application Declined">Finance Application Declined</option>
                  <option value="Customer Unresponsive (Ghosted after 5+ touches)">Customer Unresponsive (Ghosted after 5+ touches)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="e.g. Bought Tesla Model Y inventory vehicle due to immediate collection requirement."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLostTargetLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkLost}
                disabled={isSubmittingLost}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
              >
                {isSubmittingLost ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserX className="w-3.5 h-3.5" />
                )}
                <span>Confirm Lost</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
