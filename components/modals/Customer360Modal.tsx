'use client';

import React, { useEffect, useState } from 'react';
import { X, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { Lead, Delivery } from '@/lib/types';
import { leadApi } from '@/lib/api';
import { DeliveryProfile, DeliveryFinance } from '@/components/customer/DeliveryProfile';

type Tab = 'overview' | 'activity' | 'vehicle' | 'finance' | 'delivery' | 'documents' | 'history';
const tabs: {id: Tab; label: string; summary: string}[] = [
  {id: 'overview', label: 'Overview', summary: 'Customer snapshot, vehicle of interest, current stage and next action.'},
  {id: 'activity', label: 'Activity / Notes', summary: 'Recent calls, SMS and notes from the customer journey. Add internal context or contact the customer.'},
  {id: 'vehicle', label: 'Vehicle & Spec', summary: 'The enquiry vehicle, its stock reference and available specification details.'},
  {id: 'finance', label: 'Finance / Payment', summary: 'Payment arrangements and the finance or leasing provider recorded for Delivery.'},
  {id: 'delivery', label: 'Delivery', summary: 'Agreed promises, delivery window, payment details and permanent Sales ↔ Delivery chat.'},
  {id: 'documents', label: 'Documents', summary: 'Documents already attached to this customer’s linked Delivery profile.'},
  {id: 'history', label: 'History', summary: 'The full customer timeline across the connected sales and delivery systems.'},
];
interface Props { lead: Lead | null; delivery?: Delivery | null; onClose: () => void; onOpenBookDrive: (lead: Lead) => void; onOpenMessage: (lead: Lead) => void; onUpdateStage: (leadId: string, stage: string) => void; onAddNote: (leadId: string, note: string) => void }
export function Customer360Modal({lead, delivery, onClose, onOpenBookDrive, onOpenMessage, onUpdateStage, onAddNote}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const referenceId = String(lead?._id || lead?.id || '');
  useEffect(() => { setTab('overview'); setTimeline([]); setNote(''); setError(''); }, [referenceId]);
  useEffect(() => {
    if (!referenceId || !['activity','history'].includes(tab)) return;
    let active = true;
    setLoading(true);
    const refresh = async () => { try {
      const response = await leadApi.getTimeline(referenceId);
      if (active) { if (response.success && response.data) setTimeline(Array.isArray(response.data) ? response.data : [...(response.data.timelineEvents || []), ...(response.data.auditTrail || [])].sort((a,b) => new Date(b.occurred_at || b.createdAt || 0).getTime() - new Date(a.occurred_at || a.createdAt || 0).getTime())); else setError(response.message || 'Timeline unavailable.'); }
    } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Timeline unavailable.'); }
    finally { if (active) setLoading(false); } };
    void refresh(); const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [referenceId, tab]);
  if (!lead) return null;
  const site = lead.dealer || lead.dealerName || 'Not recorded';
  const vehicle = lead.vehicle || lead.model || 'No enquiry vehicle recorded';
  async function saveNote(event: React.FormEvent) {
    event.preventDefault(); if (busy || !note.trim()) return; setBusy(true); setError('');
    try { await onAddNote(referenceId, note.trim()); setNote(''); const response = await leadApi.getTimeline(referenceId); if (response.success && response.data) setTimeline(Array.isArray(response.data) ? response.data : [...(response.data.timelineEvents || []), ...(response.data.auditTrail || [])]); }
    catch (error) { setError(error instanceof Error ? error.message : 'Note was not saved.'); } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:p-4">
    <div role="dialog" aria-modal="true" aria-label={`Customer card: ${lead.name}`} className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">{lead.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-900">{lead.name}</h2><p className="mt-1 text-xs text-slate-500">{site} · {lead.stage || lead.status || 'Stage not recorded'}</p></div></div><button type="button" onClick={onClose} aria-label="Close customer card" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"><X className="h-5 w-5"/></button></header>
      <nav aria-label="Customer sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 px-4" role="tablist">{tabs.map(t => <button key={t.id} id={`customer-tab-${t.id}`} role="tab" aria-selected={t.id===tab} aria-controls="customer-tab-content" onClick={() => setTab(t.id)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold ${tab===t.id ? 'border-red-600 text-red-700' : 'border-transparent text-slate-600'}`}>{t.label}</button>)}</nav>
      <div id="customer-tab-content" role="tabpanel" aria-labelledby={`customer-tab-${tab}`} className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-5 sm:p-6">
        <p className="max-w-3xl text-sm text-slate-600">{tabs.find(t => t.id===tab)?.summary}</p>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {tab==='overview' && <div className="grid gap-5 md:grid-cols-[240px_1fr]">
          <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact details</h3><p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-slate-400"/>{lead.phone || 'No phone recorded'}</p><p className="flex break-all items-center gap-2 text-sm"><Mail className="h-4 w-4 shrink-0 text-slate-400"/>{lead.email || 'No email recorded'}</p><p className="text-sm text-slate-500">Consultant: {lead.consultant || lead.allocatedPersonFullName || 'Unassigned'}</p><button onClick={() => onOpenMessage(lead)} className="w-full rounded-lg border px-3 py-2 text-sm font-semibold">Message customer</button></aside>
          <section className="space-y-5"><div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle of interest</h3><p className="mt-2 text-xl font-semibold text-slate-900">{vehicle}</p></div>
            <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">{[['Current stage',lead.stage || lead.status || 'Not recorded'],['Next action',lead.action || 'No next action recorded'],['Source',lead.source || 'Not recorded'],['Last activity',lead.lastTouch || 'Not recorded']].map(([label,value]) => <div key={label}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-900">{value}</dd></div>)}</dl>
            {lead.notes && <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Customer summary</h3><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{lead.notes}</p><button onClick={() => setTab('activity')} className="mt-3 text-sm font-semibold text-red-700">Read notes and activity</button></div>}
            <div className="flex flex-wrap gap-3"><button onClick={() => onOpenBookDrive(lead)} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm"><Calendar className="h-4 w-4"/>Book test drive</button><button onClick={() => setTab('delivery')} className="rounded-lg bg-[#e60012] px-4 py-2 text-sm font-semibold text-white">{delivery || /sold|delivery|won/i.test(lead.stage || lead.status || '') ? 'View Delivery handoff' : 'Sold · send to Delivery'}</button></div>
          </section>
        </div>}
        {(tab==='activity' || tab==='history') && <div className="space-y-4">{tab==='activity' && <><div className="flex flex-wrap gap-2"><button onClick={() => onOpenMessage(lead)} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><MessageSquare className="h-4 w-4"/>SMS customer</button><button onClick={() => onOpenBookDrive(lead)} className="rounded-lg border bg-white px-3 py-2 text-sm">Book test drive</button></div><form onSubmit={saveNote} className="space-y-2 rounded-xl border bg-white p-4"><label className="text-sm font-semibold" htmlFor="customer-internal-note">Internal note</label><textarea id="customer-internal-note" required maxLength={2000} rows={3} value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-lg border p-3 text-sm"/><button disabled={busy || !note.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save note'}</button></form></>}
          {loading ? <p className="text-sm text-slate-500">Loading activity…</p> : !timeline.length ? <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">No recorded activity yet.</p> : timeline.map((event,index) => <article key={event.event_id || event.id || index} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><strong className="text-slate-800">{event.title || event.type || 'Customer activity'}</strong><span>{event.author_name || event.author || event.source || ''}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{event.content || event.body || event.message || event.detail || ''}</p><time className="mt-2 block text-xs text-slate-500">{event.timestamp || event.occurred_at || event.createdAt ? new Date(event.timestamp || event.occurred_at || event.createdAt).toLocaleString('en-AU') : ''}</time></article>)}
        </div>}
        {tab==='vehicle' && <dl className="grid gap-5 rounded-xl border bg-white p-5 sm:grid-cols-2">{[['Enquiry vehicle',vehicle],['Stock reference',lead.virtualyardId || delivery?.vy_order_id || 'Not allocated'],['Registration',delivery?.rego || 'Not recorded'],['VIN',delivery?.vin || 'Not recorded']].map(([label,value]) => <div key={label}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>)}</dl>}
        {tab==='finance' && <div className="rounded-xl border bg-white p-5"><DeliveryFinance referenceId={referenceId}/></div>}
        {tab==='delivery' && <DeliveryProfile referenceId={referenceId} vehicle={lead.vehicle || lead.model}/>}
        {tab==='documents' && <div className="space-y-3">{!delivery?.documents?.length ? <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">No linked delivery documents are available on this card. Quotes and contracts can be managed from the CRM customer profile.</p> : delivery.documents.map((doc,index) => <article key={doc._id || index} className="rounded-xl border bg-white p-4"><h3 className="text-sm font-semibold">{doc.title || doc.document_type}</h3><p className="mt-1 text-xs text-slate-500">{doc.status}</p></article>)}</div>}
      </div>
    </div>
  </div>;
}
