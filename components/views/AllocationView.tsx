'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Lead, ConsultantCapacity } from '@/lib/types';
import { CONSULTANT_CAPACITIES } from '@/lib/data';
import { Pagination } from '@/components/ui/Pagination';

interface AllocationViewProps {
  unassignedLeads: Lead[];
  onAssignLead: (leadId: number | string, consultantName: string) => void;
}

export function AllocationView({
  unassignedLeads,
  onAssignLead,
}: AllocationViewProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4;

  const totalPages = Math.ceil(unassignedLeads.length / pageSize);
  const paginatedUnassigned = unassignedLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDropConsultant, setActiveDropConsultant] = useState<string | null>(null);
  const [allocationToast, setAllocationToast] = useState<string | null>(null);

  const handleDropOnConsultant = (consultantName: string) => {
    if (!draggedLeadId) return;
    onAssignLead(draggedLeadId, consultantName);
    setAllocationToast(`Lead assigned to ${consultantName} via Drag-and-Drop.`);
    setDraggedLeadId(null);
    setActiveDropConsultant(null);
    setTimeout(() => setAllocationToast(null), 2500);
  };

  return (
    <div className="view-stack">
      {/* Toast Feedback */}
      {allocationToast && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in">
          {allocationToast}
        </div>
      )}

      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Manager Console</p>
          <h1 className="page-title">LEAD ALLOCATION · CAPACITY ENGINE</h1>
          <p className="page-subtitle">
            Balance incoming Carsales, Web and Walk-in enquiries dynamically. Drag leads onto available consultants or use 1-tap quick assignment.
          </p>
        </div>

        <div className="connection-pill online">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-Routing Active</span>
        </div>
      </div>

      {/* Allocation Grid */}
      <div className="allocation-grid">
        {/* Left Column: Unassigned Inbound Queue */}
        <div className="surface-card overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="eyebrow">Pending Allocation</p>
                <h3 className="section-title text-xl">Unassigned Queue</h3>
              </div>
              <div className="queue-count">{unassignedLeads.length}</div>
            </div>

            <div className="space-y-3">
              {unassignedLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All incoming leads are currently allocated.
                </div>
              ) : (
                paginatedUnassigned.map((lead) => {
                  const leadId = String(lead._id || lead.id || '');
                  return (
                    <div
                      key={lead.id}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedLeadId(leadId);
                        e.dataTransfer.setData('text/plain', leadId);
                      }}
                      onDragEnd={() => setDraggedLeadId(null)}
                      className={`p-4 rounded-xl border bg-slate-50 space-y-3 transition-all cursor-grab active:cursor-grabbing hover:border-slate-400 hover:shadow-xs ${
                        draggedLeadId === leadId ? 'opacity-50 border-dashed border-red-400 bg-red-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="avatar-initials bg-white">{lead.initials}</div>
                          <div>
                            <strong className="text-sm text-slate-900 block font-semibold">
                              {lead.name}
                            </strong>
                            <span className="text-xs text-slate-500 block font-medium">
                              {lead.model} · via {lead.source}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-condensed">
                          <span className="text-lg font-bold text-[#e60012] block">
                            {lead.score} PTS
                          </span>
                          <small className="text-[10px] text-slate-400 uppercase font-mono">
                            Intent
                          </small>
                        </div>
                      </div>

                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Allocated recently · Drag to assign</span>
                      </div>

                      {/* Quick Assign Buttons */}
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Assign to available consultant:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onAssignLead(leadId, 'Lena Park')}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors shadow-xs"
                          >
                            <span>Lena Park (46%)</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                          <button
                            onClick={() => onAssignLead(leadId, 'Alex Morgan')}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors shadow-xs"
                          >
                            <span>Alex Morgan (72%)</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Bar */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={unassignedLeads.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="unassigned leads"
          />
        </div>

        {/* Right Column: Consultant Capacities & Dropzones */}
        <div className="space-y-4">
          <div className="surface-card p-5 space-y-4">
            <div className="card-header-row !p-0 !pb-4">
              <div>
                <p className="eyebrow">Floor Load Distribution</p>
                <h2 className="section-title">Sales Consultant Capacity</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                DRAG & DROP READY
              </span>
            </div>

            <div className="space-y-4">
              {CONSULTANT_CAPACITIES.map((c) => {
                const isHigh = c.capacityPct > 80;
                const isOptimal = c.capacityPct >= 60 && c.capacityPct <= 80;
                const barColor = isHigh
                  ? 'bg-[#e60012]'
                  : isOptimal
                  ? 'bg-slate-900'
                  : 'bg-emerald-500';

                const isDragOver = activeDropConsultant === c.name;

                return (
                  <div
                    key={c.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setActiveDropConsultant(c.name);
                    }}
                    onDragLeave={() => setActiveDropConsultant(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnConsultant(c.name);
                    }}
                    className={`consultant-dropzone transition-all ${
                      isDragOver
                        ? 'border-2 border-dashed border-[#e60012] bg-red-50/40 scale-[1.02] shadow-md'
                        : 'border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar-initials bg-slate-900 text-white font-bold">
                        {c.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-semibold text-slate-900">{c.name}</strong>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {c.leadsCount} ACTIVE LEADS
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{c.status}</p>
                      </div>
                      {isDragOver && (
                        <span className="text-[11px] font-bold text-[#e60012] font-mono animate-bounce">
                          Drop to Assign
                        </span>
                      )}
                    </div>

                    <div className="capacity-block">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500">Floor Load</span>
                        <span className="font-mono text-slate-900">{c.capacityPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${c.capacityPct}%` }}
                        />
                      </div>
                    </div>

                    {c.warning && (
                      <div className="capacity-warning">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{c.warning}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
