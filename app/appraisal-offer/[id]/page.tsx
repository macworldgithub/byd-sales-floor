"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/appraisals";
import { Attachment } from "@/components/appraisals/Attachment";
export default function AppraisalOffer() {
  const { id } = useParams<{ id: string }>(),
    [token, setToken] = useState(""),
    [data, setData] = useState<any>(null),
    [amount, setAmount] = useState(""),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const secret = window.location.hash.slice(1);
    setToken(secret);
    let active = true;
    fetch(`${API_BASE}/appraisal-bids/${encodeURIComponent(id)}`, {
      headers: { "X-Appraisal-Token": secret },
      cache: "no-store",
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "Valuation unavailable.");
        return json.data;
      })
      .then((value) => {
        if (active) {
          setData(value);
          setAmount(String(value.invitation.bid?.amount || ""));
          setNotes(value.invitation.bid?.notes || "");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/appraisal-bids/${encodeURIComponent(id)}`,
        {
          method: "POST",
          headers: {
            "X-Appraisal-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revision: data.invitation.revision,
            amount: Number(amount),
            notes,
          }),
        },
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Offer not saved.");
      setData({
        ...data,
        invitation: {
          ...data.invitation,
          bid: json.data,
          revision: json.data.revision,
        },
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const field =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm";
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-red-700">
            BYD Sales Floor
          </p>
          <h1 className="mt-2 text-3xl font-bold">Private vehicle valuation</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review the inspection and submit your valuation directly to the
            dealership.
          </p>
        </header>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {!data && !error ? (
          <p className="text-sm text-slate-500">Loading inspection…</p>
        ) : (
          data && (
            <>
              <section className="rounded-2xl border bg-white p-6">
                <p className="text-sm text-slate-500">
                  Prepared for {data.invitation.partnerName} ·{" "}
                  {data.invitation.company}
                </p>
                <h2 className="mt-3 text-2xl font-bold">
                  {[data.vehicle.year, data.vehicle.make, data.vehicle.model]
                    .filter(Boolean)
                    .join(" ")}
                </h2>
                <p className="mt-1 text-lg">
                  {data.vehicle.rego} ·{" "}
                  {data.vehicle.odometer?.toLocaleString("en-AU")} km
                </p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                  {Object.entries(data.vehicle)
                    .filter(
                      ([, value]) =>
                        value !== null && value !== undefined && value !== "",
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs font-semibold uppercase text-slate-500">
                          {key}
                        </dt>
                        <dd className="mt-1 text-sm">{String(value)}</dd>
                      </div>
                    ))}
                </dl>
              </section>
              <section className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold">Inspection evidence</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {data.condition.notes}
                </p>
                <div className="my-4 space-y-2">
                  {(data.condition.damagePoints || [])
                    .filter((finding: any) => finding.decision !== "dismissed")
                    .map((finding: any, index: number) => (
                      <p
                        key={index}
                        className="rounded-lg bg-slate-50 p-3 text-sm"
                      >
                        <strong>
                          {finding.panel} · {finding.severity}
                        </strong>{" "}
                        · {finding.description}
                      </p>
                    ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {data.media.map((file: any) => (
                    <Attachment
                      key={file.id}
                      file={{ ...file, name: file.shot }}
                      invitation={{ id, token }}
                    />
                  ))}
                </div>
              </section>
              <form
                onSubmit={submit}
                className="space-y-4 rounded-2xl border bg-white p-6"
              >
                <div>
                  <h2 className="text-lg font-semibold">Your valuation</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline:{" "}
                    {new Date(data.invitation.expiresAt).toLocaleString(
                      "en-AU",
                    )}
                  </p>
                </div>
                {data.closed ? (
                  <p className="rounded-lg bg-slate-100 p-3 text-sm">
                    {data.selected
                      ? "Your valuation was selected by the dealership."
                      : "The dealership has closed valuations for this vehicle."}
                  </p>
                ) : (
                  <>
                    <label className="block text-sm font-semibold">
                      Offer amount (AUD)
                      <input
                        type="number"
                        required
                        min={0.01}
                        step="0.01"
                        max={10000000}
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setSaved(false);
                        }}
                        className={field}
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      Conditions / notes
                      <textarea
                        maxLength={2000}
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value);
                          setSaved(false);
                        }}
                        rows={4}
                        className={field}
                      />
                    </label>
                    <button
                      disabled={busy}
                      className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {busy
                        ? "Saving…"
                        : data.invitation.bid
                          ? "Update valuation"
                          : "Submit valuation"}
                    </button>
                    {saved && (
                      <p
                        role="status"
                        className="text-sm font-semibold text-emerald-700"
                      >
                        Valuation saved and available to the dealership.
                      </p>
                    )}
                  </>
                )}
              </form>
            </>
          )
        )}
      </div>
    </main>
  );
}
