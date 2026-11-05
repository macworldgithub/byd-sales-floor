'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Calendar, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { TimelineEvent } from '@/lib/types';
import { melbourneDay } from '@/lib/floorCalendar';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (evt: TimelineEvent) => Promise<void>;
  initialDate?: string;
}

export function AddEventModal({
  isOpen,
  onClose,
  onAddEvent,
  initialDate,
}: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState<TimelineEvent['type']>('followup');
  const [date, setDate] = useState(initialDate || melbourneDay());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef('');
  const [time, setTime] = useState('11:00');
  const [end, setEnd] = useState('11:45');
  useEffect(() => {
    if (isOpen) { setDate(initialDate || melbourneDay()); setError(''); requestId.current = crypto.randomUUID(); }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try { await onAddEvent({
      bookingRequestId: requestId.current,
      date,
      title: title || 'New Appointment',
      detail,
      type,
      time,
      end,
    });
    onClose(); } catch (error: any) { setError(error.message || 'Event could not be saved.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="eyebrow">Floor Calendar</p>
            <h2 className="section-title text-xl"> Add Floor Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <label className="block text-sm">Date<input aria-label="Event date" required type="date" className="block border rounded-lg p-2" value={date} onChange={event => setDate(event.target.value)} /></label>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VIP Walk-in · Robert Kelly"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Event Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TimelineEvent['type'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 outline-none"
              >
                <option value="delivery">Handover / Delivery</option>
                <option value="followup">Customer Follow-up</option>
                <option value="hold">Personal Hold / Duty</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:00"
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="10:00"
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
              Event Details / Vehicle / Location
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. SEALION 7 · Demo Loop A · Staged Bay 1"
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
              disabled={saving}
              className="signal-button px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
