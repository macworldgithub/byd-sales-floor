'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, MapPin, Video, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { operation } from '@/lib/operations';
import { leadApi } from '@/lib/api';
import { normalizeLead } from '@/lib/floorCalendar';
import type { Lead } from '@/lib/types';
function useLive(path: string) {
    const { activeSite, user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const version = useRef(0);
    const refresh = useCallback(async () => {
        const sequence = ++version.current;
        try {
            const value = await operation(path);
            if (sequence === version.current) {
                setData(value);
                setError('');
            }
        }
        catch (error) {
            if (sequence === version.current)
                setError(error instanceof Error ? error.message : 'Live data unavailable.');
        }
    }, [path, activeSite, user?.id]);
    useEffect(() => {
        setData(null);
        setError('');
        void refresh();
        const poll = () => {
            if (document.visibilityState === 'visible')
                void refresh();
        };
        const timer = setInterval(poll, 15000);
        window.addEventListener('focus', poll);
        return () => { version.current++; clearInterval(timer); window.removeEventListener('focus', poll); };
    }, [refresh]);
    return { data, error, refresh };
}
function Status({ error, loading, retry }: {
    error: string;
    loading: boolean;
    retry: () => void;
}) {
    return error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button onClick={retry} className="ml-2 underline">Retry</button>
    </div> : loading ? <p role="status" className="p-5 text-sm text-slate-500">Loading live records…</p> : null;
}
export function LiveMetrics() {
    const [period, setPeriod] = useState('today');
    const { data, error, refresh } = useLive(`/summary?period=${period}`);
    const metrics = [['Active leads', 'activeLeads'], ['Unactioned leads', 'unactionedLeads'], ['Appointments booked', 'appointmentsBooked'], ['Overdue follow-up', 'overdueSla'], ['Deals completed', 'dealsCompleted'], ['Conversion %', 'conversionRate'], ['Videos sent', 'videosSent'], ['Monthly target', 'monthlyTarget']];
    return <section className="view-stack mb-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
    <p className="eyebrow">BYD Harmony · Sales Floor OS</p>
    <h1 className="page-title">Daily overview</h1>
    <p className="mt-2 text-sm text-slate-500">Lead Centre, showroom activity and delivery in one workspace.</p>
    </div>
    <div className="flex gap-1 rounded-xl border bg-white p-1">{[['today', 'Today'], ['weekly', 'Weekly'], ['mtd', 'MTD']].map(([value, label]) => <button key={value} onClick={() => setPeriod(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${period === value ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{label}</button>)}</div>
    </div>
    <Status error={error} loading={!data} retry={refresh}/>{data && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, key]) => <article key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-tight text-slate-900">{data[key] ?? '—'}</strong>
            </article>)}</div>}</section>;
}
export function PulseView({ onSelectLead }: {
    onSelectLead: (lead: Lead) => void;
}) {
    const { data, error, refresh } = useLive('/pulse');
    const staff = useLive('/staff');
    const [actionError, setActionError] = useState('');
    const open = async (id: string) => {
        try {
            const response = await leadApi.getLead(id);
            if (response.data)
                onSelectLead(normalizeLead(response.data));
        }
        catch (error) {
            setActionError(String(error));
        }
    };
    return <div className="view-stack">
    <div className="flex items-center justify-between">
    <div>
    <p className="eyebrow">Group Management</p>
    <h1 className="page-title">PULSE Dashboard</h1>
    <p className="mt-2 text-sm text-slate-500">Live salesperson follow-up, conversion and staff presence.</p>
    </div>
    <button onClick={() => { void refresh(); void staff.refresh(); }} className="rounded-lg border bg-white p-3" aria-label="Refresh PULSE">
    <RefreshCw className="h-4 w-4"/>
    </button>
    </div>
    <Status error={error || staff.error || actionError} loading={!data} retry={refresh}/>
    {data && <>
        <p className="text-sm text-slate-500">Follow-up turns amber at {data.config.followupAmberHours}h and red at {data.config.followupRedHours}h. Conversion thresholds: {data.config.conversionAmber}% / {data.config.conversionGreen}%.</p>
        <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
        <tr>{['Salesperson', 'Signal', 'Active leads', 'Follow-up due', 'Sales', 'Conversion', 'Presence'].map(label => <th key={label} className="whitespace-nowrap p-4">{label}</th>)}</tr>
        </thead>
        <tbody>{data.consultants.map((person: any) => {
                const presence = staff.data?.find((row: any) => row.email === person.email)?.presence;
                return <tr key={person.email || person.name} className="border-b last:border-0">
                <td className="p-4 font-semibold">{person.name}</td>
                <td className="p-4">
                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 capitalize ${person.trafficLight === 'red' ? 'border-red-200 bg-red-50 text-red-700' : person.trafficLight === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                <span className="h-2 w-2 rounded-full bg-current"/>{person.trafficLight}</span>
                </td>
                <td className="p-4">{person.activeLeads}</td>
                <td className="p-4">{person.overdueSla}</td>
                <td className="p-4">{person.sold}</td>
                <td className="p-4">{person.conversionRate ?? '—'}%</td>
                <td className="p-4 text-slate-500">{presence?.fresh ? presence.isInsideGeofence ? 'On site' : 'Off site' : 'No recent check-in'}</td>
                </tr>;
            })}</tbody>
        </table>{!data.consultants.length && <p className="p-6 text-sm text-slate-500">No assigned leads at this site yet.</p>}</div>
        <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Customers needing follow-up</h2>
        <div className="grid gap-2 sm:grid-cols-2">{data.consultants.flatMap((person: any) => person.flaggedLeads.map((lead: any) => <button key={lead.id} onClick={() => void open(lead.id)} className="rounded-lg border p-3 text-left text-sm hover:bg-slate-50">
            <strong>{lead.name}</strong>
            <p className="mt-1 text-slate-500">{person.name} · {lead.age} · {lead.reason}</p>
            </button>))}</div>
        </section>
        </>}
  </div>;
}
export function TasksView() {
    const { data, error, refresh } = useLive('/tasks');
    const [actionError, setActionError] = useState('');
    const complete = async (id: string) => {
        try {
            await operation(`/tasks/${encodeURIComponent(id)}/complete`, {}, 'PATCH');
            await refresh();
        }
        catch (error) {
            setActionError(String(error));
        }
    };
    return <div className="view-stack">
    <div>
    <p className="eyebrow">Floor Operations</p>
    <h1 className="page-title">Actions & Follow-up</h1>
    </div>
    <Status error={error || actionError} loading={!data} retry={refresh}/>{data?.filter((task: any) => task.status !== 'complete').map((task: any) => <article key={task._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5">
        <div>
        <strong>{task.title || task.body || task.type || 'Customer follow-up'}</strong>
        <p className="mt-1 text-sm text-slate-500">{task.customerName || task.leadName || ''} · {task.dueAt ? new Date(task.dueAt).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' }) : 'No due date'}</p>
        </div>
        <button onClick={() => void complete(task._id)} className="rounded-lg border px-3 py-2 text-sm">Complete</button>
        </article>)}{data && !data.some((row: any) => row.status !== 'complete') && <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">No open tasks.</p>}</div>;
}
export function PresenceCheckIn() {
    const { activeSite } = useAuth();
    const [status, setStatus] = useState('');
    const checkIn = () => {
        if (!navigator.geolocation)
            return setStatus('Location sharing is unavailable on this device.');
        setStatus('Reading your location…');
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                await operation('/presence', { site: activeSite, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
                setStatus('Location check-in saved.');
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : 'Check-in failed.');
            }
        }, error => setStatus(error.message), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    };
    return <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
    <button onClick={checkIn} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
    <MapPin className="h-4 w-4"/>Check in at showroom</button>
    <p role="status" className="text-sm text-slate-500">{status || 'Share your current location to update staff presence.'}</p>
    </div>;
}
