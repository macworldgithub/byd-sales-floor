"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Plus,
  Search,
  Users,
  Archive,
  RefreshCw,
  Car,
} from "lucide-react";
import { fetchApi, leadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Appraisal,
  downloadJson,
  downloadArchiveMedia,
  Metadata,
  Partner,
  result,
} from "@/lib/appraisals";
import { AppraisalDetail } from "./AppraisalDetail";
const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm";
const button =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50";
const management = [
  "super_admin",
  "admin",
  "site_admin",
  "sales_manager",
  "manager",
  "bdc",
];
export function AppraisalsView({
  leadId,
  customerName,
}: {
  leadId?: string;
  customerName?: string;
}) {
  const { user, activeSite } = useAuth(),
    manager = management.includes(user?.role || "");
  const [mode, setMode] = useState("appraisals"),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [pages, setPages] = useState(1);
  const [rows, setRows] = useState<Appraisal[]>([]),
    [partners, setPartners] = useState<Partner[]>([]),
    [archive, setArchive] = useState<any[]>([]),
    [selected, setSelected] = useState<Appraisal | null>(null),
    [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [report, setReport] = useState<{
      total: number;
      conversionRate: number | null;
      statuses: { status: string; count: number }[];
    } | null>(null);
  const [creating, setCreating] = useState(false),
    [leadQuery, setLeadQuery] = useState(""),
    [leads, setLeads] = useState<{ id: string; name: string; site: string }[]>(
      [],
    ),
    [selectedLead, setSelectedLead] = useState(leadId || ""),
    [rego, setRego] = useState("");
  const requestId = useRef("");
  const [partner, setPartner] = useState<Partial<Partner> | null>(null);
  const dirtyRefresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    setSelected(null);
    setPage(1);
    setSelectedLead(leadId || "");
    setCreating(false);
    setPartner(null);
  }, [activeSite, leadId]);
  useEffect(() => {
    setPage(1);
  }, [q, status, mode]);
  useEffect(() => {
    let active = true;
    result(fetchApi<Metadata>("/appraisals/metadata"))
      .then((v) => {
        if (active) setMetadata(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const query = new URLSearchParams({
      q,
      page: String(page),
      ...(status && mode === "appraisals" ? { status } : {}),
      ...(leadId && mode === "appraisals" ? { leadId } : {}),
      ...(activeSite ? { site: activeSite } : {}),
    });
    const route =
      mode === "partners"
        ? "/appraisals/partners"
        : mode === "archive"
          ? "/appraisals/archive"
          : "/appraisals";
    fetchApi<any[]>(`${route}?${query}`)
      .then((response) => {
        if (!active) return;
        setTotal(response.pagination?.total || 0);
        setPages(response.pagination?.pages || 1);
        if (mode === "partners") setPartners(response.data || []);
        else if (mode === "archive") setArchive(response.data || []);
        else setRows(response.data || []);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [q, status, mode, page, activeSite, leadId, version]);
  useEffect(() => {
    if (!manager || leadId) return;
    let active = true;
    result(
      fetchApi<any>(
        `/appraisals/report?${new URLSearchParams({ site: activeSite })}`,
      ),
    )
      .then((data) => {
        if (active) setReport(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [manager, activeSite, leadId, version]);
  useEffect(() => {
    if (!creating || leadId) return;
    let active = true;
    const timer = setTimeout(() => {
      leadApi
        .getLeads({ q: leadQuery, limit: "30" })
        .then((res) => {
          if (active)
            setLeads(
              (res.data || []).map((lead) => ({
                id: String(lead._id || lead.id),
                name: lead.name,
                site: lead.dealer || lead.dealerName || "",
              })),
            );
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [creating, leadQuery, leadId, activeSite]);
  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      const record = await result(
        fetchApi<Appraisal>("/appraisals", {
          method: "POST",
          body: JSON.stringify({
            leadId: selectedLead,
            rego,
            state: "VIC",
            requestId: requestId.current,
          }),
        }),
      );
      setSelected(record);
      setCreating(false);
      setRego("");
      requestId.current = "";
      dirtyRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function savePartner(event: React.FormEvent) {
    event.preventDefault();
    if (!partner || busy) return;
    setBusy(true);
    setError("");
    try {
      await result(
        fetchApi(
          `/appraisals/partners${partner._id ? `/${partner._id}` : ""}`,
          {
            method: partner._id ? "PATCH" : "POST",
            body: JSON.stringify({
              ...partner,
              site: partner.site || activeSite,
            }),
          },
        ),
      );
      setPartner(null);
      dirtyRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (selected && metadata)
    return (
      <AppraisalDetail
        key={selected.appraisalId}
        initial={selected}
        metadata={metadata}
        manager={manager}
        onChanged={dirtyRefresh}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <div className="view-stack space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">BYD · Vehicle appraisal workspace</p>
          <h1 className="page-title">
            {leadId ? "CUSTOMER APPRAISALS" : "APPRAISALS"}
          </h1>
          <p className="page-subtitle">
            {customerName ? `${customerName} · ` : ""}Inspect, value and manage
            trade vehicles from first photo to handover.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={button}
            onClick={dirtyRefresh}
            aria-label="Refresh appraisals"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            disabled={!metadata}
            className="flex items-center gap-2 rounded-lg bg-[#e60012] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => {
              setCreating(true);
              setMode("appraisals");
            }}
          >
            <Plus className="h-4 w-4" />
            New appraisal
          </button>
        </div>
      </header>
      {report && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total appraisals", report.total],
            [
              "Awaiting inspection",
              report.statuses.find((s) => s.status === "Pending Inspection")
                ?.count || 0,
            ],
            [
              "Approved",
              report.statuses.find((s) => s.status === "Approved")?.count || 0,
            ],
            [
              "Traded / appraised",
              report.conversionRate == null ? "—" : `${report.conversionRate}%`,
            ],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {!leadId && (
        <nav className="flex gap-1 border-b" aria-label="Appraisal workspace">
          {[
            ["appraisals", "Appraisals", Camera],
            ["partners", "Partners", Users],
            ...(manager ? [["archive", "iAppraise archive", Archive]] : []),
          ].map(([id, label, Icon]) => (
            <button
              key={String(id)}
              onClick={() => {
                setMode(String(id));
                setQ("");
              }}
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold ${mode === id ? "border-red-600 text-red-700" : "border-transparent text-slate-500"}`}
            >
              {typeof Icon !== "string" && <Icon className="h-4 w-4" />}
              {String(label)}
            </button>
          ))}
        </nav>
      )}
      {creating && (
        <form
          onSubmit={create}
          className="space-y-3 rounded-xl border border-red-100 bg-white p-5"
        >
          <h2 className="font-semibold">Start a customer-linked appraisal</h2>
          {!leadId && (
            <>
              <input
                aria-label="Find customer"
                placeholder="Search customers by name, mobile or email"
                value={leadQuery}
                onChange={(e) => {
                  setLeadQuery(e.target.value);
                  setSelectedLead("");
                  requestId.current = "";
                }}
                className={field}
              />
              <select
                aria-label="Customer"
                required
                value={selectedLead}
                onChange={(e) => {
                  setSelectedLead(e.target.value);
                  requestId.current = "";
                }}
                className={field}
              >
                <option value="">Select a customer</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} · {lead.site}
                  </option>
                ))}
              </select>
            </>
          )}
          <label className="block text-xs font-semibold">
            Registration (can be added later)
            <input
              value={rego}
              onChange={(e) => setRego(e.target.value)}
              maxLength={10}
              className={`${field} mt-1`}
            />
          </label>
          <div className="flex gap-2">
            <button
              disabled={busy || !selectedLead}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create draft"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className={button}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            aria-label="Search appraisals or partners"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              mode === "archive"
                ? "Search preserved records"
                : mode === "partners"
                  ? "Search company, contact, email or phone"
                  : "Search registration, VIN, customer or model"
            }
            className={`${field} pl-9`}
          />
        </div>
        {mode === "appraisals" && (
          <select
            aria-label="Appraisal status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {metadata?.statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        {mode === "partners" && manager && (
          <button
            className={button}
            onClick={() =>
              setPartner({
                kind: "wholesaler",
                name: "",
                company: "",
                email: "",
                phone: "",
                active: true,
                site: activeSite,
              })
            }
          >
            Add partner
          </button>
        )}
      </div>
      {partner && (
        <form
          onSubmit={savePartner}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <h2 className="font-semibold">
            {partner._id ? "Edit partner" : "New partner"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["name", "Contact name"],
              ["company", "Company"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["licence", "Dealer licence"],
              ["abn", "ABN"],
            ].map(([key, label]) => (
              <label key={key} className="text-xs font-semibold">
                {label}
                <input
                  required={key === "name"}
                  type={key === "email" ? "email" : "text"}
                  value={String(partner[key as keyof Partner] || "")}
                  onChange={(e) =>
                    setPartner({ ...partner, [key]: e.target.value })
                  }
                  className={`${field} mt-1`}
                />
              </label>
            ))}
            <label className="text-xs font-semibold">
              Partner type
              <select
                value={partner.kind}
                onChange={(e) =>
                  setPartner({ ...partner, kind: e.target.value })
                }
                className={`${field} mt-1`}
              >
                <option value="wholesaler">Wholesaler</option>
                <option value="dealer">Dealer</option>
                <option value="dealer_staff">
                  Dealer staff (archive contact)
                </option>
              </select>
            </label>
            {(!activeSite || /^all/i.test(activeSite)) && (
              <label className="text-xs font-semibold">
                BYD site
                <input
                  required
                  value={partner.site || ""}
                  onChange={(e) =>
                    setPartner({ ...partner, site: e.target.value })
                  }
                  placeholder="BYD Melbourne City"
                  className={`${field} mt-1`}
                />
              </label>
            )}
          </div>
          <label className="block text-xs font-semibold">
            Notes
            <textarea
              value={partner.notes || ""}
              onChange={(e) =>
                setPartner({ ...partner, notes: e.target.value })
              }
              className={`${field} mt-1`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={partner.active}
              onChange={(e) =>
                setPartner({ ...partner, active: e.target.checked })
              }
            />
            Active contact
          </label>
          <div className="flex gap-2">
            <button disabled={busy} className={button}>
              Save partner
            </button>
            <button
              type="button"
              onClick={() => setPartner(null)}
              className={button}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p className="p-8 text-center text-sm text-slate-500">Loading…</p>
      ) : mode === "appraisals" ? (
        <div className="overflow-hidden rounded-xl border bg-white">
          {rows.length ? (
            rows.map((row) => (
              <button
                key={row.appraisalId}
                onClick={() => setSelected(row)}
                className="flex w-full flex-wrap items-center justify-between gap-4 border-b p-4 text-left last:border-b-0 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Car className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {row.rego || "Registration pending"} ·{" "}
                      {[row.year, row.make, row.model]
                        .filter(Boolean)
                        .join(" ") || "Vehicle details pending"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.customerName} · {row.site} · {row.consultantName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold">
                    {row.status}
                  </span>
                  <span className="text-slate-500">
                    {row.media?.length || 0} attachments
                  </span>
                  <span className="text-slate-400">Open →</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <Camera className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <h3 className="font-semibold">No matching appraisals</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create an appraisal to begin the guided inspection.
              </p>
            </div>
          )}
        </div>
      ) : mode === "partners" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partners.length ? (
            partners.map((p) => (
              <article
                key={p._id}
                className="space-y-2 rounded-xl border bg-white p-5"
              >
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {p.kind.replace("_", " ")} ·{" "}
                  {p.active ? "Active" : "Inactive"}
                </span>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-slate-600">{p.company}</p>
                <p className="text-sm">{p.email}</p>
                <p className="text-sm">{p.phone}</p>
                <p className="text-xs text-slate-500">{p.site}</p>
                {manager && (
                  <button className={button} onClick={() => setPartner(p)}>
                    Edit contact
                  </button>
                )}
              </article>
            ))
          ) : (
            <p className="p-5 text-sm text-slate-500">
              No partners at this site. Add contacts or import your source
              directory.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Historical source snapshots are preserved separately. The CSV export
            does not include inspection media or full offer history. Records are
            not automatically merged into live customers.
          </div>
          {archive.length ? (
            archive.map((row) => (
              <article key={row._id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {row.rego || "No registration"} ·{" "}
                      {[row.year, row.make, row.model]
                        .filter(Boolean)
                        .join(" ")}
                    </h3>
                    <p className="mt-1 text-sm">
                      {row.customerName} · {row.site}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Source row {row.sourceRow} · {row.sourceId}
                    </p>
                  </div>
                  <button
                    className={button}
                    onClick={() =>
                      downloadJson(row, `iappraise-${row.sourceRow}.json`)
                    }
                  >
                    Export original record
                  </button>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                    View preserved source fields
                  </summary>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Object.entries(row.raw || {}).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <dt className="text-xs text-slate-500">{key}</dt>
                        <dd className="mt-1 break-words text-sm">
                          {String(value ?? "")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
                {(row.media || []).length > 0 && <div className="mt-3 flex flex-wrap gap-2">{row.media.map((file: {id:string;name:string;bytes:number}) => <button key={file.id} className={button} onClick={() => downloadArchiveMedia(row._id,file.id,file.name).catch(error=>setError(error.message))}>{file.name} · {(file.bytes/1024/1024).toFixed(1)} MB</button>)}</div>}
              </article>
            ))
          ) : (
            <p className="p-5 text-sm text-slate-500">
              No matching archived records at the selected site.
            </p>
          )}
        </div>
      )}
      <footer className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <p>
          {total.toLocaleString()}{" "}
          {mode === "archive" ? "preserved records" : mode} · Page {page} of{" "}
          {pages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            className={button}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <button
            disabled={page >= pages || loading}
            className={button}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
