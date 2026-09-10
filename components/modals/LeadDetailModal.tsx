'use client';

import React from 'react';
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
  TrendingUp,
} from 'lucide-react';
import { Lead } from '@/lib/types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onOpenBookDrive: (lead: Lead) => void;
  onOpenMessage: (lead: Lead) => void;
  onUpdateStage: (leadId: number, stage: Lead['stage']) => void;
}

export function LeadDetailModal({
  lead,
  onClose,
  onOpenBookDrive,
  onOpenMessage,
  onUpdateStage,
}: LeadDetailModalProps) {
  if (!lead) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="avatar-initials text-base font-bold bg-slate-900 text-white">
              {lead.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
                <span className="text-xs font-bold text-[#e60012] bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono">
                  {lead.score} PTS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Acquired via {lead.source} · {lead.lastTouch}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Pipeline Stage
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(['Imported', 'Engaged', 'Qualified', 'Committed'] as Lead['stage'][]).map(
              (st) => {
                const isSelected = lead.stage === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStage(lead.id, st)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {st}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Customer Details Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
              Vehicle Interest
            </span>
            <strong className="text-xs text-slate-900 block font-semibold mt-0.5">
              {lead.model}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
              Lead Consultant
            </span>
            <strong className="text-xs text-slate-900 block font-semibold mt-0.5">
              {lead.consultant || 'Unassigned'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
              Phone Number
            </span>
            <strong className="text-xs text-slate-900 block font-semibold mt-0.5">
              {lead.phone || '+61 412 890 234'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
              Email Address
            </span>
            <strong className="text-xs text-slate-900 block font-semibold mt-0.5 truncate">
              {lead.email || 'customer@example.com'}
            </strong>
          </div>
        </div>

        {/* Qualification & Notes */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Consultant Notes & History
          </p>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {lead.notes ||
              'High engagement logged on web configurator. Requested information on Novated Lease vs standard finance on BYD range.'}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onOpenMessage(lead);
            }}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send SMS</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBookDrive(lead);
            }}
            className="signal-button px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Test Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
