'use client';
import React, { useEffect, useState } from 'react';
import { postDeliveryApi, PostDeliveryFollowup } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DeliveryProfile } from './DeliveryProfile';

export function PostDeliveryFollowups() {
  const { activeSite, user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [rows, setRows] = useState<PostDeliveryFollowup[]>([]);
  const [selected, setSelected] = useState<PostDeliveryFollowup | null>(null);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('Contacted');
  const [textAction, setTextAction] = useState('No text required');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true, pending = false; setRows([]); setSelected(null); setProfileId(null); setError('');
    const refresh = async () => {
      if (pending || document.visibilityState !== 'visible') return;
      pending = true;
      try { const result = await postDeliveryApi.list(activeSite); if (!result.success || !result.data) throw new Error(result.message || 'Reminders unavailable.'); if (active) { setRows(result.data); setError(''); } }
      catch (error) { if (active) setError(error instanceof Error ? error.message : 'Reminders unavailable.'); }
      finally { pending = false; }
    };
    void refresh(); const timer = window.setInterval(refresh, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [activeSite, user?.id]);
  async function complete(event: React.FormEvent) {
    event.preventDefault(); if (!selected || busy) return;
    setBusy(true); setError('');
    try {
      const result = await postDeliveryApi.complete(selected.id, { notes: notes.trim(), call_outcome: outcome, text_action: textAction });
      if (!result.success) throw new Error(result.message || 'Follow-up was not saved.');
      setRows(previous => previous.filter(row => row.id !== selected.id)); setSelected(null);
    } catch (error) { setError(error instanceof Error ? error.message : 'Follow-up was not saved.'); }
    finally { setBusy(false); }
  }
  async function sendText() {
    if (!selected || busy || !text.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await postDeliveryApi.sendText({ client_id: selected.client_id, phone: selected.phone, site: selected.site, body: text.trim() });
      if (!result.success || ['failed', 'error', 'unconfigured', 'unknown'].includes(result.data?.status || '')) throw new Error(result.message || 'Text was not sent.');
      setText(''); setTextAction('Text sent'); setNotice('Text sent and recorded in customer history.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Text was not sent.'); }
    finally { setBusy(false); }
  }
  return <>
    {error && !selected && <p role="alert" className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">Post-delivery reminders: {error} Retrying automatically.</p>}
    {!!rows.length && <aside aria-label="Post-delivery call reminders" className="flex flex-wrap items-center gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950"><strong>Post-delivery calls · {rows.length}</strong>{rows.map(row => <button key={row.id} onClick={() => { setSelected(row); setNotes(''); setText(''); setError(''); setNotice(''); setOutcome('Contacted'); setTextAction('No text required'); }} className="rounded-lg border border-amber-200 bg-white px-3 py-1">{row.customer_name} · Day 3 follow-up</button>)}</aside>}
    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3"><section role="dialog" aria-modal="true" aria-label="Post-delivery follow-up" className="max-h-[92dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{selected.customer_name} · Day 3 follow-up</h2><p className="mt-1 text-sm text-slate-500">{selected.vehicle} · {selected.salesperson_name || 'Sales team'}</p></div><button type="button" disabled={busy} onClick={() => setSelected(null)} className="rounded-lg border px-3 py-1">Close</button></div>
      <p className="text-sm text-slate-600">{selected.body}</p>
      <div className="flex flex-wrap gap-3"><a href={`tel:${selected.phone}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Call {selected.phone}</a>{selected.customer_id && <button type="button" onClick={() => { setProfileId(selected.customer_id!); setSelected(null); }} className="rounded-lg border px-3 py-2 text-sm">Open delivery profile</button>}</div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
      <form onSubmit={complete} className="space-y-3 border-t pt-4">
        <label className="block text-sm">Call outcome<select aria-label="Call outcome" value={outcome} onChange={event => setOutcome(event.target.value)} className="mt-1 w-full rounded-lg border p-2">{['Contacted','Voicemail','No answer','Call scheduled'].map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="block text-sm">Call notes<textarea required maxLength={2000} rows={4} value={notes} onChange={event => setNotes(event.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
        <label className="block text-sm">Text action<select aria-label="Text action" value={textAction} onChange={event => setTextAction(event.target.value)} className="mt-1 w-full rounded-lg border p-2">{['No text required','Text planned','Text sent'].map(value => <option key={value}>{value}</option>)}</select></label>
        <button disabled={busy || !notes.trim()} className="rounded-lg bg-[#e60012] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save notes & complete follow-up'}</button>
      </form>
      <div className="space-y-2 border-t pt-4"><label className="block text-sm">Optional customer text<textarea maxLength={2000} rows={3} value={text} onChange={event => setText(event.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><button type="button" disabled={busy || !text.trim()} onClick={sendText} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Send customer text</button></div>
    </section></div>}
    {profileId && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3"><section role="dialog" aria-modal="true" aria-label="Customer delivery profile" className="max-h-[92dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">Customer delivery profile</h2><button type="button" onClick={() => setProfileId(null)} className="rounded-lg border px-3 py-1">Close</button></div><DeliveryProfile referenceId={profileId} allowSold={false}/></section></div>}
  </>;
}
