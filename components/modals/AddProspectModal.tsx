'use client';

import React, { useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Lead } from '@/lib/types';

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'initials'>) => void;
}

export function AddProspectModal({
  isOpen,
  onClose,
  onAddLead,
}: AddProspectModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('SEALION 7 Premium');
  const [stage, setStage] = useState<Lead['stage']>('Engaged');
  const [source, setSource] = useState('Walk-in');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [score, setScore] = useState(75);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      name: name || 'New Customer',
      model,
      stage,
      source,
      phone: phone || '+61 400 123 456',
      email: email || 'prospect@example.com',
      score: Number(score) || 70,
      lastTouch: 'Just now',
      action: 'Make first touch',
      priority: score >= 80,
      notes,
    });
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
            <p className="eyebrow">Prospect Intake</p>
            <h2 className="section-title text-xl"> Add New Prospect</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="SEAL Premium">SEAL Premium</option>
                <option value="ATTO 3 Extended">ATTO 3 Extended</option>
                <option value="DOLPHIN Premium">DOLPHIN Premium</option>
                <option value="SHARK 6">SHARK 6</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                <option value="Carsales">Carsales Inbound</option>
                <option value="Web">BYD Official Web</option>
                <option value="Autogate">Autogate Lead Feed</option>
                <option value="Referral">Customer Referral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Lead['stage'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 outline-none"
              >
                <option value="Imported">Imported</option>
                <option value="Engaged">Engaged</option>
                <option value="Qualified">Qualified</option>
                <option value="Committed">Committed</option>
              </select>
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
              Notes & Specific Requirements
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Trade-in details, finance preferences, timeline..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
