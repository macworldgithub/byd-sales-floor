'use client';
import { useEffect, useState } from 'react';
import { operation, uploadMedia } from '@/lib/operations';
import { useAuth } from '@/lib/auth';
import { isManager } from '@/lib/navigation';
import { DeliveryProfile } from '@/components/customer/DeliveryProfile';
import { DeliveriesView } from '@/crm/components/views/DeliveriesView';
export function DeliveryOperations() {
    const { activeSite, user } = useAuth();
    const contractor = user?.role === 'contractor';
    const [tab, setTab] = useState(contractor ? 'work' : 'watch');
    const [contractors, setContractors] = useState<any[]>([]);
    const [jobName, setJobName] = useState('');
    const [jobContractor, setJobContractor] = useState('');
    const [rows, setRows] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const canEdit = isManager(user?.role) || ['delivery', 'delivery_consultant'].includes(user?.role || '');
    const canWork = (job: any) => canEdit || (contractor && job.contractorId === user?.id);
    useEffect(() => { let active = true; if (canEdit)
        void operation<any[]>('/staff').then(rows => { if (active)
            setContractors(rows.filter(person => person.role === 'contractor')); }).catch(() => { }); return () => { active = false; }; }, [activeSite, canEdit]);
    async function photo(file: File, job: any, index: number) {
        if (contractor && !navigator.geolocation)
            throw new Error('Location access is required for on-site completion proof.');
        const location = contractor ? await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })) : null;
        const proof = await uploadMedia(file, { clientId: String(selected._id), accessoryId: String(job.id || job._id), ...(location ? { latitude: String(location.coords.latitude), longitude: String(location.coords.longitude) } : {}) });
        await save({ accessories: selected.accessories.map((item: any, at: number) => at === index ? { ...item, proofId: proof.id } : item) });
    }
    useEffect(() => {
        let active = true;
        setRows([]);
        setSelected(null);
        const load = async () => {
            try {
                const data = await operation<any[]>('/deliveries');
                if (active) {
                    setRows(data);
                    setError('');
                }
            }
            catch (error) {
                if (active)
                    setError(String(error));
            }
        };
        void load();
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible')
                void load();
        }, 15000);
        return () => { active = false; clearInterval(timer); };
    }, [activeSite, user?.id]);
    async function save(patch: any) {
        if (!selected)
            return;
        const saved = await operation(`/deliveries/${selected._id}`, patch, 'PATCH');
        setSelected(saved);
        setRows(old => old.map(row => row._id === saved._id ? saved : row));
    }
    async function run(action: () => Promise<void>) {
        if (busy)
            return;
        setBusy(true);
        setError('');
        try {
            await action();
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Delivery update failed.');
        }
        finally {
            setBusy(false);
        }
    }
    return <div className="view-stack">
    <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
    <p className="eyebrow">Floor Operations</p>
    <h1 className="page-title">Delivery Centre</h1>
    <p className="mt-2 text-sm text-slate-500">From sold handoff to scheduling, preparation, accessories and completed handover.</p>
    </div>
    <div className="flex rounded-xl border bg-white p-1">{(contractor ? [['work', 'My delivery jobs']] : [['watch', 'Delivery watch'], ['work', 'Preparation & handover']]).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === id ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{label}</button>)}</div>
    </div>{tab === 'watch' ? <DeliveriesView /> : <>
        <input aria-label="Search deliveries" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, vehicle or VIN" className="rounded-lg border bg-white p-3 text-sm"/>{error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}<div className="grid gap-4 lg:grid-cols-2">{rows.filter(row => `${row.name} ${row.vehicle} ${row.vin}`.toLowerCase().includes(search.toLowerCase())).map(row => <button key={row._id} onClick={() => setSelected(row)} className="rounded-xl border bg-white p-5 text-left shadow-sm">
            <div className="flex items-center justify-between gap-3">
            <strong>{row.name}</strong>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{row.stage || row.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{row.vehicle} · {row.site_location || row.site}</p>
            <p className="mt-3 text-sm">PDI: {row.pdiComplete ? 'Complete' : 'Pending'} · Accessories: {(row.accessories || []).filter((job: any) => job.status === 'Fitted' && job.proofId).length}/{row.accessories?.length || 0}</p>
            </button>)}</div>{!rows.length && <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">No delivery jobs at this site.</p>}{selected && <section className="space-y-4 rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{selected.name} · Delivery preparation</h2>
            <button onClick={() => setSelected(null)} className="rounded-lg border px-3 py-2 text-sm">Close</button>
            </div>
            {!contractor && <DeliveryProfile referenceId={String(selected._id)} allowSold={false}/>}
            <p className="text-sm text-slate-500">Contract: {selected.contractSignedAt ? 'Signed' : 'Awaiting signed contract'} · Handover: {selected.deliveredAt ? 'Completed' : 'Pending'}</p>{canEdit && !selected.deliveredAt && <label className="flex items-center gap-2 text-sm">
                <input disabled={busy} type="checkbox" checked={!!selected.pdiComplete} onChange={event => void run(() => save({ pdiComplete: event.target.checked }))}/>Pre-delivery inspection complete</label>}{canEdit && !selected.deliveredAt && <form className="space-y-3 rounded-lg border p-4" onSubmit={event => { event.preventDefault(); void run(async () => { await save({ accessories: [...(selected.accessories || []), { name: jobName.trim(), status: 'Pending Order', ...(jobContractor ? { contractorId: jobContractor } : {}) }] }); setJobName(''); }); }}>
                <h3 className="font-semibold">Add preparation job</h3>
                <input required aria-label="Accessory or preparation job" value={jobName} onChange={event => setJobName(event.target.value)} className="w-full rounded-lg border p-2 text-sm" placeholder="Accessory or preparation job"/>
                <select aria-label="Assign contractor" value={jobContractor} onChange={event => setJobContractor(event.target.value)} className="w-full rounded-lg border p-2 text-sm">
                <option value="">Assign later</option>{contractors.map(person => <option key={person._id} value={person._id}>{person.name} · {person.site}</option>)}</select>
                <button disabled={busy || !jobName.trim()} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Add job</button>
                </form>}{(selected.accessories || []).map((job: any, index: number) => (!contractor || job.contractorId === user?.id) && <div key={job.id || job._id || index} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm">{job.name}</strong>
                <select aria-label={`${job.name} status`} disabled={busy || !canWork(job) || !!selected.deliveredAt} value={job.status} onChange={event => void run(() => save({ accessories: selected.accessories.map((item: any, at: number) => at === index ? { ...item, status: event.target.value } : item) }))} className="rounded-lg border p-2 text-sm">{['Pending Order', 'Ordered', 'On Hand', 'Fitted'].map(value => <option key={value}>{value}</option>)}</select>
                </div>
                <p className="text-sm text-slate-500">Completion photo: {job.proofId ? 'Recorded' : 'Required before handover'}</p>{canWork(job) && !selected.deliveredAt && <label className="block text-sm">Upload completion photo<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={event => {
                            const file = event.target.files?.[0];
                            if (!file)
                                return;
                            void run(() => photo(file, job, index));
                            event.target.value = '';
                        }} className="mt-2 block w-full rounded-lg border p-2 text-sm"/>
                    </label>}</div>)}{canEdit && !selected.deliveredAt && <button disabled={busy} onClick={() => void run(async () => { const result = await operation(`/deliveries/${selected._id}/handover`, {}); setSelected(result); setRows(old => old.map(row => row._id === result._id ? result : row)); })} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Complete handover</button>}<p className="text-sm text-slate-500">Handover requires a signed contract, completed PDI and fitted accessories with uploaded photo proof. Customer messages follow the existing BYD approval process.</p>
            </section>}</>}</div>;
}
