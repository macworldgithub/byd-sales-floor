'use client';
import React, { useEffect, useRef, useState } from 'react';
import { appointmentApi, floorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { addDays, calendarRange, melbourneDay, navigateCalendar, type CalendarMode, type FloorEvent, type PageInfo } from '@/lib/floorCalendar';
import { Pagination } from '@/components/ui/Pagination';
import type { TimelineEvent } from '@/lib/types';

interface Props { timelineEvents?: TimelineEvent[]; onOpenAddEvent: (date: string) => void; onOpenBookDrive: (date: string) => void; refreshKey?: number }
export function CalendarView({ onOpenAddEvent, onOpenBookDrive, refreshKey = 0 }: Props) {
  const { activeSite, user } = useAuth();
  const [mode, setMode] = useState<CalendarMode>('day');
  const [date, setDate] = useState(melbourneDay);
  const [category, setCategory] = useState('all');
  const [consultant, setConsultant] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<FloorEvent[]>([]);
  const [pagination, setPagination] = useState<PageInfo>({ total: 0, page: 1, pages: 1, limit: 50 });
  const [filters, setFilters] = useState<{ consultants: string[]; statuses: string[] }>({ consultants: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<FloorEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const sequence = useRef(0);
  const range = calendarRange(date, mode);
  const params = { from: range.from, to: range.to, category, consultant, status, q: search.trim() };

  useEffect(() => {
    const request = ++sequence.current;
    setLoading(true); setError(''); setEvents([]); setSelected(null);
    const timer = setTimeout(async () => {
      try {
        const result = await floorApi.calendar({ from: range.from, to: range.to, category, consultant, status, q: search.trim(), page: String(page), limit: '50' });
        if (request !== sequence.current) return;
        if (!result.success) throw new Error(result.message || 'Unable to load calendar');
        setEvents(result.data || []); setPagination(result.pagination);
        setFilters(result.meta?.filters || { consultants: [], statuses: [] });
        if (result.pagination.page !== page) setPage(result.pagination.page);
      } catch (error: any) { if (request === sequence.current) setError(error.message || 'Unable to load calendar'); }
      finally { if (request === sequence.current) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); sequence.current++; };
  }, [range.from, range.to, category, consultant, status, search, page, activeSite, user?.id, revision, refreshKey]);

  const changeDate = (value: string) => { if (/^\d{4}-\d{2}-\d{2}$/.test(value)) { setDate(value); setPage(1); } };
  const outcome = async (value: 'Completed' | 'No Show') => {
    const id = selected?.rawObject?.appointment_id;
    if (!id) return;
    setSaving(true); setError('');
    try {
      const result = await appointmentApi.updateAppointment(id, { status: value });
      if (!result.success) throw new Error(result.message || 'The appointment could not be updated');
      setSelected(null); setRevision(value => value + 1);
    } catch (error: any) { setError(error.message || 'The appointment could not be updated'); }
    finally { setSaving(false); }
  };
  const eventButton = (event: FloorEvent) => <button key={event.id} onClick={() => setSelected(event)} className={`w-full text-left rounded-lg border p-2 text-xs ${event.type === 'delivery' ? 'bg-emerald-50' : event.type === 'drive' ? 'bg-cyan-50' : 'bg-amber-50'}`}>
    <span className="font-mono">{event.timeStr}–{event.endTimeStr}</span><strong className="block">{event.title}</strong>
    <span className="block text-slate-600">{[event.vehicle, event.consultant, event.site].filter(Boolean).join(' · ')}</span><span className="block text-slate-500">{event.status}</span>
  </button>;
  const dayEvents = (value: string) => events.filter(event => event.dateStr === value);
  const monthOffset = (new Date(range.from + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const gridStart = addDays(range.from, -monthOffset);
  const dayCount = Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86400000);

  return <div className="view-stack">
    <div className="page-intro flex flex-wrap justify-between gap-3"><div><p className="eyebrow">Working Calendar · Australia/Melbourne</p><h1 className="text-2xl font-semibold">Floor calendar</h1><p className="text-sm text-slate-500">{activeSite || user?.site || 'All Sites'} · {pagination.total.toLocaleString()} events in this range</p></div>
      <div className="flex flex-wrap gap-2 items-center"><button className="secondary-button px-3 py-2" onClick={() => setRevision(value => value + 1)}>Refresh</button><button className="secondary-button px-3 py-2" onClick={async () => { try { await floorApi.exportCalendar(params); } catch (error: any) { setError(error.message); } }}>Export calendar</button><button className="signal-button px-3 py-2" onClick={() => onOpenAddEvent(date)}>Add event</button><button className="secondary-button px-3 py-2" onClick={() => onOpenBookDrive(date)}>Book test drive</button></div>
    </div>
    <section className="surface-card p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button aria-label="Previous period" onClick={() => changeDate(navigateCalendar(date, mode, -1))}>←</button><button onClick={() => changeDate(melbourneDay())} className="secondary-button px-3 py-2">Today</button><button aria-label="Next period" onClick={() => changeDate(navigateCalendar(date, mode, 1))}>→</button>
        <input aria-label="Calendar date" type={mode === 'month' ? 'month' : 'date'} value={mode === 'month' ? date.slice(0, 7) : date} onChange={event => changeDate(mode === 'month' ? event.target.value + '-01' : event.target.value)} className="border rounded-lg p-2" />
        <select aria-label="Calendar view" value={mode} onChange={event => { setMode(event.target.value as CalendarMode); setPage(1); }} className="border rounded-lg p-2">{(['day', 'week', 'month', 'team'] as CalendarMode[]).map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select>
        <select aria-label="Event type" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }} className="border rounded-lg p-2"><option value="all">All event types</option><option value="drive">Appointments</option><option value="followup">Follow-ups</option><option value="delivery">Deliveries</option><option value="hold">Personal holds</option></select>
        <select aria-label="Consultant" value={consultant} onChange={event => { setConsultant(event.target.value); setPage(1); }} className="border rounded-lg p-2"><option value="">All consultants</option>{filters.consultants.map(value => <option key={value}>{value}</option>)}</select>
        <select aria-label="Event status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="border rounded-lg p-2"><option value="">All statuses</option>{filters.statuses.map(value => <option key={value}>{value}</option>)}</select>
        <input aria-label="Search calendar" placeholder="Search customer, vehicle or notes" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="border rounded-lg p-2 flex-1 min-w-48" />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 text-red-700 p-3">{error}</p>}
      {loading ? <p role="status" className="p-8 text-center">Loading calendar…</p> : !error && <>
        {mode === 'month' ? <div className="overflow-x-auto"><div className="grid grid-cols-7 min-w-[700px]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(value => <div className="p-2 font-semibold text-center" key={value}>{value}</div>)}
          {Array.from({ length: Math.ceil((dayCount + monthOffset) / 7) * 7 }, (_, index) => addDays(gridStart, index)).map(value => <div key={value} className={`border p-2 min-h-32 space-y-1 ${value.slice(0, 7) !== date.slice(0, 7) ? 'bg-slate-50 text-slate-400' : ''}`}><button className="font-semibold hover:underline" onClick={() => { changeDate(value); setMode('day'); }}>{Number(value.slice(-2))}</button>{dayEvents(value).map(eventButton)}</div>)}
        </div></div> : mode === 'week' ? <div className="grid grid-cols-1 md:grid-cols-7 gap-2">{Array.from({ length: 7 }, (_, index) => addDays(range.from, index)).map(value => <div key={value} className="border rounded-lg p-2 space-y-2"><button onClick={() => { changeDate(value); setMode('day'); }} className="font-semibold text-sm">{value}</button>{dayEvents(value).map(eventButton)}{!dayEvents(value).length && <p className="text-xs text-slate-400">No events on this page</p>}</div>)}</div> : mode === 'team' ? <div className="grid gap-4 md:grid-cols-3">{[...new Set(events.map(event => event.consultant || 'Unassigned'))].map(name => <div key={name} className="border rounded-lg p-3 space-y-2"><h2 className="font-semibold">{name}</h2>{events.filter(event => (event.consultant || 'Unassigned') === name).map(eventButton)}</div>)}</div> : <div className="space-y-2">{events.map(eventButton)}</div>}
        {!events.length && <p className="p-8 text-center text-slate-500">No events match this date range and filters.</p>}
        <Pagination currentPage={pagination.page} totalPages={pagination.pages} totalItems={pagination.total} pageSize={pagination.limit} onPageChange={setPage} itemName="events" isLoading={loading} />
      </>}
    </section>
    {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal-container p-6 space-y-4" onClick={event => event.stopPropagation()}><button aria-label="Close event" className="float-right" onClick={() => setSelected(null)}>×</button><h2 className="text-xl font-semibold">{selected.title}</h2><p>{selected.dateStr} · {selected.timeStr}–{selected.endTimeStr} (Melbourne)</p><p>{selected.vehicle}</p><p>{selected.site} · {selected.consultant || 'Unassigned'}</p><p>{selected.status}</p><p>{selected.subtitle}</p>{selected.rawSource === 'appointment' && selected.rawObject?.appointment_id && <div className="flex gap-3"><button disabled={saving} className="signal-button p-2" onClick={() => outcome('Completed')}>Mark completed</button><button disabled={saving} className="secondary-button p-2" onClick={() => outcome('No Show')}>Mark no-show</button></div>}{error && <p role="alert" className="text-red-700">{error}</p>}</div></div>}
  </div>;
}
