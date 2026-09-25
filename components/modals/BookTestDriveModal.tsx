'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Lead } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';
import { appointmentApi } from '@/lib/api';

interface BookTestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onConfirmBooking: (data: {
    customerName: string;
    model: string;
    loop: string;
    time: string;
    date: string;
  }) => void;
}

const VEHICLE_OPTIONS = [
  'SEALION 7 Premium · Vehicle 03',
  'SEALION 7 AWD · Vehicle 01',
  'SEAL Premium · Vehicle 02',
  'SEAL Performance · Vehicle 05',
  'ATTO 3 Extended · Vehicle 04',
  'DOLPHIN Premium · Vehicle 06',
  'SHARK 6 PHEV · Vehicle 07',
];

const TIME_SLOTS = ['09:00', '10:00', '11:30', '13:15', '14:30', '15:45', '17:00'];
const DURATION_OPTIONS = ['30 minutes', '45 minutes', '60 minutes', '90 minutes'];
const LOCATION_OPTIONS = ['Demo loop A (Highway & CBD)', 'Demo loop B (Urban Dynamic)', 'Demo loop C (Suburban)', 'Custom Route'];

export function BookTestDriveModal({
  isOpen,
  onClose,
  lead,
  onConfirmBooking,
}: BookTestDriveModalProps) {
  const [customerName, setCustomerName] = useState(lead?.name ?? '');
  const [vehicle, setVehicle] = useState('SEALION 7 Premium · Vehicle 03');
  const [selectedSlot, setSelectedSlot] = useState('13:15');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('45 minutes');
  const [location, setLocation] = useState('Demo loop B (Urban Dynamic)');
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  useEffect(() => {
    if (lead?.name) setCustomerName(lead.name);
  }, [lead]);

  // Check conflicts whenever slot, date, or vehicle changes
  useEffect(() => {
    if (!isOpen) return;
    const checkConflict = async () => {
      setIsCheckingConflict(true);
      try {
        const startIso = `${selectedDate}T${selectedSlot}:00`;
        const durationMins = parseInt(duration, 10) || 45;
        const res = await appointmentApi.checkConflict(startIso, durationMins);
        if (res.data?.hasConflict) {
          setConflictWarning(`Conflict detected: ${res.data.count} existing booking(s) overlap with this time window.`);
        } else {
          setConflictWarning(null);
        }
      } catch {
        setConflictWarning(null);
      } finally {
        setIsCheckingConflict(false);
      }
    };

    const timer = setTimeout(checkConflict, 300);
    return () => clearTimeout(timer);
  }, [selectedSlot, selectedDate, duration, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmBooking({
      customerName: customerName || (lead?.name ?? 'Customer'),
      model: vehicle.split(' · ')[0],
      loop: location,
      time: selectedSlot,
      date: selectedDate,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl flex"
        style={{ maxWidth: 900, maxHeight: '92vh', background: '#faf9f7' }}
      >
        {/* ── Left panel: dark car image ─────────────────── */}
        <div
          className="hidden md:flex flex-col justify-end relative shrink-0"
          style={{ width: 340, minHeight: 560 }}
        >
          <img
            src={ASSET_PATHS.testDrive}
            alt="Demo fleet"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
            }}
          />
          <div className="relative z-10 p-6 pb-7">
            <p
              className="font-mono text-[10px] font-bold tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}
            >
              Demo Fleet
            </p>
            <h3 className="font-condensed text-white text-2xl font-semibold leading-tight">
              {vehicle.split(' · ')[0]}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {vehicle.split(' · ')[1] || 'Vehicle 03'} · ACMA Compliant Confirmation Ready
            </p>
          </div>
        </div>

        {/* ── Right panel: form ───────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 text-center relative border-b border-slate-100">
            <button
              onClick={onClose}
              className="absolute right-5 top-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
              {lead ? `Book ${lead.name.split(' ')[0]}'s Test Drive` : 'Book Test Drive'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Real-time conflict detection across consultant, customer, and demo vehicle bay.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-5 space-y-4">
            {/* Conflict Warning Banner */}
            {conflictWarning && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="flex-1">{conflictWarning}</span>
                <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                  Override Available
                </span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full customer name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e60012]"
              />
            </div>

            {/* Date & Vehicle in 2 cols */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e60012]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Model & Demo Unit
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e60012]"
                >
                  {VEHICLE_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Time Slot
                </label>
                {isCheckingConflict && (
                  <span className="text-[10px] text-slate-400 font-mono animate-pulse">
                    Checking calendar conflicts...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: selectedSlot === slot ? '#171b22' : '#ffffff',
                      color: selectedSlot === slot ? '#ffffff' : '#374151',
                      border: selectedSlot === slot ? '1.5px solid #171b22' : '1px solid #e5e7eb',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration + Route */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Demo Route Loop
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  {LOCATION_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Send Confirmation Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={sendConfirmation}
                onChange={(e) => setSendConfirmation(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Send Instant Confirmation SMS & iCal Invite
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Includes registered sender ID, navigation pin to Melbourne CBD, and 24h reminder.
                </p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 bg-[#e60012] hover:bg-[#c90010] shadow-md transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirm & Stage Vehicle</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
