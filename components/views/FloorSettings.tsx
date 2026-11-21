'use client';
import { useEffect, useState } from 'react';
import { operation } from '@/lib/operations';
import { useAuth } from '@/lib/auth';
export function FloorSettings() {
    const { activeSite } = useAuth();
    const [config, setConfig] = useState<any>(null);
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        setConfig(null);
        operation('/settings').then(value => {
            if (active)
                setConfig(value);
        }).catch(error => {
            if (active)
                setStatus(error.message);
        });
        return () => { active = false; };
    }, [activeSite]);
    return <form className="mt-6 space-y-4 rounded-xl border bg-white p-5" onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            try {
                setConfig(await operation('/settings', { site: activeSite, settings: config }, 'PUT'));
                setStatus('Sales Floor settings saved.');
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : 'Settings not saved.');
            }
            finally {
                setBusy(false);
            }
        }}>
    <h2 className="text-lg font-semibold">PULSE, presence & communication settings</h2>
    <p className="text-sm text-slate-500">Choose a dealership to configure its traffic signals, geofence and verified BYD SMS sender.</p>
    <p role="status" className="text-sm text-slate-600">{status}</p>{config && <>
        <div className="grid gap-4 sm:grid-cols-2">{[['Follow-up amber (hours)', 'followupAmberHours'], ['Follow-up red (hours)', 'followupRedHours'], ['Conversion amber (%)', 'conversionAmber'], ['Conversion green (%)', 'conversionGreen']].map(([label, key]) => <label key={key} className="text-sm font-medium">{label}<input required type="number" min="0" value={config[key]} onChange={event => setConfig({ ...config, [key]: Number(event.target.value) })} className="mt-2 block w-full rounded-lg border p-3"/>
            </label>)}</div>
        <label className="block text-sm font-medium">Verified SMS sender<input value={config.smsSenderId} onChange={event => setConfig({ ...config, smsSenderId: event.target.value })} className="mt-2 w-full rounded-lg border p-3"/>
        </label>
        <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Showroom geofence</legend>{[['Latitude', 'latitude'], ['Longitude', 'longitude'], ['Radius (metres)', 'radiusMeters']].map(([label, key]) => <label key={key} className="text-sm">{label}<input type="number" step="any" value={config.geofence?.[key] ?? ''} onChange={event => setConfig({ ...config, geofence: { ...config.geofence, [key]: Number(event.target.value) } })} className="mt-2 w-full rounded-lg border p-3"/>
            </label>)}</fieldset>
        <button disabled={busy || /^all/i.test(activeSite)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save site settings'}</button>
        </>}</form>;
}
