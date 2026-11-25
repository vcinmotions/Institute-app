"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { apiClient, publicApi } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config";

type Settings = { supportEmail?: string; supportPhone?: string; announcementActive?: boolean; announcementText?: string };

/** "Support center": who to contact, and a one-click copy of the details support will ask for. */
export default function SupportView({ statusHref, master = false }: { statusHref: string; master?: boolean }) {
  const user = useSelector((s: RootState) => s.auth.user) as any;
  const [settings, setSettings] = useState<Settings>({});
  const [licence, setLicence] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (master) {
      // the master admin cannot use institute routes: read the shared settings instead
      publicApi.get("/app-settings").then((r) => setSettings(r.data ?? {})).catch(() => {});
      return;
    }
    apiClient.get("/subscription/me").then((r) => {
      setSettings(r.data?.settings ?? {});
      setLicence(r.data?.enforced ? `${r.data.status}${r.data.daysLeft != null ? ` (${r.data.daysLeft} days left)` : ""}` : "not enforced");
    }).catch(() => {});
  }, [master]);

  const institute = user?.instituteName || user?.clientAdmin?.instituteName || "";
  const details = [
    "VC-Inmotions support details",
    institute && `Institute: ${institute}`,
    `User: ${user?.name ?? ""} (${user?.email ?? ""})`,
    `Role: ${user?.role ?? ""}`,
    `Licence: ${licence || "unknown"}`,
    `Server: ${API_BASE_URL}`,
    `Screen: ${typeof window !== "undefined" ? window.location.pathname : ""}`,
    `Time: ${new Date().toLocaleString("en-IN")}`,
  ].filter(Boolean).join("\n");

  const copy = async () => {
    try { await navigator.clipboard.writeText(details); setCopied(true); setTimeout(() => setCopied(false), 3000); } catch { /* clipboard blocked */ }
  };

  const hasContact = !!(settings.supportEmail || settings.supportPhone);
  const card = "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900";

  return (
    <div className="max-w-2xl space-y-4">
      {settings.announcementActive && settings.announcementText && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">{settings.announcementText}</div>
      )}

      <section className={card}>
        <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Contact support</h2>
        {hasContact ? (
          <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
            {settings.supportEmail && <li>Email: <a className="font-medium text-brand-600 underline" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a></li>}
            {settings.supportPhone && <li>Phone: <a className="font-medium text-brand-600 underline" href={`tel:${settings.supportPhone.replace(/\s+/g, "")}`}>{settings.supportPhone}</a></li>}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Contact details are not set up yet. Please ask your software provider how to reach support.</p>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Before you contact support</h2>
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Open <a className="text-brand-600 underline" href={statusHref}>Check API Status</a> and see whether anything is red.</li>
          <li>Note what you were doing and any message shown on screen.</li>
          <li>Copy the details below and send them with your message. It saves a round of questions.</li>
        </ol>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">{details}</pre>
        <button onClick={copy} className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          {copied ? "Copied" : "Copy support details"}
        </button>
      </section>
    </div>
  );
}
