"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient, apiClientNew } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";
import { SERVER_ORIGIN } from "@/lib/config";
import { useDialog } from "@/components/common/AppDialog";
import DocumentsDrop, { DOC_MAX_FILES, formatBytes } from "@/components/form/form-elements/DocumentsDrop";

type Doc = { id: number; fileName: string; url: string; mimeType: string; sizeBytes: number; createdAt: string };

/** Saved documents of a student: open, add more (up to 10 in total) and remove. Used on the Edit Student page. */
export default function StudentDocuments({ studentId }: { studentId: number | string }) {
  const dialog = useDialog();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [pending, setPending] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/students/${studentId}/documents`);
      setDocs(data.documents ?? []);
    } catch (e) {
      setMsg({ ok: false, text: getApiErrorMessage(e, "Could not load the documents.") });
    }
  }, [studentId]);
  useEffect(() => { if (studentId) load(); }, [studentId, load]);

  const upload = async () => {
    if (!pending.length) return;
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      pending.forEach((f) => fd.append("documents", f));
      const { data } = await apiClientNew.post(`/students/${studentId}/documents`, fd, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setDocs(data.documents ?? []);
      setPending([]);
      setMsg({ ok: true, text: "Documents saved." });
    } catch (e) {
      setMsg({ ok: false, text: getApiErrorMessage(e, "Could not save the documents.") });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d: Doc) => {
    if (!(await dialog.confirm({ title: "Remove document?", message: `"${d.fileName}" will be deleted.`, confirmText: "Remove", danger: true }))) return;
    try {
      await apiClient.delete(`/students/${studentId}/documents/${d.id}`);
      setDocs((all) => all.filter((x) => x.id !== d.id));
    } catch (e) {
      setMsg({ ok: false, text: getApiErrorMessage(e, "Could not remove the document.") });
    }
  };

  return (
    <div className="space-y-3">
      {docs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">Saved documents ({docs.length}/{DOC_MAX_FILES})</h3>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <a href={`${SERVER_ORIGIN}${d.url}`} target="_blank" rel="noreferrer" className="min-w-0 truncate text-brand-600 underline">
                  {d.mimeType === "application/pdf" ? "📄" : "🖼️"} {d.fileName}
                </a>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-gray-400">{formatBytes(d.sizeBytes)}</span>
                  <button type="button" data-perm="delete:admission" className="text-xs text-red-600 underline" onClick={() => remove(d)}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div data-perm="add:admission">
        <DocumentsDrop files={pending} setFiles={setPending} room={DOC_MAX_FILES - docs.length} title="Add documents" />
        {pending.length > 0 && (
          <button type="button" onClick={upload} disabled={busy} className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {busy ? "Uploading..." : `Upload ${pending.length} document(s)`}
          </button>
        )}
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
