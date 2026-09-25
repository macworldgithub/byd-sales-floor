'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Camera,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { searchApi, messageApi } from '@/lib/api';

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'initials'>) => void;
  onOpenExisting?: (lead: any) => void;
}

export function AddProspectModal({
  isOpen,
  onClose,
  onAddLead,
  onOpenExisting,
}: AddProspectModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('SEALION 7 Premium');
  const [stage, setStage] = useState<Lead['stage']>('Engaged');
  const [source, setSource] = useState('Walk-in');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [score, setScore] = useState(80);
  const [notes, setNotes] = useState('');

  // Scope §5.1: Instant Walk-in SMS & Test Drive attachments
  const [sendInstantSms, setSendInstantSms] = useState(true);
  const [attachTestDrive, setAttachTestDrive] = useState(false);
  const [cardUploaded, setCardUploaded] = useState<string | null>(null);

  // Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    found: boolean;
    matchType?: string;
    record?: any;
    message?: string;
  }>({ found: false });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  if (!isOpen) return null;

  const handleCheckDuplicate = async () => {
    if (!phone && !email) return;
    setIsCheckingDuplicate(true);
    try {
      const res = await searchApi.checkDuplicate(phone, email);
      if (res.success && res.data && res.data.duplicate) {
        setDuplicateWarning({
          found: true,
          matchType: res.data.matchType,
          record: res.data.matchRecord,
          message: res.data.message || res.message,
        });
      } else {
        setDuplicateWarning({ found: false });
      }
    } catch {
      // Ignore network errors in duplicate check
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCardUploaded(file.name);
      // Mock OCR card parse
      if (!name) setName('Marcus Vance');
      if (!phone) setPhone('+61 422 189 004');
      if (!email) setEmail('m.vance@solardrive.com.au');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newLead = {
      name: name || 'New Customer',
      model,
      stage,
      source,
      phone: phone || '+61 400 123 456',
      email: email || 'prospect@example.com',
      score: Number(score) || 75,
      lastTouch: 'Just now',
      action: attachTestDrive ? 'Book drive' : 'Make first touch',
      priority: score >= 80,
      notes: `${notes}${cardUploaded ? ` · [Scanned Card: ${cardUploaded}]` : ''}`,
    };

    onAddLead(newLead);

    // If instant SMS requested and phone present, fire outbound welcome
    if (sendInstantSms && phone) {
      try {
        await messageApi.sendMessage({
          phone: phone,
          client_name: name,
          body: `Hi ${name.split(' ')[0]}, thank you for visiting BYD Melbourne CBD today! It was great meeting you to explore the ${model}. Let me know if you need any specs or pricing. - Alex Rivers, BYD Southport/Melbourne`,
        });
      } catch {}
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container p-6 space-y-4 max-w-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="eyebrow">Prospect Intake · Showroom Quick Capture</p>
            <h2 className="section-title text-xl">Add New Prospect</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Card OCR Quick Upload */}
        <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Scan Business Card</p>
              <p className="text-[11px] text-slate-500">Auto-fill name, phone, and company email</p>
            </div>
          </div>
          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
            <span>{cardUploaded ? 'Card Scanned ✓' : 'Upload Card Photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleCardUpload} />
          </label>
        </div>

        {/* Duplicate Guard Banner */}
        {duplicateWarning.found && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-semibold block">Possible Duplicate Detected</strong>
                <p className="text-amber-700 mt-0.5">{duplicateWarning.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenExisting && duplicateWarning.record) {
                    onOpenExisting(duplicateWarning.record);
                  }
                }}
                className="px-3 py-1 rounded bg-amber-200/80 hover:bg-amber-300 font-semibold text-amber-900 flex items-center gap-1 transition-colors"
              >
                <span>Open Existing Record</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setDuplicateWarning({ found: false })}
                className="px-2 py-1 text-amber-700 hover:text-amber-900 text-[11px]"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Hayes"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Vehicle Interest
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 outline-none"
              >
                <option value="SEALION 7 Premium">SEALION 7 Premium</option>
                <option value="SEALION 7 AWD">SEALION 7 AWD</option>
                <option value="SEAL Premium">SEAL Premium</option>
                <option value="SEAL Performance">SEAL Performance</option>
                <option value="ATTO 3 Extended">ATTO 3 Extended</option>
                <option value="DOLPHIN Premium">DOLPHIN Premium</option>
                <option value="SHARK 6 PHEV">SHARK 6 PHEV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Phone Number (Duplicate Protected)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleCheckDuplicate}
                placeholder="+61 412 000 111"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Acquisition Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 outline-none"
              >
                <option value="Walk-in">Walk-in Showroom</option>
                <option value="Autogate">Autogate Lead Feed</option>
                <option value="Carsales">Carsales Inbound</option>
                <option value="Web">BYD Official Web</option>
                <option value="Phone Inbound">Phone Inbound</option>
                <option value="OEM Campaign">OEM Campaign</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleCheckDuplicate}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Intent Score (0 - 100)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
              Notes & Trade-in Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Trade-in details, financing timeframe, test drive feedback..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          {/* Quick Automation Flags */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInstantSms}
                onChange={(e) => setSendInstantSms(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Send Walk-In Thank You SMS immediately (15-min SLA compliance)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={attachTestDrive}
                onChange={(e) => setAttachTestDrive(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Attach Immediate Test Drive Staging slot
              </span>
            </label>
          </div>

          {/* Privacy Act Collection Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-snug flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Act 1988 (Cth) Notice:</strong> Personal details are collected in accordance with Australian Privacy Principles (APPs) to manage test drive insurance, vehicle enquiries and sales operations.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
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
              <UserPlus className="w-4 h-4" />
              <span>Save & Log Prospect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
