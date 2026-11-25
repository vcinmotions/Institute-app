"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiClientNew } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";
import { useBranding } from "@/hooks/useBranding";

const MAX = 1024 * 1024;

/** Master (Institute Super) Admin only: change the institute logo and name. */
export default function BrandingPage() {
  const current = useBranding();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (current.instituteName) setName((n) => n || current.instituteName!); }, [current.instituteName]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f: File | null) => {
    setMsg(null);
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return setMsg({ ok: false, text: "Logo must be a PNG, JPG or WEBP image." });
    if (f.size > MAX) return setMsg({ ok: false, text: "The logo must be 1 MB or smaller." });
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setRemoveLogo(false); setPreview(URL.createObjectURL(f));
  };

  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("instituteName", name.trim());
      if (file) fd.append("logo", file);
      if (removeLogo) fd.append("removeLogo", "true");
      return (await apiClientNew.put("/branding", fd, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })).data;
    },
    onSuccess: () => {
      setFile(null); setPreview(null); setRemoveLogo(false);
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["branding"] });
      setMsg({ ok: true, text: "Saved. The new logo and name now show across the application." });
    },
    onError: (e) => setMsg({ ok: false, text: getApiErrorMessage(e) }),
  });

  const shownLogo = removeLogo ? null : preview ?? current.logoSrc;
  const shownName = name.trim() || current.instituteName || "Institute name";
  const changed = !!file || removeLogo || (name.trim() !== "" && name.trim() !== (current.instituteName ?? ""));

  return (
    <div>
      <PageBreadcrumb pageTitle="Institute Branding" />
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Institute name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Institute logo (PNG, JPG or WEBP, up to 1 MB)</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0] ?? null); }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-5 text-center dark:border-gray-700"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">{file ? file.name : "Drag and drop your logo here"}</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900">
                {file ? "Choose a different logo" : "Choose logo"}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pick(e.target.files?.[0] ?? null)} className="sr-only" aria-label="Upload logo" />
            </div>
            {(current.logoSrc || file) && (
              <button type="button" className="mt-2 text-xs underline" onClick={() => { setRemoveLogo(true); setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>
                Remove logo
              </button>
            )}
          </div>
          {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
          <button onClick={() => save.mutate()} disabled={!changed || save.isPending || !name.trim()}
            className="rounded bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {save.isPending ? "Saving..." : "Save & apply"}
          </button>
          <p className="text-xs text-gray-500">Only the Super Admin can open this page. The change appears in the header, sidebar, login screen and printouts.</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Preview</h3>
          <div className="flex items-center gap-3 rounded border bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
            {shownLogo ? <img src={shownLogo} alt="Logo preview" className="h-10 w-auto max-w-[140px] object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">Logo</div>}
            <span className="text-lg font-semibold dark:text-white">{shownName}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">This is how the header and login screen will look.</p>
        </section>
      </div>
    </div>
  );
}
