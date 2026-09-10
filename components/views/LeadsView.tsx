'use client';

import React, { useState } from 'react';
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

  const stageOptions = ['All', 'Imported', 'Engaged', 'Qualified', 'Committed'];

  const filteredLeads = leads.filter((lead) => {
    const matchesStage = selectedStage === 'All' || lead.stage === selectedStage;
    const matchesSearch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));
    return matchesStage && matchesSearch;
  });

  const getStageColor = (stage: Lead['stage']) => {
    switch (stage) {
      case 'Imported':
        return 'bg-slate-100 text-slate-700';
      case 'Engaged':
        return 'bg-cyan-50 text-cyan-700';
      case 'Qualified':
        return 'bg-amber-50 text-amber-700';
      case 'Committed':
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
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
          <span>+ Add prospect</span>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, model, mobile or VIN..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="filter-scroll">
            {stageOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStage(st)}
                className={`filter-chip ${selectedStage === st ? 'active' : ''}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Summary Strip */}
        <div className="leads-summary">
          <span>Active Pipeline · {filteredLeads.length} Prospects</span>
          <div className="text-[11px] font-mono text-slate-300">
            Median first touch: <strong className="text-white">11 min</strong> (SLA: &lt;15M)
          </div>
        </div>

        {/* Leads List Table */}
        <div className="divide-y divide-slate-100">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching prospects found.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="lead-row group"
              >
                {lead.priority && <span className="lead-signal" />}
                <div className="avatar-initials">{lead.initials}</div>

                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#e60012] transition-colors">
                      {lead.name}
                    </strong>
                    <span className={`stage-pill ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {lead.score} PTS
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      via {lead.source}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 truncate">{lead.model}</span>
                    <span>·</span>
                    <span className="text-slate-400 truncate">{lead.lastTouch}</span>
                    {lead.consultant && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500 truncate">Owner: {lead.consultant}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (
                        lead.action === 'Reply now' ||
                        lead.action === 'Send follow-up' ||
                        lead.action === 'Make first touch'
                      ) {
                        onOpenMessage(lead);
                      } else if (lead.action === 'Book drive') {
                        onOpenBookDrive(lead);
                      } else {
                        onSelectLead(lead);
                      }
                    }}
                    className="status-chip hover:border-slate-400 transition-colors"
                  >
                    <span>{lead.action}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
