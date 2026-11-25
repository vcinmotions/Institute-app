"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { escBus } from "@/app/utils/escBus";

/**
 * In-app dialogs that replace the browser's plain confirm() / prompt() / alert() pop-ups.
 *
 *   const dialog = useDialog();
 *   if (!(await dialog.confirm({ title: "Delete role?", message: "...", danger: true, confirmText: "Delete" }))) return;
 *   const name = await dialog.prompt({ title: "Rename role", label: "Role name", defaultValue: role.name });   // null = cancelled
 *   await dialog.alert({ title: "Saved", message: "...", variant: "success" });
 *
 * Keyboard: Enter confirms, Esc cancels, Tab stays inside the dialog. Destructive confirmations start on "Cancel"
 * so a stray Enter cannot delete anything. Several calls queue up and show one after another.
 */
type Variant = "info" | "success" | "error" | "warning";
export type ConfirmOptions = {
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Red confirm button, starts focused on Cancel. */
  danger?: boolean;
  variant?: Variant;
};
export type PromptOptions = ConfirmOptions & {
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  /** Default true: an empty answer is refused. */
  required?: boolean;
  /** Return an error message to refuse the answer, or null to accept it. */
  validate?: (value: string) => string | null;
};

type Item =
  | { kind: "confirm"; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: "prompt"; opts: PromptOptions; resolve: (v: string | null) => void }
  | { kind: "alert"; opts: ConfirmOptions; resolve: () => void };

type Api = {
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  prompt: (o: PromptOptions) => Promise<string | null>;
  alert: (o: ConfirmOptions) => Promise<void>;
};

const plain = (m: React.ReactNode) => (typeof m === "string" ? m : "");

// Used only if a component renders outside the provider: behaves like the browser dialogs.
const fallback: Api = {
  confirm: async (o) => window.confirm([o.title, plain(o.message)].filter(Boolean).join("\n\n")),
  prompt: async (o) => window.prompt([o.title, o.label].filter(Boolean).join("\n"), o.defaultValue ?? ""),
  alert: async (o) => { window.alert([o.title, plain(o.message)].filter(Boolean).join("\n\n")); },
};

const Ctx = createContext<Api | null>(null);
export const useDialog = (): Api => useContext(Ctx) ?? fallback;

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Item[]>([]);

  const push = useCallback((item: Item) => setQueue((q) => [...q, item]), []);
  const api = useMemo<Api>(() => ({
    confirm: (opts) => new Promise<boolean>((resolve) => push({ kind: "confirm", opts, resolve })),
    prompt: (opts) => new Promise<string | null>((resolve) => push({ kind: "prompt", opts, resolve })),
    alert: (opts) => new Promise<void>((resolve) => push({ kind: "alert", opts, resolve })),
  }), [push]);

  const current = queue[0] ?? null;
  const close = useCallback(() => setQueue((q) => q.slice(1)), []);

  // Safety net: any plain window.alert() left anywhere (or called by a library) shows the same in-app dialog.
  // (confirm() and prompt() answer immediately, so they cannot be redirected; the app no longer uses them.)
  useEffect(() => {
    const original = window.alert;
    window.alert = (message?: unknown) => { void api.alert({ title: "Message", message: String(message ?? "") }); };
    return () => { window.alert = original; };
  }, [api]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {current && typeof document !== "undefined" && createPortal(<DialogView key={queue.length + current.kind} item={current} onClose={close} />, document.body)}
    </Ctx.Provider>
  );
}

const ICON: Record<Variant, { ring: string; path: string }> = {
  info: { ring: "bg-brand-50 text-brand-600 dark:bg-brand-500/15", path: "M12 8h.01M11 12h1v5h1" },
  success: { ring: "bg-green-50 text-green-600 dark:bg-green-500/15", path: "M5 13l4 4L19 7" },
  warning: { ring: "bg-amber-50 text-amber-600 dark:bg-amber-500/15", path: "M12 8v5m0 3h.01" },
  error: { ring: "bg-red-50 text-red-600 dark:bg-red-500/15", path: "M12 8v5m0 3h.01" },
};

