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
  ChevronDown,
} from 'lucide-react';
import { Lead, ConversationThread } from '@/lib/types';
import { DEFAULT_TEMPLATE_PACKS, interpolateTemplate } from '@/lib/templateEngine';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  conversationMessages?: ConversationThread['messages'];
  onSendMessage: (message: string, recipientName: string) => Promise<boolean>;
}

export function MessageModal({
  isOpen,
  onClose,
  lead,
  conversationMessages = [],
  onSendMessage,
}: MessageModalProps) {
  const [recipient, setRecipient] = useState(lead ? lead.name : 'Customer');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [sending, setSending] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState('New allocation — first touch');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (lead) {
      setRecipient(lead.name);
      setPhone(lead.phone || '');
      const initialTmpl = DEFAULT_TEMPLATE_PACKS[0];
      const interpolated = interpolateTemplate(initialTmpl.body, {
        name: lead.name,
        first_name: lead.name.split(' ')[0],
        model: lead.model || lead.vehicle || 'SEALION 7',
        consultant: lead.consultant || 'Alex Morgan',
        consultant_mobile: '+61 412 890 234',
        site: 'Melbourne CBD',
      });
      setMessageText(interpolated);
    }
  }, [lead]);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplateName(templateName);
    const tmpl = DEFAULT_TEMPLATE_PACKS.find((t) => t.name === templateName);
    if (tmpl) {
      const interpolated = interpolateTemplate(tmpl.body, {
        name: recipient,
        first_name: recipient.split(' ')[0],
        model: (lead ? (lead.model || lead.vehicle) : 'SEALION 7') || 'SEALION 7',
        consultant: lead?.consultant || 'Alex Morgan',
        consultant_mobile: '+61 412 890 234',
        site: 'Melbourne CBD',
      });
      setMessageText(interpolated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !phone || !messageText.trim()) return;
    setSending(true);
    try { if (await onSendMessage(messageText, recipient)) onClose(); }
    finally { setSending(false); }
  };

  const segmentCount = Math.ceil((messageText.length || 1) / 160);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container !max-w-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="eyebrow">Compliant Outreach · MobileMessage Gateway</p>
            <h2 className="section-title text-xl">Customer SMS & Email Dispatch</h2>
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
              Recipient
            </span>
            <strong className="text-slate-900 font-semibold">{recipient}</strong>
            <span className="text-slate-500 ml-2 font-mono">({phone})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACMA Sender ID Active</span>
          </div>
        </div>

        <section aria-label="Conversation history" className="max-h-64 overflow-y-auto space-y-2">
          {conversationMessages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
          {conversationMessages.map(m => (
            <div key={m.sender + ':' + m.id} className={'rounded-lg p-3 text-sm ' + (m.sender === 'user' ? 'bg-slate-100' : 'bg-blue-50')}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className="mt-1 text-xs text-slate-500">
                {m.sender === 'user' ? 'Customer' : m.sender === 'ai' ? 'AI Assistant' : m.sender === 'system' ? 'System' : 'Team'}
                {m.time ? ' · ' + m.time : ''}{m.status ? ' · ' + m.status : ''}
              </p>
            </div>
          ))}
        </section>
        {/* 10 Standard Template Packs Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              Shipped Template Packs (§5.7 Compliant)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">10 Packs Available</span>
          </div>

          <select
            value={selectedTemplateName}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 cursor-pointer"
          >
            {DEFAULT_TEMPLATE_PACKS.map((tmpl) => (
              <option key={tmpl.name} value={tmpl.name}>
                {tmpl.name} ({tmpl.channel.toUpperCase()}) — {tmpl.trigger}
              </option>
            ))}
          </select>
        </div>

        {/* Message Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                Interpolated SMS Body (Auto-Merged)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageText.length} chars · {segmentCount} SMS {segmentCount > 1 ? 'segments' : 'segment'}
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>TLS Direct Gateway · Opt-out suppression checked</span>
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
                disabled={sending || !phone || !messageText.trim()}
                className="signal-button px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending…' : 'Send via MobileMessage'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
