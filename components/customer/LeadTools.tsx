'use client';
import { useEffect, useRef, useState } from 'react';
import { melbourneDateTime } from '@/lib/floorCalendar';
import { operation, uploadMedia } from '@/lib/operations';
import { leadApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isManager } from '@/lib/navigation';
import type { Lead } from '@/lib/types';
export function LeadTools({ lead, onChanged }: {
    lead: Lead;
    onChanged?: () => void;
}) {
    const { user } = useAuth();
    const id = String(lead._id || lead.id);
    const [stage, setStage] = useState(lead.stage || 'NEW ENQUIRIES');
    const [message, setMessage] = useState('');
    const [media, setMedia] = useState<{
        id: string;
        publicUrl: string;
    } | null>(null);
    const [query, setQuery] = useState('');
    const [matches, setMatches] = useState<Lead[]>([]);
    const [source, setSource] = useState<Lead | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [task, setTask] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [feedback, setFeedback] = useState('');
    const [busy, setBusy] = useState(false);
    const request = useRef('');
    useEffect(() => { setStage(lead.stage || 'NEW ENQUIRIES'); setMedia(null); setMessage(''); setSource(null); setQuery(''); setFeedback(''); }, [id]);
    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            if (query.trim().length < 2) {
                setMatches([]);
                return;
            }
            try {
                const result = await leadApi.getLeads({ q: query, limit: '10', filterSite: lead.dealer || lead.dealerName || '' });
                if (active)
                    setMatches((result.data || []).filter(row => String(row._id || row.id) !== id));
            }
            catch (error) {
                if (active)
                    setFeedback(String(error));
            }
        }, 250);
        return () => { active = false; clearTimeout(timer); };
    }, [query, id, lead.dealer, lead.dealerName]);
    async function run(action: () => Promise<unknown>, success: string) {
        if (busy)
            return;
        setBusy(true);
        setFeedback('');
        try {
            await action();
            setFeedback(success);
            onChanged?.();
        }
        catch (error) {
            setFeedback(error instanceof Error ? error.message : 'Action failed.');
        }
        finally {
            setBusy(false);
        }
    }
    return <div className="space-y-5">
    <p role="status" className="text-sm text-slate-600">{feedback}</p>
    <section className="rounded-xl border bg-white p-5">
    <h3 className="font-semibold">Pipeline stage</h3>
    <div className="mt-3 flex flex-wrap gap-2">
    <select aria-label="Lead stage" value={stage} onChange={event => setStage(event.target.value)} className="rounded-lg border p-2 text-sm">{['NEW ENQUIRIES', 'IN FOLLOW-UP', 'AI QUALIFYING', 'TEST DRIVE BOOKED', 'COMMITTED', 'DELIVERED', 'LOST', 'OPTED OUT'].map(value => <option key={value}>{value}</option>)}</select>
    <button disabled={busy} onClick={() => void run(() => operation(`/leads/${id}`, { stage }, 'PATCH'), 'Stage saved.')} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Save stage</button>
    </div>
    </section>
    <section className="space-y-3 rounded-xl border bg-white p-5">
    <h3 className="font-semibold">Photo & video message</h3>
    <p className="text-sm text-slate-500">Upload a photo or an MP4/MOV video up to three minutes and 65 MB. A private sharing link is sent using BYD’s existing SMS service.</p>
    <label className="block text-sm font-medium">Choose photo or video<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={event => {
            const file = event.target.files?.[0];
            if (!file)
                return;
            void run(async () => { const result = await uploadMedia(file, { leadId: id }); setMedia(result); request.current = ''; }, 'Attachment uploaded. Review your message before sending.');
            event.target.value = '';
        }} className="mt-2 block w-full rounded-lg border p-3 text-sm"/>
    </label>
    <label className="block text-sm font-medium">Record on your phone<input disabled={busy} type="file" accept="video/mp4,video/quicktime" capture="environment" onChange={event => {
            const file = event.target.files?.[0];
            if (file)
                void run(async () => { setMedia(await uploadMedia(file, { leadId: id })); request.current = ''; }, 'Video uploaded. Review before sending.');
            event.target.value = '';
        }} className="mt-2 block w-full rounded-lg border p-3 text-sm"/>
    </label>{media && <div className="flex gap-3 text-sm">
        <a href={media.publicUrl} target="_blank" rel="noreferrer" className="text-red-700 underline">Preview attachment</a>
        <button onClick={() => { setMedia(null); request.current = ''; }} className="underline">Remove</button>
        </div>}<label className="block text-sm font-medium">Message<textarea maxLength={3500} rows={3} value={message} onChange={event => { setMessage(event.target.value); request.current = ''; }} className="mt-2 w-full rounded-lg border p-3 text-sm"/>
    </label>
    <p className="text-sm text-slate-500">To: {lead.name} · {lead.phone || 'No mobile recorded'}</p>
    <button disabled={busy || !message.trim() || !lead.phone} onClick={() => void run(async () => { request.current ||= crypto.randomUUID(); await operation(`/leads/${id}/messages`, { body: message, mediaIds: media ? [media.id] : [], requestId: request.current }); setMessage(''); setMedia(null); request.current = ''; }, 'Message accepted by the SMS provider. Delivery status appears in the conversation.')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Working…' : 'Send message'}</button>
    </section>
    {isManager(user?.role) && <form onSubmit={event => { event.preventDefault(); void run(async () => { await operation(`/leads/${id}/tasks`, { title: task, body: task, dueAt: melbourneDateTime(dueAt.slice(0, 10), dueAt.slice(11, 16)) }); setTask(''); }, 'Follow-up task saved.'); }} className="space-y-3 rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Next action</h3>
        <input aria-label="Follow-up action" required value={task} onChange={event => setTask(event.target.value)} placeholder="Call customer after test drive" className="w-full rounded-lg border p-3 text-sm"/>
        <label className="block text-sm">Due date and time (Melbourne)<input required type="datetime-local" value={dueAt} onChange={event => setDueAt(event.target.value)} className="ml-3 rounded-lg border p-2"/>
        </label>
        <button disabled={busy} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Save next action</button>
        </form>}
    {isManager(user?.role) && <section className="space-y-3 rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Merge duplicate leads</h3>
        <p className="text-sm text-slate-500">Keep {lead.name} as the primary record. The duplicate’s activity and linked work move here; its original snapshot is retained.</p>
        <input aria-label="Find duplicate" placeholder="Search duplicate by name, phone or email" value={query} onChange={event => { setQuery(event.target.value); setSource(null); setConfirmed(false); }} className="w-full rounded-lg border p-3 text-sm"/>{matches.map(row => <button key={String(row._id || row.id)} onClick={() => { setSource(row); setConfirmed(false); }} className={`block w-full rounded-lg border p-3 text-left text-sm ${source === row ? 'border-red-400 bg-red-50' : ''}`}>
            <strong>{row.name}</strong> · {row.phone} · {row.dealer || row.dealerName}</button>)}{source && <>
            <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)}/>Merge {source.name} into {lead.name} and archive the duplicate.</label>
            <button disabled={busy || !confirmed} onClick={() => void run(async () => { await operation(`/leads/${id}/merge`, { sourceLeadId: String(source._id || source.id) }); setSource(null); setQuery(''); setMatches([]); }, 'Duplicate merged. History and linked work are preserved.')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Merge selected duplicate</button>
            </>}</section>}
  </div>;
}