function DialogView({ item, onClose }: { item: Item; onClose: () => void }) {
  const o = item.opts as PromptOptions;
  const isPrompt = item.kind === "prompt";
  const isAlert = item.kind === "alert";
  const variant: Variant = o.variant ?? (o.danger ? "warning" : "info");

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState(isPrompt ? o.defaultValue ?? "" : "");
  const [error, setError] = useState("");

  const finish = useCallback((accepted: boolean) => {
    if (item.kind === "confirm") item.resolve(accepted);
    else if (item.kind === "alert") item.resolve();
    else if (item.kind === "prompt") {
      if (!accepted) item.resolve(null);
      else {
        const v = value.trim();
        const required = o.required !== false;
        if (required && !v) { setError("Please enter a value."); inputRef.current?.focus(); return; }
        const bad = o.validate?.(v) ?? null;
        if (bad) { setError(bad); inputRef.current?.focus(); return; }
        item.resolve(v);
      }
    }
    onClose();
  }, [item, o, value, onClose]);

  // Focus: the field for a prompt; Cancel for a destructive question; otherwise the main button. Give focus back afterwards.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    if (isPrompt) { inputRef.current?.focus(); inputRef.current?.select(); }
    else if (o.danger) cancelRef.current?.focus();
    else okRef.current?.focus();
    const prevEsc = escBus.modalHandled;
    escBus.modalHandled = true; // Esc must not also navigate the page "back"
    return () => { escBus.modalHandled = prevEsc; before?.focus?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc cancels, Tab stays inside (capture, so modals and page shortcuts behind never see these keys).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); return; }
      if (e.key === "Tab") {
        const els = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("input, button")  ?? []).filter((el) => !(el as HTMLButtonElement).disabled);
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1], a = document.activeElement as HTMLElement | null;
        const inside = !!a && !!panelRef.current?.contains(a);
        if (!inside || (!e.shiftKey && a === last)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [finish]);

  const confirmText = o.confirmText ?? (isAlert ? "OK" : isPrompt ? "Save" : "Yes");
  const okClass = o.danger || variant === "error" && !isAlert
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
    : "bg-brand-500 hover:bg-brand-600 focus:ring-brand-500/30";

  return (
    <div className="fixed inset-0 z-[2147483100] flex items-center justify-center bg-black/50 p-4" data-app-dialog="true" data-keep-modal-open="true">
      <div
        ref={panelRef}
        role={isAlert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-label={o.title ?? "Message"}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
        onKeyDown={(e) => {
          // Enter = confirm (except on the Cancel button, where it presses Cancel)
          if (e.key === "Enter" && !e.shiftKey && document.activeElement !== cancelRef.current) { e.preventDefault(); finish(true); }
        }}
      >
        <div className="flex gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON[variant].ring}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {variant === "info" || variant === "success" ? null : <circle cx="12" cy="12" r="9.5" />}
              <path d={ICON[variant].path} />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            {o.title && <h3 className="text-base font-semibold text-gray-900 dark:text-white">{o.title}</h3>}
            {o.message && <div className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{o.message}</div>}
            {isPrompt && (
              <div className="mt-3">
                {o.label && <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{o.label}</label>}
                <input
                  ref={inputRef}
                  value={value}
                  maxLength={o.maxLength ?? 120}
                  placeholder={o.placeholder}
                  onChange={(e) => { setValue(e.target.value); setError(""); }}
                  aria-invalid={!!error}
                  className={`h-11 w-full rounded-lg border px-3 text-sm text-gray-800 outline-none focus:ring-3 dark:bg-gray-800 dark:text-white ${
                    error ? "border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700"
                  }`}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {!isAlert && (
            <button ref={cancelRef} type="button" onClick={() => finish(false)}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-3 focus:ring-gray-300/40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">
              {o.cancelText ?? "Cancel"}
            </button>
          )}
          <button ref={okRef} type="button" onClick={() => finish(true)}
            className={`h-10 rounded-lg px-5 text-sm font-semibold text-white focus:outline-none focus:ring-3 ${okClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
