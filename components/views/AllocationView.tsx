'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { leadApi, staffApi, fetchApi, StaffMember } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Lead } from '@/lib/types';
export function AllocationView({ onAssigned }: {
    onAssigned?: () => void;
}) {
    const { activeSite, user } = useAuth();
    const [recovery, setRecovery] = useState<any>(null);
    const [rows, setRows] = useState<Lead[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [search, setSearch] = useState('');
    const [assignment, setAssignment] = useState('unassigned');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState<Lead | null>(null);
    const [recipient, setRecipient] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const sequence = useRef(0);
    const refresh = useCallback(async () => {
        const version = ++sequence.current;
        try {
            const response = await leadApi.getLeads({ page: String(page), limit: '25', q: search, assignment });
            if (version !== sequence.current)
                return;
            if (!response.success)
                throw new Error(response.message || 'Leads unavailable.');
            setRows(response.data || []);
            setPages(response.pagination?.pages || 1);
            setTotal(response.pagination?.total || 0);
            setError('');
        }
        catch (error) {
            if (version === sequence.current)
                setError(error instanceof Error ? error.message : 'Leads unavailable.');
        }
    }, [activeSite, user?.id, page, search, assignment]);
    useEffect(() => {
        setRows([]);
        const timer = setTimeout(refresh, 250);
        const poll = setInterval(() => {
            if (document.visibilityState === 'visible')
                void refresh();
        }, 5000);
        return () => { sequence.current++; clearTimeout(timer); clearInterval(poll); };
    }, [refresh]);
    useEffect(() => {
        if (!selected)
            return;
        let active = true;
        setStaff([]);
        setRecipient('');
        staffApi.getStaff(selected.dealer || selected.dealerName || activeSite).then(response => {
            if (active)
                setStaff((response.data || []).filter(person => person.active !== false && ['agent', 'consultant', 'sales_consultant', 'sales_manager', 'manager', 'site_admin', 'super_admin', 'admin'].includes(person.role)));
        }).catch(error => {
            if (active)
                setError(error.message);
        });
        return () => { active = false; };
    }, [selected, activeSite]);
    async function assign() {
        if (!selected || !recipient || busy)
            return;
        setBusy(true);
        setError('');
        try {
            const response = await fetchApi('/crm/allocations', { method: 'POST', body: JSON.stringify({ lead_prospect_id: String(selected._id || selected.id), name: selected.name, phone: selected.phone, email: selected.email, vehicle: selected.vehicle || selected.model, site: selected.dealer || selected.dealerName, assigned_to: recipient, assigned_to_user_id: recipient, source: selected.source, score: selected.score }) });
            if (!response.success)
                throw new Error(response.message || 'Allocation not confirmed.');
            setNotice(`${selected.name} is assigned and visible on the salesperson’s floor.`);
            setSelected(null);
            await refresh();
            onAssigned?.();
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Allocation failed.');
        }
        finally {
            setBusy(false);
        }
    }
    async function recover(apply = false) {
        setBusy(true);
        setError('');
        try {
            const result = await fetchApi<any>('/floor/allocations/recover', { method: 'POST', body: JSON.stringify({ apply }) });
            if (!result.success)
                throw new Error(result.message || 'Recovery failed.');
            setRecovery(result.data);
            if (apply) {
                setNotice(`${result.data.recovered} allocations recovered. ${result.data.review} need manual review.`);
                await refresh();
                onAssigned?.();
            }
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Recovery failed.');
        }
        finally {
            setBusy(false);
        }
    }
    return <div className="view-stack">
    <header>
    <p className="eyebrow">Group Management</p>
    <h1 className="page-title">Staff & Allocation</h1>
    <p className="mt-2 text-sm text-slate-500">Assign or reassign enquiries to active BYD salespeople at their dealership.</p>
    </header>
    <div className="flex flex-wrap gap-3">
    <button disabled={busy} onClick={() => void recover()} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50">Check missing allocations</button>
    <input aria-label="Search enquiries" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, mobile, email…" className="min-w-0 flex-1 rounded-lg border bg-white p-3 text-sm"/>
    <select aria-label="Assignment filter" value={assignment} onChange={event => { setAssignment(event.target.value); setPage(1); }} className="rounded-lg border bg-white px-3 text-sm">
    <option value="unassigned">Unassigned</option>
    <option value="all">All enquiries</option>
    </select>
    </div>{error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error} <button onClick={() => void refresh()} className="underline">Retry</button>
        </p>}{recovery && <section className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Allocation recovery</h2>
        <p className="text-sm text-slate-500">Checked {recovery.scanned} historical allocations. {recovery.ready} can be repaired; {recovery.review} need review.</p>{recovery.items.map((item: any) => <p key={item.allocation_id} className="text-sm">
            <strong>{item.name}</strong> · {item.salesperson || ''} · {item.message || item.status}</p>)}{recovery.ready > 0 && <button disabled={busy} onClick={() => void recover(true)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Recover missing assignments</button>}</section>}{notice && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}<div className="overflow-x-auto rounded-xl border bg-white">
    <table className="w-full text-left text-sm">
    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
    <tr>{['Customer', 'Vehicle', 'Dealership', 'Salesperson', 'Action'].map(label => <th key={label} className="p-4">{label}</th>)}</tr>
    </thead>
    <tbody>{rows.map(row => <tr key={String(row._id || row.id)} className="border-b last:border-0">
        <td className="p-4">
        <strong>{row.name}</strong>
        <p className="mt-1 text-slate-500">{row.phone}</p>
        </td>
        <td className="p-4">{row.vehicle || row.model}</td>
        <td className="p-4">{row.dealer || row.dealerName}</td>
        <td className="p-4">{row.allocatedPersonFullName || row.assignedTo || 'Unassigned'}</td>
        <td className="p-4">
        <button onClick={() => setSelected(row)} className="rounded-lg border px-3 py-2 font-semibold">{row.assignedTo ? 'Reassign' : 'Assign'}</button>
        </td>
        </tr>)}</tbody>
    </table>{!rows.length && <p className="p-6 text-sm text-slate-500">No matching enquiries.</p>}</div>
    <div className="flex items-center justify-between text-sm text-slate-500">
    <span>{total} enquiries · Page {page} of {pages}</span>
    <div className="flex gap-2">
    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Previous</button>
    <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Next</button>
    </div>
    </div>{selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <section role="dialog" aria-modal="true" aria-label="Allocate enquiry" className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Assign {selected.name}</h2>
        <p className="text-sm text-slate-500">{selected.dealer || selected.dealerName} · {selected.phone}</p>
        <select aria-label="Salesperson" value={recipient} onChange={event => setRecipient(event.target.value)} className="w-full rounded-lg border p-3 text-sm">
        <option value="">Select salesperson</option>{staff.map(person => <option key={person._id} value={person._id}>{person.name} · {person.email}</option>)}</select>
        <div className="flex justify-end gap-2">
        <button disabled={busy} onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
        <button disabled={busy || !recipient} onClick={() => void assign()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Confirm assignment'}</button>
        </div>
        </section>
        </div>}</div>;
}
