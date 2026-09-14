'use client';

import React from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  Calendar,
  MessageSquare,
  Car,
  ArrowRight,
  Plus,
  Compass,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Lead, TimelineEvent } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';
import { MetricCard } from '@/components/ui/MetricCard';

interface TodayViewProps {
  leads: Lead[];
  timelineEvents: TimelineEvent[];
  onSelectLead: (lead: Lead) => void;
  onOpenBookDrive: (lead?: Lead) => void;
  onOpenAddProspect: () => void;
  onOpenMessage: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
}

export function TodayView({
  leads,
  timelineEvents,
  onSelectLead,
  onOpenBookDrive,
  onOpenAddProspect,
  onOpenMessage,
  onNavigateTab,
}: TodayViewProps) {
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

  const getEventDotClass = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'drive':
        return 'event-drive';
      case 'delivery':
        return 'event-delivery';
      case 'followup':
        return 'event-followup';
      case 'hold':
        return 'event-hold';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="view-stack">
      {/* Hero Panel */}
      <section className="hero-panel">
        <img
          src={ASSET_PATHS.hero}
          alt="BYD Melbourne CBD Showroom Floor"
          className="w-full h-full object-cover"
        />
        <div className="hero-shade" />

        <div className="hero-content">
          <p className="eyebrow text-slate-300">MELBOURNE CBD · MON 8 SEP</p>
          <h1>
            YOUR FLOOR, <span className="text-[#ff6c5e]">IN MOTION.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 max-w-lg leading-relaxed">
            4 high-intent prospects approaching SLA. Delivery bay 2 is staged for 10:30 pickup.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onOpenBookDrive()}
              className="signal-button px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book test drive</span>
            </button>
            <button
              onClick={onOpenAddProspect}
              className="hero-secondary px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add prospect</span>
            </button>
          </div>
        </div>

        {/* Floating Next Up Card */}
        <div className="hero-next">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Next Up · In 38 min
            </span>
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
              09:00 AM
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <strong className="text-white text-sm font-semibold block truncate">
                Sarah Mitchell
              </strong>
              <p className="text-xs text-slate-300 truncate">
                Test drive · SEALION 7 Premium · Demo Loop B
              </p>
            </div>
            <button
              onClick={() => {
                const sarah = leads.find((l) => l.name.includes('Sarah')) || leads[0];
                onSelectLead(sarah);
              }}
              className="round-action hover:scale-105 transition-transform"
              aria-label="View Sarah Mitchell details"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Needs me"
          value="4"
          change="2 approaching SLA"
          icon={AlertTriangle}
          tone="red"
        />
        <MetricCard
          label="Today's appointments"
          value="6"
          change="3 test drives · 1 delivery"
          icon={Calendar}
          tone="cyan"
        />
        <MetricCard
          label="Conversation pulse"
          value="18"
          change="12 outbound · 6 inbound"
          icon={MessageSquare}
          tone="neutral"
        />
        <MetricCard
          label="7-day deliveries"
          value="5"
          change="2 ready for handover"
          icon={Car}
          tone="green"
        />
      </section>

      {/* Two Column Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Priority Queue (7 cols) */}
        <div className="surface-card lg:col-span-7">
          <div className="card-header-row">
            <div>
              <p className="eyebrow">Priority Queue</p>
              <h2 className="section-title">Needs your attention</h2>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-link"
            >
              <span>View live book ({leads.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {leads.slice(0, 5).map((lead) => (
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
                  <div className="flex items-center gap-2">
                    <strong className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#e60012] transition-colors">
                      {lead.name}
                    </strong>
                    <span className={`stage-pill ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {lead.score} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="truncate">{lead.model}</span>
                    <span>·</span>
                    <span className="truncate text-slate-400">{lead.lastTouch}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (lead.action === 'Reply now' || lead.action === 'Send follow-up' || lead.action === 'Make first touch') {
                        onOpenMessage(lead);
                      } else if (lead.action === 'Book drive') {
                        onOpenBookDrive(lead);
                      } else if (lead.action === 'View delivery') {
                        onNavigateTab('deliveries');
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
            ))}
          </div>
        </div>

        {/* Day Rhythm & Handover (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          {/* Day Rail */}
          <div className="surface-card">
            <div className="card-header-row">
              <div>
                <p className="eyebrow">Day Rail</p>
                <h2 className="section-title">Today's rhythm</h2>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-link"
              >
                <span>Open calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-1">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="mini-event">
                  <div className="mini-time">{evt.time}</div>
                  <div className={`event-dot ${getEventDotClass(evt.type)}`} />
                  <div className="min-w-0">
                    <strong className="text-xs md:text-sm font-semibold text-slate-900 block truncate">
                      {evt.title}
                    </strong>
                    <p className="text-[11px] text-slate-500 truncate">{evt.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Spotlight Tile */}
          <div
            onClick={() => onNavigateTab('deliveries')}
            className="delivery-tile group cursor-pointer"
          >
            <img
              src={ASSET_PATHS.delivery}
              alt="BYD Handover Bay"
              className="group-hover:scale-105 transition-transform duration-500"
            />
            <div className="delivery-overlay">
              <span className="stage-pill bg-emerald-500 text-white w-fit mb-1.5 shadow-sm">
                Ready for Handover
              </span>
              <h3 className="font-condensed text-xl font-semibold text-white">
                Priya Nair · ATTO 3 Extended
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Delivery bay 2 · Today at 10:30 AM · Handover lead: Sophie Tran
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
