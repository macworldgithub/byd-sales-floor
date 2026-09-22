'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Pagination } from '@/components/ui/Pagination';
import { leadApi } from '@/lib/api';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddProspect: () => void;
  onOpenBookDrive: (lead?: Lead) => void;
  onOpenMessage: (lead: Lead) => void;
}

export function LeadsView({
  leads,
  onSelectLead,
  onOpenAddProspect,
  onOpenBookDrive,
  onOpenMessage,
}: LeadsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);
  const [totalItems, setTotalItems] = useState<number>(leads.length || 0);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil((leads.length || 1) / 30));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageSize = 30;

  const stageOptions = [
    'All',
    'TEST DRIVE BOOKED',
    'NEW ENQUIRIES',
    'Imported',
    'Engaged',
    'Qualified',
    'Committed',
  ];

  // Fetch leads with server-side pagination and filters
  const fetchLeads = useCallback(async (page: number, stage: string, query: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };
      if (stage && stage !== 'All') {
        params.stage = stage;
      }
      if (query.trim()) {
        params.q = query.trim();
      }

      const res = await leadApi.getLeads(params);
      if (res.success && res.data) {
        setLeadsList(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
          setTotalPages(res.pagination.pages || Math.ceil(res.pagination.total / pageSize) || 1);
        } else {
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch leads page:', err);
      // Fallback to filtering local prop
      const filtered = leads.filter((l) => {
        const matchStage = stage === 'All' || l.stage === stage;
        const matchQ =
          !query ||
          (l.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (l.vehicle || l.model || '').toLowerCase().includes(query.toLowerCase()) ||
          (l.phone && l.phone.includes(query));
        return matchStage && matchQ;
      });
      setLeadsList(filtered.slice((page - 1) * pageSize, page * pageSize));
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    } finally {
      setIsLoading(false);
    }
  }, [leads, pageSize]);

  // Trigger fetch whenever page, stage, or debounced search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(currentPage, selectedStage, searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, selectedStage, searchQuery, fetchLeads]);

  // Sync with prop when prop changes if no search active
  useEffect(() => {
    if (leads.length > 0 && !searchQuery && selectedStage === 'All' && currentPage === 1) {
      setLeadsList(leads);
      setTotalItems(leads.length);
      setTotalPages(Math.ceil(leads.length / pageSize) || 1);
    }
  }, [leads, searchQuery, selectedStage, currentPage, pageSize]);

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
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
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Prospect Pipeline</p>
          <h1 className="page-title">LEAD CENTRE · LIVE BOOK</h1>
          <p className="page-subtitle">
            Real-time incoming enquiries, qualification stages, and intent scoring across Melbourne CBD inventory.
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
        <div className="filter-bar">
          <div className="search-field">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by customer, model, mobile or VIN..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="filter-scroll">
            {stageOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStageSelect(st)}
                className={`filter-chip ${selectedStage === st ? 'active' : ''}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Summary Strip */}
        <div className="leads-summary">
          <span>
            Active Pipeline · <strong className="text-white">{totalItems.toLocaleString()}</strong> Prospects
          </span>
          <div className="text-[11px] font-mono text-slate-300 flex items-center gap-3">
            <span>Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></span>
            <span>·</span>
            <span>Median first touch: <strong className="text-white">11 min</strong></span>
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
              const leadId = lead._id || lead.id || `lead-${idx}`;
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
                  className="lead-row group"
                >
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const action = lead.action;
                        if (
                          action === 'Reply now' ||
                          action === 'Send follow-up' ||
                          action === 'Make first touch'
                        ) {
                          onOpenMessage(lead);
                        } else if (action === 'Book drive' || displayStage.includes('TEST DRIVE')) {
                          onOpenBookDrive(lead);
                        } else {
                          onOpenMessage(lead);
                        }
                      }}
                      className="status-chip hover:border-slate-400 transition-colors"
                    >
                      <span>{lead.action || (displayStage.includes('TEST DRIVE') ? 'Test Drive' : 'Message')}</span>
                      <ArrowRight className="w-3 h-3" />
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
    </div>
  );
}

