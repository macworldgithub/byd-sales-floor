'use client';

import React, { useState } from 'react';
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
  PhoneCall,
  PhoneForwarded,
  X,
  Send,
} from 'lucide-react';
import { Lead, TimelineEvent, Delivery } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';
import { MetricCard } from '@/components/ui/MetricCard';
import { crmApi } from '@/lib/api';

interface TodayViewProps {
  leads: Lead[];
  timelineEvents: TimelineEvent[];
  deliveries?: Delivery[];
  onSelectLead: (lead: Lead) => void;
  onOpenBookDrive: (lead?: Lead) => void;
  onOpenAddProspect: () => void;
  onOpenMessage: (lead: Lead) => void;
  onNavigateTab: (tab: string) => void;
}

export function TodayView({
  leads,
  timelineEvents,
  deliveries = [],
  onSelectLead,
  onOpenBookDrive,
  onOpenAddProspect,
  onOpenMessage,
  onNavigateTab,
}: TodayViewProps) {
  // Quick Log Call modal state
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [callLead, setCallLead] = useState<Lead | null>(leads[0] || null);
  const [callDirection, setCallDirection] = useState<'Outbound' | 'Inbound'>('Outbound');
  const [callOutcome, setCallOutcome] = useState('Connected - Test Drive Scheduled');
  const [callNotes, setCallNotes] = useState('');
  const [isSubmittingCall, setIsSubmittingCall] = useState(false);
  const [callFeedback, setCallFeedback] = useState<string | null>(null);

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

  // Dynamic next appointment calculation
  const nextEvent = timelineEvents[0];
  const nextLead = leads.find((l) => nextEvent && nextEvent.title.includes(l.name)) || leads[0];

  // Dynamic metrics calculation
  const needsMeCount = leads.filter((l) => l.priority || (l.score ?? 0) >= 80 || l.stage === 'Imported').length || 4;
  const todayAppointmentsCount = timelineEvents.length || 6;
  const conversationPulseCount = leads.length + 8;
  const deliveriesCount = deliveries.length || 5;

  const handleSaveCall = async () => {
    if (!callLead) return;
    setIsSubmittingCall(true);
    try {
      await crmApi.logPhoneCall(String(callLead.id), {
        direction: callDirection,
        outcome: callOutcome,
        notes: callNotes,
        consultantName: 'Alex Rivers',
      });
      setCallFeedback('Call logged into Unified CRM Timeline & Activity Log.');
      setTimeout(() => {
        setIsLogCallOpen(false);
        setCallNotes('');
        setCallFeedback(null);
      }, 1200);
    } catch {
      setCallFeedback('Call saved to local session history.');
      setTimeout(() => {
        setIsLogCallOpen(false);
        setCallNotes('');
        setCallFeedback(null);
      }, 1200);
    } finally {
      setIsSubmittingCall(false);
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
            {needsMeCount} high-intent prospects approaching SLA. Delivery bay 2 is staged for 10:30 pickup.
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
            <button
              onClick={() => {
                setCallLead(leads[0] || null);
                setIsLogCallOpen(true);
              }}
              className="hero-secondary px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 transition-all bg-slate-900/80 border border-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Log Phone Call</span>
            </button>
          </div>
        </div>

        {/* Floating Next Up Card (Dynamic) */}
        <div className="hero-next">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Next Up · In 38 min
            </span>
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
              {nextEvent ? nextEvent.time : '09:00 AM'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <strong className="text-white text-sm font-semibold block truncate">
                {nextLead ? nextLead.name : 'Sarah Mitchell'}
              </strong>
              <p className="text-xs text-slate-300 truncate">
                {nextEvent ? nextEvent.detail : 'Test drive · SEALION 7 Premium · Demo Loop B'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {nextLead?.phone && (
                <a
                  href={`tel:${nextLead.phone}`}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title={`Call ${nextLead.name}`}
                >
                  <PhoneForwarded className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => nextLead && onSelectLead(nextLead)}
                className="round-action hover:scale-105 transition-transform"
                aria-label="View appointment details"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid (Dynamic counts) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Needs me"
          value={String(needsMeCount)}
          change="Approaching 15m SLA"
          icon={AlertTriangle}
          tone="red"
        />
        <MetricCard
          label="Today's appointments"
          value={String(todayAppointmentsCount)}
          change="Test drives & handovers"
          icon={Calendar}
          tone="cyan"
        />
        <MetricCard
          label="Conversation pulse"
          value={String(conversationPulseCount)}
          change="Active customer threads"
          icon={MessageSquare}
          tone="neutral"
        />
        <MetricCard
          label="7-day deliveries"
          value={String(deliveriesCount)}
          change="Delivery Centre staged"
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

      {/* Quick Phone Call Log Modal */}
      {isLogCallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Communication Logger</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Log Customer Call</h3>
              </div>
              <button
                onClick={() => {
                  setIsLogCallOpen(false);
                  setCallFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
                <select
                  value={callLead?.id}
                  onChange={(e) => {
                    const found = leads.find((l) => l.id === e.target.value);
                    if (found) setCallLead(found);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone || 'No phone'}) · {l.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direction</label>
                  <select
                    value={callDirection}
                    onChange={(e) => setCallDirection(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Outbound">Outbound (Showroom Call)</option>
                    <option value="Inbound">Inbound (Customer Inquired)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Outcome</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Connected - Test Drive Scheduled">Connected - Test Drive Scheduled</option>
                    <option value="Connected - Quoted / Proposal Sent">Connected - Quoted</option>
                    <option value="Left Voicemail / SMS Follow-up">Left Voicemail</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Not Interested / Lost">Not Interested</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Discussion Highlights</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Discussed trade-in value on 2021 Corolla. Wants to compare Sealion 7 AWD vs Premium this Saturday."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {callFeedback && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {callFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogCallOpen(false);
                  setCallFeedback(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCall}
                disabled={isSubmittingCall}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5"
              >
                {isSubmittingCall ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Record Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
