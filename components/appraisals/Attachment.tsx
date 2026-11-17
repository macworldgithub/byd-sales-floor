"use client";
import { useEffect, useState } from "react";
import { AppraisalMedia, privateMedia } from "@/lib/appraisals";
export function Attachment({
  file,
  invitation,
}: {
  file: Pick<AppraisalMedia, "id" | "kind" | "name" | "shot">;
  invitation?: { id: string; token: string };
}) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function open() {
    setLoading(true);
    try {
      setUrl(await privateMedia(file.id, invitation));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Attachment unavailable.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 p-3 text-xs">
        <strong>{file.shot || file.name || "Attachment"}</strong>
        {!url && (
          <button
            type="button"
            disabled={loading}
            onClick={open}
            className="font-semibold text-red-700"
          >
            {loading ? "Loading…" : "Open"}
          </button>
        )}
      </div>
      {url &&
        (file.kind === "image" ? (
          <img
            src={url}
            alt={file.shot || file.name}
            className="max-h-72 w-full bg-slate-100 object-contain"
          />
        ) : file.kind === "video" ? (
          <video src={url} controls preload="metadata" className="w-full" />
        ) : (
          <a
            href={url}
            download={file.name || "document.pdf"}
            className="block p-4 text-sm text-red-700 underline"
          >
            Download document
          </a>
        ))}
      {error && (
        <p role="alert" className="px-3 pb-3 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
