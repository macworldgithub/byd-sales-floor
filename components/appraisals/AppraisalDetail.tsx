"use client";
import { useEffect, useState } from "react";
import {
  Appraisal,
  appraisalApi,
  Damage,
  downloadJson,
  Metadata,
  Offer,
  Partner,
  result,
} from "@/lib/appraisals";
import { fetchApi } from "@/lib/api";
import { Attachment } from "./Attachment";
import { LoanForm } from "./LoanForm";
const field =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900";
const button =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const money = (value: number | undefined) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
      }).format(value);
const transitions: Record<string, string[]> = {
  Draft: ["Pending Inspection"],
  "Pending Inspection": ["Draft", "Completed"],
  Completed: ["Pending Inspection", "Approved", "Declined"],
  Approved: ["Pending Inspection", "Traded", "Lost"],
  Declined: ["Pending Inspection"],
  Lost: ["Pending Inspection"],
  Traded: [],
};
export function AppraisalDetail({
  initial,
  metadata,
  manager,
  onBack,
  onChanged,
}: {
  initial: Appraisal;
  metadata: Metadata;
  manager: boolean;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [record, setRecord] = useState(initial),
    [draft, setDraft] = useState(initial),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [tab, setTab] = useState("vehicle"),
    [shot, setShot] = useState(metadata.shots[0]),
    [purpose, setPurpose] = useState("inspection"),
    [driveOdo, setDriveOdo] = useState(String(initial.odometer ?? "")),
    [driveNotes, setDriveNotes] = useState("");
  const [deal, setDeal] = useState(""),
    [delivery, setDelivery] = useState(""),
    [statusNote, setStatusNote] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]),
    [offers, setOffers] = useState<Offer[]>([]),
    [partnerIds, setPartnerIds] = useState<string[]>([]),
    [links, setLinks] = useState<
      { id: string; url: string; partnerName: string }[]
    >([]);
  const [deadline, setDeadline] = useState(() =>
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  );
  const closed = ["Approved", "Traded", "Lost", "Declined"].includes(
    record.status,
  );
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    if (tab !== "wholesale" || !manager) return;
    let active = true;
    Promise.all([
      fetchApi<Partner[]>(
        `/appraisals/partners?${new URLSearchParams({ site: record.site, limit: "100" })}`,
      ),
      fetchApi<Offer[]>(`/appraisals/${record.appraisalId}/offers`),
    ])
      .then(([p, o]) => {
        if (active) {
          if (p?.data) setPartners(p.data);
          if (o.data) setOffers(o.data);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [tab, record.appraisalId, record.site, manager, record.revision]);
  function accept(next: Appraisal) {
    setRecord(next);
    setDraft(next);
    setDirty(false);
    onChanged();
  }
  async function persist() {
    if (!dirty) return record;
    const next = await appraisalApi.save(record.appraisalId, {
      ...draft,
      valuation: Object.fromEntries(
        Object.entries(draft.valuation).filter(([key]) =>
          [
            "wholesaleValue",
            "retailValue",
            "customerExpectation",
            "tradeInAllowance",
            "payoutEstimate",
            "reconditioningCost",
          ].includes(key),
        ),
      ),
      revision: record.revision,
    });
    accept(next);
    return next;
  }
  async function run(fn: (saved: Appraisal) => Promise<Appraisal>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await persist();
      accept(await fn(saved));
      setNotice("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The request failed.");
    } finally {
      setBusy(false);
    }
  }
  function change<K extends keyof Appraisal>(key: K, value: Appraisal[K]) {
    setDraft((old) => ({ ...old, [key]: value }));
    setDirty(true);
  }
  function condition(key: string, value: unknown) {
    setDraft((old) => ({
      ...old,
      condition: { ...old.condition, [key]: value },
    }));
    setDirty(true);
  }
  function damage(index: number, patch: Partial<Damage>) {
    condition(
      "damagePoints",
      (draft.condition.damagePoints || []).map((r, i) =>
        i === index ? { ...r, ...patch } : r,
      ),
    );
  }
  async function invoke(path: string, body: Record<string, unknown> = {}) {
    await run((saved) =>
      result(
        fetchApi<Appraisal>(`/appraisals/${saved.appraisalId}/${path}`, {
          method: "POST",
          body: JSON.stringify({ ...body, revision: saved.revision }),
        }),
      ),
    );
  }
  const checks = record.ppsrDetails;
  function vehicleRequestId(kind: 'rego' | 'ppsr') {
    const identity = kind === 'rego' ? `${draft.rego || ''}:${draft.state || 'VIC'}` : draft.vin || '';
    const key = `byd_appraisal_check:${record.appraisalId}:${kind}:${identity.toUpperCase()}`;
    const previous = localStorage.getItem(key);
    if(previous) return previous;
    const requestId = crypto.randomUUID(); localStorage.setItem(key,requestId); return requestId;
  }
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            disabled={busy}
            className="mb-3 text-sm font-semibold text-slate-600"
            onClick={async () => {
              setBusy(true);
              try {
                await persist();
                onBack();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            &larr; Appraisals
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {record.rego || "New vehicle"}{" "}
            <span className="font-normal text-slate-500">
              {[record.year, record.make, record.model]
                .filter(Boolean)
                .join(" ")}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {record.customerName} · {record.site} · {record.appraisalId}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">
            {record.status}
          </span>
          <button
            type="button"
            disabled={busy}
            className={button}
            onClick={() => {
              setBusy(true);
              result(fetchApi<Appraisal>(`/appraisals/${record.appraisalId}`))
                .then(accept)
                .catch((e) => setError(e.message))
                .finally(() => setBusy(false));
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={busy}
            className={button}
            onClick={() => downloadJson(record, `${record.appraisalId}.json`)}
          >
            Export
          </button>
          <button
            type="button"
            disabled={busy || !dirty || closed}
            onClick={() => run((saved) => Promise.resolve(saved))}
            className="rounded-lg bg-[#e60012] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-emerald-700">
          {notice}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
        <div>
          <span
            className={`text-sm font-semibold ${record.ppsrStatus === "Clear" ? "text-emerald-700" : record.ppsrStatus === "Encumbered" ? "text-red-700" : "text-amber-700"}`}
          >
            PPSR · {record.ppsrStatus}
          </span>
          <p className="mt-1 text-xs text-slate-500">
            {checks?.verified
              ? `Certificate ${checks.certificateNumber} · ${new Date(checks.checkedAt!).toLocaleString("en-AU")}`
              : "No verified clearance attached"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(transitions[record.status] || [])
            .filter(
              (s) =>
                manager ||
                (!["Approved", "Declined", "Traded", "Lost"].includes(s) &&
                  record.status !== "Approved" &&
                  record.status !== "Declined"),
            )
            .map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                className={button}
                onClick={() => invoke("status", { status, notes: statusNote })}
              >
                {status === "Pending Inspection" && closed
                  ? "Reopen inspection"
                  : `Mark ${status.toLowerCase()}`}
              </button>
            ))}
        </div>
      </div>
      <nav
        aria-label="Appraisal sections"
        className="flex gap-1 overflow-x-auto border-b"
      >
        {[
          ["vehicle", "Vehicle"],
          ["inspection", "Walk-around"],
          ["documents", "Documents"],
          ["drive", "Internal drives"],
          ["loan", "Loan car"],
          ...(manager ? [["wholesale", "Wholesale & valuation"]] : []),
          ["links", "Deal & delivery"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${tab === id ? "border-red-600 text-red-700" : "border-transparent text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {tab === "vehicle" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["rego", "Registration"],
                ["vin", "VIN"],
                ["make", "Make"],
                ["model", "Model"],
                ["variant", "Variant"],
                ["year", "Year"],
                ["odometer", "Odometer (km)"],
                ["colour", "Colour"],
                ["bodyType", "Body type"],
                ["transmission", "Transmission"],
                ["fuelType", "Fuel type"],
                ["engine", "Engine"],
                ["keys", "Number of keys"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="text-xs font-semibold text-slate-600"
                >
                  {label}
                  <input
                    disabled={closed || busy}
                    type={
                      ["year", "odometer", "keys"].includes(key)
                        ? "number"
                        : "text"
                    }
                    min={0}
                    value={String(draft[key as keyof Appraisal] ?? "")}
                    onChange={(e) =>
                      change(
                        key as keyof Appraisal,
                        (e.target.type === "number"
                          ? e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                          : e.target.value) as never,
                      )
                    }
                    className={field}
                  />
                </label>
              ))}
              <label className="text-xs font-semibold text-slate-600">
                Registration state
                <select
                  disabled={closed || busy}
                  value={draft.state || "VIC"}
                  onChange={(e) => change("state", e.target.value)}
                  className={field}
                >
                  {metadata.states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={closed || busy || !metadata.providers.rego.configured}
                onClick={() =>
                  invoke("rego", { requestId: vehicleRequestId('rego') })
                }
                className={button}
              >
                Verify registration → VIN
              </button>
              <button
                disabled={closed || busy || !metadata.providers.ppsr.configured}
                onClick={() =>
                  invoke("ppsr", { requestId: vehicleRequestId('ppsr') })
                }
                className={button}
              >
                Run PPSR check
              </button>
            </div>
            {(!metadata.providers.rego.configured ||
              !metadata.providers.ppsr.configured) && (
              <p className="text-xs text-amber-800">
                Rego/PPSR require the dealership’s provider account. Enter
                vehicle details manually while these services are unavailable.
              </p>
            )}
            <label className="block text-xs font-semibold text-slate-600">
              Service history
              <textarea
                disabled={closed || busy}
                rows={3}
                value={draft.serviceHistory || ""}
                onChange={(e) => change("serviceHistory", e.target.value)}
                className={field}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Appraisal notes
              <textarea
                disabled={closed || busy}
                rows={3}
                value={draft.notes || ""}
                onChange={(e) => change("notes", e.target.value)}
                className={field}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Customer expectation (AUD)
              <input
                disabled={closed || busy}
                type="number"
                min={0}
                value={draft.valuation.customerExpectation ?? ""}
                onChange={(e) =>
                  change("valuation", {
                    ...draft.valuation,
                    customerExpectation: Number(e.target.value),
                  })
                }
                className={field}
              />
            </label>
          </div>
        )}
        {tab === "inspection" && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Guided walk-around</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Capture each view, assess condition and record damage. Videos
                  are limited to 3 minutes.
                </p>
              </div>
              <button
                disabled={busy || closed || !metadata.damageAI.configured}
                className={button}
                onClick={() => invoke("analyse")}
              >
                Suggest damage with AI
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {metadata.shots.map((view) => {
                const taken = record.media.some(
                  (m) =>
                    m.purpose === "inspection" &&
                    m.shot === view &&
                    m.kind === "image",
                );
                return (
                  <button
                    key={view}
                    type="button"
                    onClick={() => {
                      setShot(view);
                      setPurpose("inspection");
                    }}
                    className={`rounded-xl border p-3 text-left text-sm ${shot === view ? "border-red-500 ring-1 ring-red-200" : taken ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}
                  >
                    <strong>{view}</strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {taken
                        ? "Photo captured"
                        : metadata.requiredShots.includes(view)
                          ? "Photo required"
                          : "Optional view"}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="block rounded-xl border-2 border-dashed border-slate-300 p-5 text-sm font-semibold">
              Capture {shot}
              <input
                disabled={busy || closed}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                capture="environment"
                className="mt-3 block w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file)
                    void run((saved) =>
                      appraisalApi.upload(saved.appraisalId, file, {
                        purpose: "inspection",
                        shot,
                        name: file.name,
                      }),
                    );
                }}
              />
            </label>
            {!metadata.damageAI.configured && (
              <p className="text-xs text-slate-500">
                Damage AI is awaiting provider configuration. Staff can record
                and override findings below.
              </p>
            )}
            {record.aiAssessment && (
              <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold">
                  AI suggestions · review each finding
                </h4>
                {record.aiAssessment.findings.length === 0 ? (
                  <p className="text-sm">
                    The provider returned no findings. Complete the manual
                    inspection.
                  </p>
                ) : (
                  record.aiAssessment.findings.map((finding, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-blue-100 pt-2 text-sm"
                    >
                      <p>
                        {finding.panel} · {finding.severity} ·{" "}
                        {finding.description}
                      </p>
                      <button
                        disabled={closed || busy}
                        className={button}
                        onClick={() =>
                          condition("damagePoints", [
                            ...(draft.condition.damagePoints || []),
                            { ...finding, decision: "accepted" },
                          ])
                        }
                      >
                        Add for review
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                ["exteriorRating", "Exterior"],
                ["interiorRating", "Interior"],
                ["tyresRating", "Tyres"],
                ["mechanicalRating", "Mechanical"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-semibold">
                  {label}
                  <select
                    disabled={closed || busy}
                    value={String(
                      draft.condition[key as keyof typeof draft.condition] ??
                        "",
                    )}
                    onChange={(e) =>
                      condition(
                        key,
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={field}
                  >
                    <option value="">Not assessed</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Damage & reconditioning</h4>
                <button
                  disabled={closed || busy}
                  className={button}
                  onClick={() =>
                    condition("damagePoints", [
                      ...(draft.condition.damagePoints || []),
                      {
                        panel: "",
                        severity: "Minor",
                        description: "",
                        estimatedRepairCost: 0,
                        source: "manual",
                        decision: "accepted",
                      },
                    ])
                  }
                >
                  Add finding
                </button>
              </div>
              {(draft.condition.damagePoints || []).map((finding, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-xl border bg-slate-50 p-4 sm:grid-cols-2"
                >
                  <label className="text-xs font-semibold">
                    Panel
                    <input
                      disabled={closed || busy}
                      value={finding.panel}
                      onChange={(e) => damage(i, { panel: e.target.value })}
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Severity
                    <select
                      disabled={closed || busy}
                      value={finding.severity}
                      onChange={(e) => damage(i, { severity: e.target.value })}
                      className={field}
                    >
                      {["Minor", "Moderate", "Major"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold">
                    Description
                    <input
                      disabled={closed || busy}
                      value={finding.description}
                      onChange={(e) =>
                        damage(i, {
                          description: e.target.value,
                          decision:
                            finding.source === "ai" ? "edited" : "accepted",
                        })
                      }
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Repair estimate (AUD)
                    <input
                      disabled={closed || busy}
                      type="number"
                      min={0}
                      value={finding.estimatedRepairCost}
                      onChange={(e) =>
                        damage(i, {
                          estimatedRepairCost: Number(e.target.value),
                        })
                      }
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Review decision
                    <select
                      disabled={closed || busy}
                      value={finding.decision || "accepted"}
                      onChange={(e) => damage(i, { decision: e.target.value })}
                      className={field}
                    >
                      {["accepted", "edited", "dismissed"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold">
                    Review / override notes
                    <input
                      disabled={closed || busy}
                      value={finding.reviewNotes || ""}
                      onChange={(e) =>
                        damage(i, { reviewNotes: e.target.value })
                      }
                      className={field}
                    />
                  </label>
                </div>
              ))}
            </div>
            <label className="block text-xs font-semibold">
              Condition notes
              <textarea
                disabled={closed || busy}
                value={draft.condition.notes || ""}
                onChange={(e) => condition("notes", e.target.value)}
                rows={3}
                className={field}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {record.media
                .filter((m) => m.purpose === "inspection")
                .map((file) => (
                  <Attachment key={file.id} file={file} />
                ))}
            </div>
            {record.missing.length > 0 && (
              <p className="text-xs text-amber-800">
                Needed to complete: {record.missing.join(", ")}.
              </p>
            )}
          </div>
        )}
        {tab === "documents" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Private documents</h3>
            <p className="text-sm text-slate-500">
              Licence, service records and existing signed contracts stay with
              the appraisal. Uploading a document does not sign or submit a
              contract.
            </p>
            <select
              value={purpose === "inspection" ? "document" : purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={field}
            >
              <option value="document">Service / supporting document</option>
              <option value="licence">Driver licence</option>
              {manager && (
                <option value="contract">Existing signed contract</option>
              )}
            </select>
            <input
              disabled={busy || closed}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file)
                  void run((saved) =>
                    appraisalApi.upload(saved.appraisalId, file, {
                      purpose: purpose === "inspection" ? "document" : purpose,
                      name: file.name,
                    }),
                  );
              }}
              className="block text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {record.media
                .filter((m) => m.purpose !== "inspection")
                .map((file) => (
                  <Attachment key={file.id} file={file} />
                ))}
            </div>
          </div>
        )}
        {tab === "drive" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Internal test-drive log</h3>
            <p className="text-sm text-slate-500">
              Record staff checkout, return, time and odometer readings.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                {record.activeDriveId ? "Return" : "Start"} odometer (km)
                <input
                  type="number"
                  min={0}
                  value={driveOdo}
                  onChange={(e) => setDriveOdo(e.target.value)}
                  className={field}
                />
              </label>
              <label className="text-xs font-semibold">
                Drive notes
                <input
                  value={driveNotes}
                  onChange={(e) => setDriveNotes(e.target.value)}
                  className={field}
                />
              </label>
            </div>
            <button
              disabled={
                busy ||
                ["Traded", "Lost", "Declined"].includes(record.status) ||
                driveOdo === ""
              }
              className={button}
              onClick={() =>
                invoke(
                  record.activeDriveId ? "drives/finish" : "drives/start",
                  { odometer: Number(driveOdo), notes: driveNotes },
                )
              }
            >
              {record.activeDriveId ? "Finish drive" : "Start staff drive"}
            </button>
            {(record.drives || []).map((d) => (
              <article key={d.id} className="rounded-xl border p-4 text-sm">
                <strong>
                  {d.driverName} · {d.endedAt ? "Returned" : "On drive"}
                </strong>
                <p className="mt-1 text-slate-500">
                  {new Date(d.startedAt).toLocaleString("en-AU")} ·{" "}
                  {d.startOdometer} km
                  {d.endedAt
                    ? ` → ${d.endOdometer} km · ${d.distanceKm} km · ${Math.round((+new Date(d.endedAt) - +new Date(d.startedAt)) / 60000)} minutes`
                    : ""}
                </p>
                <p>{d.notes}</p>
              </article>
            ))}
          </div>
        )}
        {tab === "loan" && (
          <LoanForm record={record} busy={busy || closed} run={run} />
        )}
        {tab === "wholesale" && manager && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Valuation & settlement</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  ["wholesaleValue", "Wholesale value"],
                  ["retailValue", "Retail estimate"],
                  ["tradeInAllowance", "Trade allowance"],
                  ["payoutEstimate", "Payout estimate"],
                  ["reconditioningCost", "Reconditioning"],
                  ["customerExpectation", "Customer expectation"],
                ].map(([key, label]) => (
                  <label key={key} className="text-xs font-semibold">
                    {label} (AUD)
                    <input
                      disabled={busy || closed}
                      type="number"
                      min={0}
                      step="0.01"
                      value={draft.valuation[key] ?? ""}
                      onChange={(e) =>
                        change("valuation", {
                          ...draft.valuation,
                          [key]: Number(e.target.value),
                        })
                      }
                      className={field}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm">
                Net trade allowance:{" "}
                <strong>
                  {draft.valuation.tradeInAllowance == null
                    ? "—"
                    : money(
                        draft.valuation.tradeInAllowance -
                          (draft.valuation.payoutEstimate || 0),
                      )}
                </strong>
              </p>
              {record.selectedOffer && (
                <p className="mt-2 text-sm text-emerald-700">
                  Selected: {record.selectedOffer.partnerName} ·{" "}
                  {money(record.selectedOffer.amount)}
                </p>
              )}
            </div>
            <div className="border-t pt-5">
              <h4 className="font-semibold">Request wholesale valuations</h4>
              <p className="mt-1 text-sm text-slate-500">
                Create a private link for each selected partner, then share it
                with that recipient. Each link expires at the deadline.
              </p>
              <div className="my-3 max-h-48 overflow-y-auto rounded-lg border p-3">
                {partners.filter((p) => p.active && p.kind !== "dealer_staff")
                  .length ? (
                  partners
                    .filter((p) => p.active && p.kind !== "dealer_staff")
                    .map((partner) => (
                      <label
                        key={partner._id}
                        className="flex gap-2 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={partnerIds.includes(partner._id)}
                          onChange={(e) =>
                            setPartnerIds(
                              e.target.checked
                                ? [...partnerIds, partner._id]
                                : partnerIds.filter((id) => id !== partner._id),
                            )
                          }
                        />
                        {partner.name} · {partner.company}
                      </label>
                    ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Add dealer or wholesaler contacts in the Partners directory
                    first.
                  </p>
                )}
              </div>
              <label className="block text-xs font-semibold">
                Deadline (local time)
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={field}
                />
              </label>
              <button
                disabled={
                  busy ||
                  !partnerIds.length ||
                  !["Completed", "Approved"].includes(record.status)
                }
                className={`${button} mt-3`}
                onClick={() =>
                  run(async (saved) => {
                    const invitations = await result(
                      fetchApi<
                        { id: string; url: string; partnerName: string }[]
                      >(`/appraisals/${saved.appraisalId}/invitations`, {
                        method: "POST",
                        body: JSON.stringify({
                          partnerIds,
                          expiresAt: new Date(deadline).toISOString(),
                        }),
                      }),
                    );
                    setLinks(invitations);
                    setPartnerIds([]);
                    return result(
                      fetchApi<Appraisal>(`/appraisals/${saved.appraisalId}`),
                    );
                  })
                }
              >
                Create private invitation links
              </button>
              {links.map((link) => (
                <div
                  key={link.id}
                  className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
                >
                  <strong>{link.partnerName}</strong>
                  <input
                    readOnly
                    value={link.url}
                    onFocus={(e) => e.target.select()}
                    className={field}
                  />
                  <button
                    type="button"
                    className="mt-2 font-semibold underline"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(link.url)
                        .then(() => setNotice("Invitation link copied."))
                        .catch(() =>
                          setError("Select and copy the link above."),
                        )
                    }
                  >
                    Copy private link
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Invitations & received offers</h4>
              {offers.map((offer) => (
                <article
                  key={offer._id}
                  className="rounded-xl border p-4 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>
                      {offer.partnerName} · {offer.company}
                    </strong>
                    <span>
                      {offer.status} · expires{" "}
                      {new Date(offer.expiresAt).toLocaleString("en-AU")}
                    </span>
                  </div>
                  <p className="my-2 text-xl font-semibold">
                    {offer.bid ? money(offer.bid.amount) : "Awaiting offer"}
                  </p>
                  <p className="whitespace-pre-wrap text-slate-600">
                    {offer.bid?.notes}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {offer.bid &&
                      !record.selectedOffer &&
                      offer.status === "Open" && (
                        <button
                          disabled={busy}
                          className={button}
                          onClick={() =>
                            invoke("select-offer", {
                              invitationId: offer._id,
                              offerRevision: offer.revision,
                            })
                          }
                        >
                          Select as wholesale valuation
                        </button>
                      )}
                    {offer.status === "Open" &&
                      record.selectedOffer?.invitationId !== offer._id && (
                        <button
                          disabled={busy}
                          className={button}
                          onClick={() =>
                            run(async (saved) => {
                              await result(
                                fetchApi(
                                  `/appraisals/${saved.appraisalId}/invitations/${offer._id}/revoke`,
                                  { method: "POST" },
                                ),
                              );
                              return result(
                                fetchApi<Appraisal>(
                                  `/appraisals/${saved.appraisalId}`,
                                ),
                              );
                            })
                          }
                        >
                          Revoke link
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        {tab === "links" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer, deal & delivery</h3>
            <dl className="space-y-2 text-sm">
              {[
                ["Customer", record.customerName],
                ["Customer ID", record.customerId || "Linked through lead"],
                ["Lead", record.leadId],
                ["Deal", record.dealId || record.opportunityId || "Not linked"],
                ["Delivery", record.deliveryId || "Not linked"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-2 border-b py-2"
                >
                  <dt className="text-slate-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-slate-500">
              New deals can inherit the customer’s single active appraisal.
              Signed Virtual Yard contracts carry the appraisal into Delivery.
            </p>
            <label className="block text-xs font-semibold">
              Existing deal ID
              <input
                value={deal}
                onChange={(e) => setDeal(e.target.value)}
                className={field}
              />
            </label>
            <label className="block text-xs font-semibold">
              Existing delivery ID
              <input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className={field}
              />
            </label>
            <button
              disabled={busy || (!deal && !delivery)}
              className={button}
              onClick={() =>
                invoke("link", {
                  dealId: deal || undefined,
                  deliveryId: delivery || undefined,
                })
              }
            >
              Link records
            </button>
            <label className="block text-xs font-semibold">
              Status / approval notes
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className={field}
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
