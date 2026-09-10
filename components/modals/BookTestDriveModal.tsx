'use client';

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Lead } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';

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

const TIME_SLOTS = ['09:00', '10:00', '11:30', '13:15', '15:00', '16:30'];

const DURATION_OPTIONS = ['30 minutes', '45 minutes', '60 minutes', '90 minutes'];
const LOCATION_OPTIONS = ['Demo loop A', 'Demo loop B', 'Demo loop C', 'Custom route'];

export function BookTestDriveModal({
  isOpen,
  onClose,
  lead,
  onConfirmBooking,
}: BookTestDriveModalProps) {
  const [customerName, setCustomerName] = useState(lead?.name ?? '');
  const [vehicle, setVehicle] = useState('SEALION 7 Premium · Vehicle 03');
  const [selectedSlot, setSelectedSlot] = useState('13:15');
  const [duration, setDuration] = useState('45 minutes');
  const [location, setLocation] = useState('Demo loop B');
  const [sendConfirmation, setSendConfirmation] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmBooking({
      customerName: customerName || (lead?.name ?? 'Customer'),
      model: vehicle.split(' · ')[0],
      loop: location,
      time: selectedSlot,
      date: 'Saturday, 13 September 2026',
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
            alt="SEALION 7 Premium demo fleet"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Deep gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
            }}
          />
          {/* Fleet info */}
          <div className="relative z-10 p-6 pb-7">
            <p
              className="font-mono text-[10px] font-bold tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}
            >
              Demo Fleet
            </p>
            <h3
              className="font-condensed text-white text-2xl font-semibold leading-tight"
              style={{ letterSpacing: '-0.01em' }}
            >
              SEALION 7 Premium
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Vehicle 03 · 68% charge · ready
            </p>
          </div>
        </div>

        {/* ── Right panel: form ───────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Drag handle */}
          <div className="flex justify-center pt-4 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="px-8 pt-4 pb-5 text-center relative">
            <button
              onClick={onClose}
              className="absolute right-5 top-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
              {lead ? `Book ${lead.name.split(' ')[0]}'s test drive` : 'Book test drive'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Conflict-safe booking across the consultant, customer and demo fleet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Customer
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent transition"
              />
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vehicle
              </label>
              <div className="relative">
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent transition pr-10 cursor-pointer"
                >
                  {VEHICLE_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Available Saturday slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className="py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: selectedSlot === slot ? '#171b22' : '#ffffff',
                      color: selectedSlot === slot ? '#ffffff' : '#374151',
                      border: selectedSlot === slot ? '1.5px solid #171b22' : '1.5px solid #e5e7eb',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration + Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Duration
                </label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent transition pr-8 cursor-pointer"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent transition pr-8 cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Send confirmation checkbox */}
            <label
              className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-4"
              style={{ userSelect: 'none' }}
            >
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={sendConfirmation}
                  onChange={(e) => setSendConfirmation(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                  style={{
                    background: sendConfirmation ? '#e60012' : '#ffffff',
                    border: sendConfirmation ? '2px solid #e60012' : '2px solid #d1d5db',
                  }}
                >
                  {sendConfirmation && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Send confirmation now</p>
                <p className="text-xs text-slate-500 mt-0.5">SMS + email, with reminders at 24h and 2h.</p>
              </div>
            </label>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: '#e60012', boxShadow: '0 6px 20px rgba(230,0,18,0.28)' }}
              >
                <Calendar className="w-4 h-4" />
                Confirm booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
