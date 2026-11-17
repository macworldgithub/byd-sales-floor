"use client";
import { useRef, useState } from "react";
import { Appraisal, appraisalApi } from "@/lib/appraisals";
export function LoanForm({
  record,
  busy,
  run,
}: {
  record: Appraisal;
  busy: boolean;
  run: (fn: (saved: Appraisal) => Promise<Appraisal>) => Promise<void>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    drawing = useRef(false),
    [hasSignature, setHasSignature] = useState(false);
  const [name, setName] = useState(record.customerName),
    [rego, setRego] = useState(""),
    [model, setModel] = useState(""),
    [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(""),
    [notes, setNotes] = useState("");
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * 600) / rect.width,
      ((e.clientY - rect.top) * 180) / rect.height,
    ];
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (busy) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvas.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(...(point(e) as [number, number]));
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0f172a";
    }
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext("2d");
    ctx?.lineTo(...(point(e) as [number, number]));
    ctx?.stroke();
    setHasSignature(true);
  }
  const input =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm";
  const current = record.loanCar;
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Loan vehicle agreement</h3>
      {current?.isSigned && (
        <div className="rounded-xl border bg-slate-50 p-4 text-sm">
          <p className="font-semibold">
            {current.loanCarRego} · {current.loanCarModel}
          </p>
          <p>
            Signed by {current.signedBy} ·{" "}
            {new Date(current.signedAt).toLocaleString("en-AU")}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-slate-600">
            {current.terms}
          </p>
          {current.returnedAt ? (
            <p className="mt-3 font-semibold text-emerald-700">
              Returned {new Date(current.returnedAt).toLocaleString("en-AU")}
            </p>
          ) : (
            <button
              disabled={busy}
              type="button"
              onClick={() =>
                run((saved) =>
                  appraisalApi.action(saved.appraisalId, "return-loancar", {
                    revision: saved.revision,
                    notes,
                  }),
                )
              }
              className="mt-3 rounded-lg border bg-white px-4 py-2 font-semibold"
            >
              Record vehicle returned
            </button>
          )}
        </div>
      )}
      {(!current?.isSigned || current.returnedAt) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async (saved) => {
              if (!hasSignature || !canvas.current)
                throw new Error("Ask the customer to draw their signature.");
              const blob = await new Promise<Blob>((resolve, reject) =>
                canvas.current!.toBlob(
                  (b) =>
                    b
                      ? resolve(b)
                      : reject(new Error("Signature unavailable.")),
                  "image/png",
                ),
              );
              const uploaded = await appraisalApi.upload(
                saved.appraisalId,
                blob,
                { purpose: "signature", name: "loan-signature.png" },
              );
              const signature = uploaded.media[uploaded.media.length - 1];
              return appraisalApi.action(uploaded.appraisalId, "sign-loancar", {
                revision: uploaded.revision,
                signatureName: name,
                loanCarRego: rego,
                loanCarModel: model,
                terms,
                consent,
                notes,
                signatureMediaId: signature.id,
              });
            });
          }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Customer name", name, setName],
              ["Loan registration", rego, setRego],
              ["Loan vehicle model", model, setModel],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="text-xs font-semibold">
                {String(label)}
                <input
                  required
                  value={String(value)}
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                  className={input}
                />
              </label>
            ))}
          </div>
          <label className="block text-xs font-semibold">
            Dealership loan agreement terms
            <textarea
              required
              maxLength={10000}
              rows={5}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Paste the dealership's approved loan agreement for the customer to review."
              className={input}
            />
          </label>
          <p className="text-sm text-slate-600">Customer signature</p>
          <canvas
            ref={canvas}
            width={600}
            height={180}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={() => (drawing.current = false)}
            onPointerCancel={() => (drawing.current = false)}
            className="w-full touch-none rounded-xl border border-slate-300 bg-white"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              canvas.current?.getContext("2d")?.clearRect(0, 0, 600, 180);
              setHasSignature(false);
            }}
            className="text-sm underline"
          >
            Clear signature
          </button>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            The customer has reviewed these terms and drawn their signature to
            acknowledge the loan agreement.
          </label>
          <label className="block text-xs font-semibold">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={input}
            />
          </label>
          <button
            disabled={busy || !hasSignature || !consent}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save signed agreement
          </button>
        </form>
      )}
    </section>
  );
}
