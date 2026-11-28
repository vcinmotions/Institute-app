"use client";
import { useEffect } from "react";

// Browsers let users type 5-6 digit years in <input type="date|datetime-local|month">.
// This guard restores the last valid value whenever the year exceeds 4 digits,
// for every such input in the app (current and future).
const TYPES = new Set(["date", "datetime-local", "month"]);
const BAD_YEAR = /^\d{5,}-/;
const lastGood = new WeakMap<HTMLInputElement, string>();

export default function GlobalDateYearGuard() {
  useEffect(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;

    const onInput = (e: Event) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || !TYPES.has(el.type)) return;

      if (BAD_YEAR.test(el.value)) {
        e.stopImmediatePropagation(); // keep React from seeing the bad value
        setter?.call(el, lastGood.get(el) ?? "");
        // Let React re-sync with the restored value.
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      lastGood.set(el, el.value);
    };

    const onFocus = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLInputElement && TYPES.has(el.type) && !BAD_YEAR.test(el.value)) {
        lastGood.set(el, el.value);
      }
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusin", onFocus, true);
    };
  }, []);

  return null;
}
