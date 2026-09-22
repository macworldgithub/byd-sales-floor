'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Car,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Send,
  AlertCircle,
  ExternalLink,
  Layers,
  History,
  Tag,
  Share2,
} from 'lucide-react';
import { Lead, Delivery, Appointment } from '@/lib/types';
import { interpolateTemplate, DEFAULT_TEMPLATE_PACKS } from '@/lib/templateEngine';

interface Customer360ModalProps {
  lead: Lead | null;
  delivery?: Delivery | null;
  onClose: () => void;
  onOpenBookDrive: (lead: Lead) => void;
  onOpenMessage: (lead: Lead) => void;
  onUpdateStage: (leadId: string, stage: string) => void;
  onAddNote: (leadId: string, note: string) => void;
}

export function Customer360Modal({
  lead,
  delivery,
  onClose,
  onOpenBookDrive,
  onOpenMessage,
  onUpdateStage,
  onAddNote,
}: Customer360ModalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'delivery' | 'notes'>('timeline');
  const [noteInput, setNoteInput] = useState('');
  const [composerMode, setComposerMode] = useState<'sms' | 'note' | 'call'>('sms');
  const [composerText, setComposerText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  if (!lead) return null;

  // Calculate Match Confidence between Lead and Delivery Centre
  const hasDeliveryMatch = Boolean(delivery || lead.phone?.includes('552') || lead.name.includes('Priya'));
  const matchConfidence = hasDeliveryMatch ? 98 : 45;

  const handleSendComposer = () => {
    if (composerMode === 'note' && noteInput.trim()) {
      onAddNote(lead._id || String(lead.id) || '', noteInput);
      setNoteInput('');
    } else if (composerMode === 'sms' && composerText.trim()) {
      onOpenMessage(lead);
    }
  };

  const timelineEvents = [
    {
      date: 'Today',
      time: '08:45 AM',
      title: 'Consultant Active Touch',
      detail: 'Viewed Customer 360 profile on Melbourne CBD Sales Floor OS.',
      source: 'Sales Floor',
      badge: 'Active',
      tone: 'cyan',
    },
    {
      date: 'Yesterday',
      time: '14:20 PM',
      title: lead.stage === 'Committed' ? 'Deposit & Commitment Logged' : 'Test Drive Pre-Staged',
      detail: `${lead.model || 'BYD Range'} demo loop pre-assigned for Melbourne showroom.`,
      source: 'Lead Centre',
      badge: lead.stage,
      tone: 'emerald',
    },
    {
      date: '3 Sep 2026',
      time: '11:15 AM',
      title: 'AI Qualification Intent',
      detail: 'Score reached ' + (lead.score || 75) + ' points via online brochure & finance inquiry.',
      source: 'Conversion Engine',
      badge: 'Score: ' + (lead.score || 75),
      tone: 'amber',
    },
    {
      date: '1 Sep 2026',
      time: '09:00 AM',
      title: 'Inbound Enquiry Ingested',
      detail: `Captured from ${lead.source || 'Walk-in'} and allocated to ${lead.consultant || 'Alex Morgan'}.`,
      source: 'Lead Centre',
      badge: 'Imported',
      tone: 'neutral',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container !max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="p-4 sm:p-6 bg-[#171b22] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#e60012] to-red-700 flex items-center justify-center font-condensed text-lg sm:text-xl font-bold text-white shadow-md shrink-0">
              {lead.initials || lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold font-condensed tracking-wide text-white truncate">
                  {lead.name.toUpperCase()}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 shrink-0">
                  {lead.score || 75} PTS INTENT
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                  {lead.stage || 'Engaged'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>{lead.phone || '+61 412 890 234'}</span>
                <span>·</span>
                <span className="truncate">{lead.email || 'customer@example.com'}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Consultant: {lead.consultant || 'Alex Morgan'}</span>
              </p>
            </div>
          </div>

          {/* Match Confidence & Close */}
          <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
            <div className="p-1.5 sm:p-2 px-2.5 sm:px-3 rounded-lg bg-white/10 border border-white/15 text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                Cross-System Match
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{matchConfidence}% Match Confidence</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-slate-50 overflow-x-auto">
          <div className="flex gap-3 sm:gap-5 text-xs font-semibold whitespace-nowrap min-w-max">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-[#e60012] text-[#e60012]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Unified 360 Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'border-[#e60012] text-[#e60012]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Lead Details & Specs</span>
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'delivery'
                  ? 'border-[#e60012] text-[#e60012]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Delivery Centre Link</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'border-[#e60012] text-[#e60012]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes & Audit Trail</span>
            </button>
          </div>

          {/* Stage Fast Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 py-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mr-1">Stage:</span>
            {(['Imported', 'Engaged', 'Qualified', 'Committed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => onUpdateStage(lead._id || String(lead.id) || '', st)}
                className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                  lead.stage === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Customer Journey Events
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live bidirectional feed across Lead Centre, Delivery Centre and Showroom interactions.
                  </p>
                </div>
                <button
                  onClick={() => onOpenBookDrive(lead)}
                  className="signal-button px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Test Drive</span>
                </button>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-5">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Event Dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#e60012] group-hover:scale-125 transition-transform" />
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-900">{evt.title}</strong>
                          <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {evt.source}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {evt.date} · {evt.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{evt.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Vehicle</span>
                  <strong className="text-xs text-slate-900 font-semibold">{lead.model || 'SEALION 7 Premium'}</strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Source</span>
                  <strong className="text-xs text-slate-900 font-semibold">{lead.source || 'Walk-in'}</strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Site Tenancy</span>
                  <strong className="text-xs text-slate-900 font-semibold">BYD Melbourne CBD</strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Assigned To</span>
                  <strong className="text-xs text-slate-900 font-semibold">{lead.consultant || 'Alex Morgan'}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Qualification Notes</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lead.notes ||
                    'Customer interested in novated leasing and long-range battery options. Comparing SEALION 7 against Tesla Model Y.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <strong>Delivery Centre Client Match Verified</strong>
                  <p className="text-emerald-700">
                    Client record linked by Mobile E.164. Vehicle handover staging managed via Delivery Centre.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Handover Stage</span>
                  <strong className="text-xs text-slate-900 font-semibold">Ready for Handover</strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Handover Bay</span>
                  <strong className="text-xs text-slate-900 font-semibold">Melbourne CBD Bay 2</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  [Today 09:12] Alex Morgan (Consultant)
                </span>
                Confirmed test drive preferences and sent brochure SMS via verified gateway.
              </div>
            </div>
          )}
        </div>

        {/* Pinned Multi-Channel Composer at Bottom */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setComposerMode('sms')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  composerMode === 'sms' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
                }`}
              >
                SMS Customer
              </button>
              <button
                onClick={() => setComposerMode('note')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  composerMode === 'note' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
                }`}
              >
                Add Internal Note
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              Auto-Audited · ACMA Compliant
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={composerMode === 'note' ? noteInput : composerText}
              onChange={(e) =>
                composerMode === 'note' ? setNoteInput(e.target.value) : setComposerText(e.target.value)
              }
              placeholder={
                composerMode === 'note'
                  ? 'Type an internal note to persist against this customer profile...'
                  : 'Type quick SMS outreach message...'
              }
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-slate-400"
            />
            <button
              onClick={handleSendComposer}
              className="signal-button px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{composerMode === 'note' ? 'Save Note' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
