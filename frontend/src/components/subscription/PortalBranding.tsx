"use client";

import { useEffect, useRef, useState } from "react";
import { portalApi, portalAuthHeader } from "@/lib/portalApi";
import { SERVER_ORIGIN } from "@/lib/config";

const MAX = 1024 * 1024;
const card = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900";

type Branding = { instituteName: string; logoUrl: string | null };

/**
 * Subscription portal, master institute only: the institute name and logo shown in the desktop application
 * (header, sidebar, login screen, printouts). This is the only place to change them; every PC of the institute
 * picks the change up at its next online check.
 */
export default function PortalBranding() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cur, setCur] = useState<Branding | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    portalApi
      .get<Branding>("/portal/branding", { headers: portalAuthHeader() })
      .then((r) => { setCur(r.data); setName(r.data.instituteName ?? ""); })
      .catch((e) => setMsg({ ok: false, text: e?.response?.data?.error || "Could not load the branding." }));
  }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f: File | null) => {
    setMsg(null);
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return setMsg({ ok: false, text: "Logo must be a PNG, JPG or WEBP image." });
    if (f.size > MAX) return setMsg({ ok: false, text: "The logo must be 1 MB or smaller." });
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setRemoveLogo(false); setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("instituteName", name.trim());
      if (file) fd.append("logo", file);
      if (removeLogo) fd.append("removeLogo", "true");
      const { data } = await portalApi.put("/portal/branding", fd, { headers: portalAuthHeader() });
      setCur({ instituteName: data.instituteName, logoUrl: data.logoUrl });
      setFile(null); setPreview(null); setRemoveLogo(false);
      if (fileRef.current) fileRef.current.value = "";
      setMsg({ ok: true, text: data.message || "Saved." });
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not save the branding." });
    } finally {
      setBusy(false);
    }
  };

  const currentLogo = cur?.logoUrl ? `${SERVER_ORIGIN}${cur.logoUrl}` : null;
  const shownLogo = removeLogo ? null : preview ?? currentLogo;
  const shownName = name.trim() || cur?.instituteName || "Institute name";
  const changed = !!file || removeLogo || (name.trim() !== "" && name.trim() !== (cur?.instituteName ?? ""));
  const input = "h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className={`${card} space-y-5`}>
        <div>
          <h2 className="text-base font-semibold">Name &amp; logo in the application</h2>
          <p className="mt-1 text-xs text-gray-500">
            Shown on every PC and laptop of your institute: header, sidebar, login screen and printouts.
            This is the only place to change them.
          </p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Institute name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={input} />
        </label>
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Institute logo (PNG, JPG or WEBP, up to 1 MB)</span>
          <div className="flex items-center gap-2">
            <input readOnly value={file ? file.name : "No file selected"} aria-label="Selected logo file" className={`${input} min-w-0 flex-1 bg-gray-50`} />
            <button type="button" onClick={() => fileRef.current?.click()} className="h-10 shrink-0 rounded-lg border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              Browse...
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pick(e.target.files?.[0] ?? null)} className="sr-only" aria-label="Upload logo" />
          </div>
          {(currentLogo || file) && !removeLogo && (
            <button type="button" className="mt-2 text-xs underline" onClick={() => { setRemoveLogo(true); setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>
              Remove logo
            </button>
          )}
        </div>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        <button onClick={save} disabled={!cur || !changed || busy || !name.trim()} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Saving..." : "Save"}
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Preview</h3>
        <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {shownLogo ? <img src={shownLogo} alt="Logo preview" className="h-10 w-auto max-w-[140px] object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">Logo</div>}
          <span className="text-lg font-semibold dark:text-white">{shownName}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">This is how the application header and login screen will look.</p>
      </div>
    </div>
  );
}
