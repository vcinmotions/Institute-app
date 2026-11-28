"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDisplay, from12, parseTimeText, shiftTime, to12 } from "@/lib/timeFormat";

/**
 * Time picker used everywhere in the app (replaces the browser's built-in time control).
 *
 * Value: "HH:mm" (24 hour) - exactly what <input type="time"> produced, so saving/reading is unchanged.
 *
 * Mouse:    click the field or the clock -> pick AM/PM, an hour, then a minute (picking the minute closes it).
 * Keyboard: just type  ("9", "930", "14:45", "9:30 pm", "9p")  then Enter or Tab;
 *           Up / Down = +/- 5 minutes, Shift+Up/Down = +/- 1 minute, PageUp / PageDown = +/- 1 hour,
 *           Esc closes the pop-up. Tab always moves on to the next field (the pop-up never traps focus).
 */
type Props = {
  value?: string;
  onChange: (hhmm: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  autoFocus?: boolean;
  /** compact = smaller field for dense screens (e.g. settings cards). */
  size?: "md" | "sm";
  /** Let the user clear the time (shows a small clear button). */
  clearable?: boolean;
  "aria-label"?: string;
};

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const POP_W = 288;
const POP_H = 312;

export default function TimePicker({
  value = "",
  onChange,
  placeholder = "hh:mm AM",
  disabled = false,
  id,
  name,
  className = "",
  autoFocus = false,
  size = "md",
  clearable = false,
  "aria-label": ariaLabel,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(formatDisplay(value));
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number }>({ left: 0, top: 0 });

  const current = to12(value);
  const fallbackPm = current ? current.pm : false;

  // The field always shows the real value (after picking, arrow keys, or a change from outside).
  useEffect(() => setText(formatDisplay(value)), [value]);

  const apply = useCallback((hhmm: string) => {
    setInvalid(false);
    setText(formatDisplay(hhmm));
    if (hhmm !== value) onChange(hhmm);
  }, [onChange, value]);

  /** Turns what was typed into a time (or restores the previous value if it is not one). */
  const commit = useCallback(() => {
    const raw = text.trim();
    if (raw === "") {
      if (clearable && value !== "") onChange("");
      setText(formatDisplay(clearable ? "" : value));
      return;
    }
    const parsed = parseTimeText(raw, fallbackPm);
    if (parsed) apply(parsed);
    else {
      setText(formatDisplay(value));
      setInvalid(true);
      window.setTimeout(() => setInvalid(false), 1800);
    }
  }, [text, fallbackPm, apply, value, onChange, clearable]);

  // ---- pop-up placement (a portal, so a modal's scroll area can never clip it) ----
  const place = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POP_W - 8));
    const roomBelow = window.innerHeight - r.bottom;
    if (roomBelow < POP_H + 12 && r.top > POP_H + 12) setPos({ left, bottom: window.innerHeight - r.top + 6 });
    else setPos({ left, top: r.bottom + 6 });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Close on a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  // ---- picking with the mouse ----
  const base = current ?? { h12: 9, m: 0, pm: false };
  const pickHour = (h: number) => apply(from12(h, current ? current.m : 0, base.pm));
  const pickMinute = (m: number) => { apply(from12(base.h12, m, base.pm)); setOpen(false); inputRef.current?.focus(); };
  const pickPeriod = (pm: boolean) => apply(from12(base.h12, base.m, pm));

  // ---- keyboard ----
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const typed = parseTimeText(text, fallbackPm) ?? value ?? "";
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;
        apply(e.shiftKey ? shiftTime(typed, dir, false) : shiftTime(typed, dir * 5));
        break;
      }
      case "PageUp":
      case "PageDown":
        e.preventDefault();
        apply(shiftTime(typed, e.key === "PageUp" ? 60 : -60, false));
        break;
      case "Enter":
        e.preventDefault(); // Enter confirms the time; it never submits the form by accident
        commit();
        setOpen(false);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          e.stopPropagation(); // closes only the pop-up (not the modal / page behind it)
          setText(formatDisplay(value));
          setOpen(false);
        }
        break;
      default:
        break;
    }
  };

  const size_ = size === "sm" ? "h-8 text-xs px-2.5 pr-8" : "h-11 text-sm px-4 pr-10";
  const btn = "h-9 rounded-md text-sm font-medium transition outline-none";
  const on = "bg-brand-500 text-white";
  const off = "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10";

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel ?? "Time"}
        aria-invalid={invalid}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => { setText(e.target.value); setInvalid(false); }}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => commit()}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={onKeyDown}
        className={`w-full rounded-lg border bg-transparent shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${size_} ${
          invalid
            ? "border-error-500 focus:ring-error-500/10"
            : "border-gray-300 text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
        } ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-800" : ""}`}
      />

      {/* clock button: mouse only (typing is the keyboard way, so Tab skips it) */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label="Open time picker"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 5.8V10l2.8 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {clearable && value && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear time"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { onChange(""); setText(""); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          &times;
        </button>
      )}

      {open && !disabled && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Choose time"
            data-keep-modal-open="true"
            data-time-popover="true"
            // Keep keyboard focus in the field while the mouse is used in the pop-up.
            onMouseDown={(e) => e.preventDefault()}
            style={{ position: "fixed", zIndex: 2147483000, width: POP_W, left: pos.left, top: pos.top, bottom: pos.bottom }}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-2xl font-semibold tabular-nums text-gray-800 dark:text-white">
                {current ? `${String(current.h12).padStart(2, "0")}:${String(current.m).padStart(2, "0")}` : "--:--"}
              </div>
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/10">
                {[false, true].map((pm) => (
                  <button key={String(pm)} type="button" tabIndex={-1} onClick={() => pickPeriod(pm)}
                    className={`${btn} w-12 ${current && current.pm === pm ? on : off}`}>
                    {pm ? "PM" : "AM"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Hour</div>
            <div className="mb-2 grid grid-cols-6 gap-1">
              {HOURS.map((h) => (
                <button key={h} type="button" tabIndex={-1} onClick={() => pickHour(h)}
                  className={`${btn} ${current && current.h12 === h ? on : off}`}>
                  {h}
                </button>
              ))}
            </div>

            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Minute</div>
            <div className="grid grid-cols-6 gap-1">
              {MINUTES.map((m) => (
                <button key={m} type="button" tabIndex={-1} onClick={() => pickMinute(m)}
                  className={`${btn} ${current && current.m === m ? on : off}`}>
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
              <span className="text-[11px] leading-tight text-gray-400">Type a time like 9:30 or 1445. &uarr;&darr; change by 5 min.</span>
              <button type="button" tabIndex={-1} onClick={() => { commit(); setOpen(false); inputRef.current?.focus(); }}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
