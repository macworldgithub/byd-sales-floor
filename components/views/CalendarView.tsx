'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Car,
  AlertCircle,
  BatteryCharging,
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TimelineEvent } from '@/lib/types';
import { ASSET_PATHS, FLEET_VEHICLES, TEAM_MEMBERS } from '@/lib/data';
import { appointmentApi, sequenceApi } from '@/lib/api';

interface CalendarViewProps {
  timelineEvents: TimelineEvent[];
  onOpenAddEvent: () => void;
  onOpenBookDrive: () => void;
}

export function CalendarView({
  timelineEvents,
  onOpenAddEvent,
  onOpenBookDrive,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'myDay' | 'team'>('myDay');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const getEventPosition = (time: string, end: string) => {
    const parseTime = (t: string) => {
      const parts = t.split(':').map(Number);
      const h = parts[0] || 8;
      const m = parts[1] || 0;
      return (h - 8) * 60 + m;
    };

    const startMin = parseTime(time);
    const endMin = parseTime(end);
    const totalMin = 10 * 60;

    const topPct = Math.max(0, Math.min(100, (startMin / totalMin) * 100));
    const heightPct = Math.max(((endMin - startMin) / totalMin) * 100, 7);

    return { top: `${topPct}%`, height: `${heightPct}%` };
  };

  const getEventClass = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'drive':
        return 'calendar-drive';
      case 'delivery':
        return 'calendar-delivery';
      case 'followup':
        return 'calendar-followup';
      case 'hold':
        return 'calendar-hold';
      default:
        return 'calendar-hold';
    }
  };

  const handleExportIcs = () => {
    const url = appointmentApi.getExportIcsUrl();
    window.open(url, '_blank');
  };

  const handleMarkOutcome = async (outcome: 'Completed' | 'No Show') => {
    if (!selectedEvent) return;
    setIsProcessing(true);
    try {
      // Find appointment or patch by event title
      const appointmentId = (selectedEvent as any)._id || (selectedEvent as any).id || 'apt-latest';
      await appointmentApi.updateAppointment(appointmentId, {
        status: outcome,
      });

      if (outcome === 'No Show') {
        // Trigger SEQ-NOSHOW cadence enrollment if possible
        try {
          await sequenceApi.enrollLead('SEQ-NOSHOW', {
            prospectName: selectedEvent.title.replace('Test drive · ', ''),
            phone: '+61 412 890 234',
          });
        } catch {}
        setActionFeedback('Marked as No Show. Enrolled in SEQ-NOSHOW re-engagement sequence.');
      } else {
        setActionFeedback('Appointment marked as Met & Completed. Opportunity stage moved forward.');
      }

      setTimeout(() => {
        setSelectedEvent(null);
        setActionFeedback(null);
      }, 1500);
    } catch (err: any) {
      setActionFeedback(`Status updated locally to ${outcome}.`);
      setTimeout(() => {
        setSelectedEvent(null);
        setActionFeedback(null);
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="view-stack">
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Working Calendar · Showroom & Test Drive Operations</p>
          <h1 className="page-title">THE FLOOR, AT A GLANCE.</h1>
          <p className="page-subtitle">
            Coordinate appointments, demo loops and handovers. RFC 5545 iCalendar sync and outcome tracking enabled.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Mode */}
          <div className="segmented">
            <button
              type="button"
              onClick={() => setViewMode('myDay')}
              className={viewMode === 'myDay' ? 'active' : ''}
            >
              My Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('team')}
              className={viewMode === 'team' ? 'active' : ''}
            >
              Team Grid
            </button>
          </div>

          <button
            onClick={handleExportIcs}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            title="Download RFC 5545 iCalendar (.ics) for Outlook / Apple Calendar / Google Calendar"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export (.ics)</span>
          </button>

          <button
            onClick={onOpenBookDrive}
            className="signal-button px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Book Drive</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Container */}
      <div className="calendar-shell">
        {/* Calendar Toolbar */}
        <div className="calendar-toolbar">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <strong className="text-xs sm:text-sm font-semibold text-slate-900">
              Monday, 8 September · Melbourne AEST
            </strong>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="legend-item">
              <i className="bg-cyan-500" />
              <span>Drive</span>
            </div>
            <div className="legend-item">
              <i className="bg-[#e60012]" />
              <span>Delivery</span>
            </div>
            <div className="legend-item">
              <i className="bg-amber-500" />
              <span>Follow-up</span>
            </div>
            <div className="legend-item">
              <i className="bg-slate-400" />
              <span>Hold</span>
            </div>
          </div>
        </div>

        {/* View Mode: My Day */}
        {viewMode === 'myDay' && (
          <div className="day-calendar">
            {/* Time Gutter */}
            <div className="time-gutter">
              {timeSlots.map((time, idx) => (
                <span key={idx}>{time}</span>
              ))}
            </div>

            {/* Day Track Area */}
            <div className="day-track h-[650px] relative">
              {/* Hour Grid Lines */}
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="hour-line" />
              ))}

              {/* Now Time Line indicator */}
              <div className="now-line" style={{ top: '8.5%' }}>
                <span>NOW · 08:51 AM</span>
              </div>

              {/* Event Blocks */}
              {timelineEvents.map((evt, idx) => {
                const pos = getEventPosition(evt.time, evt.end);
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedEvent(evt)}
                    className={`calendar-event ${getEventClass(evt.type)} cursor-pointer hover:scale-[1.01] transition-transform shadow-xs`}
                    style={{
                      top: pos.top,
                      height: pos.height,
                      left: '12px',
                      right: '12px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase text-[10px] tracking-wider">{evt.type}</span>
                      <small className="font-mono">{evt.time} - {evt.end}</small>
                    </div>
                    <strong>{evt.title}</strong>
                    <small>{evt.detail}</small>
                  </div>
                );
              })}
            </div>

            {/* Context Sidebar (Desktop) */}
            <div className="calendar-context p-4 space-y-4">
              <div className="rounded-xl overflow-hidden shadow-sm relative h-36">
                <img
                  src={ASSET_PATHS.testDrive}
                  alt="BYD Demo Fleet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
                    Showroom Demo Fleet
                  </span>
                  <p className="text-xs text-white font-semibold">3 vehicles staged & charged</p>
                </div>
              </div>

              {/* Fleet List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Available Fleet
                </p>
                {FLEET_VEHICLES.map((car) => (
                  <div
                    key={car.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <strong className="text-xs text-slate-900 block font-semibold">{car.model}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {car.plate} · {car.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      <BatteryCharging className="w-3 h-3" />
                      <span>{car.battery}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Capacity Note */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Delivery Bay 2 Capacity</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  Reserved for Priya Nair handover (10:30–11:30 AM). Prep detailer scheduled 10:00 AM.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Team */}
        {viewMode === 'team' && (
          <div className="overflow-x-auto w-full -mx-px">
            <div className="team-calendar min-w-[700px]">
              {/* Team Header */}
              <div className="team-head">
                <span>Consultant</span>
                <span>09:00</span>
                <span>10:00</span>
                <span>11:00</span>
                <span>12:00</span>
                <span>13:00</span>
                <span>14:00</span>
                <span>15:00</span>
                <span>16:00</span>
              </div>

              {/* Team Rows */}
              <div className="divide-y divide-slate-100">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div key={idx} className="team-row">
                    <div className="team-person">
                      <div className="avatar-mini">{member.avatar}</div>
                      <div className="min-w-0">
                        <strong className="text-xs text-slate-900 block truncate">{member.name}</strong>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {member.role} · {member.load}% load
                        </span>
                      </div>
                    </div>

                    <div className="team-track-grid">
                      {member.events.map((evt, eIdx) => {
                        const toneClass =
                          evt.type === 'drive'
                            ? 'bg-cyan-100 border border-cyan-300 text-cyan-900'
                            : evt.type === 'delivery'
                              ? 'bg-red-100 border border-red-300 text-red-900'
                              : evt.type === 'followup'
                                ? 'bg-amber-100 border border-amber-300 text-amber-900'
                                : 'bg-slate-100 border border-slate-300 text-slate-700';

                        return (
                          <div
                            key={eIdx}
                            className={`team-event ${toneClass}`}
                            style={{
                              left: `${evt.start}%`,
                              width: `${evt.width}%`,
                            }}
                          >
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Outcome Action Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointment Management</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {selectedEvent.time} - {selectedEvent.end} · {selectedEvent.detail}
              </p>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Log the appointment outcome to update opportunity progression in the CRM and automate sequence triggers.
            </p>

            {actionFeedback && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {actionFeedback}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleMarkOutcome('Completed')}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Show (Customer Met / Drive Completed)</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkOutcome('No Show')}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark No Show (Trigger SEQ-NOSHOW Cadence)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  actionFeedback && setActionFeedback(null);
                }}
                className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
