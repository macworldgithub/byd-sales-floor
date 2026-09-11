'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { QUICK_TEMPLATES } from '@/lib/data';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSendMessage: (message: string, recipientName: string) => void;
}

export function MessageModal({
  isOpen,
  onClose,
  lead,
  onSendMessage,
}: MessageModalProps) {
  const [recipient, setRecipient] = useState(lead ? lead.name : 'Sarah Mitchell');
  const [phone, setPhone] = useState(lead?.phone || '+61 412 890 234');
  const [messageText, setMessageText] = useState(
    `Hi ${lead ? lead.name.split(' ')[0] : 'Sarah'}, thank you for enquiring with BYD Melbourne CBD. Looking forward to our appointment.`
  );

  useEffect(() => {
    if (lead) {
      setRecipient(lead.name);
      setPhone(lead.phone || '+61 412 890 234');
      setMessageText(
        `Hi ${lead.name.split(' ')[0]}, thank you for enquiring about the BYD ${lead.model} with BYD Melbourne CBD. I would love to answer any questions or arrange a private demonstration drive. — Alex Morgan`
      );
    }
  }, [lead]);

  if (!isOpen) return null;

  const handleApplyTemplate = (templateText: string) => {
    const customerFirstName = recipient.split(' ')[0] || 'there';
    const modelName = (lead ? (lead.model || lead.vehicle) : 'SEALION 7') || 'SEALION 7';
    const formatted = templateText
      .replace(/\[Name\]/g, customerFirstName)
      .replace(/\[Model\]/g, modelName)
      .replace(/\[Time\]/g, '09:00 AM');
    setMessageText(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(messageText, recipient);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="eyebrow">Direct Outreach</p>
            <h2 className="section-title text-xl">Compliant Customer Messaging</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Header Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
              Sending to
            </span>
            <strong className="text-slate-900 font-semibold">{recipient}</strong>
            <span className="text-slate-500 ml-2 font-mono">({phone})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spam Act Opt-Out Compliant</span>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
            Pre-Approved Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.text)}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-left text-[11px] font-semibold text-slate-700 transition-colors shadow-xs line-clamp-1"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                SMS Content
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageText.length} / 160 (1 SMS segment)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>TLS encrypted direct gateway</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="signal-button px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via Telstra / Twilio</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
