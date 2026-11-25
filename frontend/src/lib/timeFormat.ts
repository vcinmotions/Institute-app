/**
 * Pure helpers for the TimePicker. Times are always stored as "HH:mm" (24 hour), exactly what <input type="time">
 * used to give, so nothing that saves or reads a time has to change.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export type Time12 = { h12: number; m: number; pm: boolean };

/** "14:05" -> { h12: 2, m: 5, pm: true }. Returns null for anything that is not a valid HH:mm. */
export function to12(hhmm: string | null | undefined): Time12 | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h12: h % 12 === 0 ? 12 : h % 12, m: min, pm: h >= 12 };
}

/** (2, 5, true) -> "14:05" */
export function from12(h12: number, m: number, pm: boolean): string {
  const h = (h12 % 12) + (pm ? 12 : 0);
  return `${pad(h)}:${pad(m)}`;
}

/** "14:05" -> "02:05 PM"; "" -> "" */
export function formatDisplay(hhmm: string | null | undefined): string {
  const t = to12(hhmm);
  if (!t) return "";
  return `${pad(t.h12)}:${pad(t.m)} ${t.pm ? "PM" : "AM"}`;
}

/**
 * Understands what people actually type:
 *   "9" "930" "0930" "9:30" "9.30" "14" "1445" "14:45" "9:30 pm" "9:30pm" "9p" "9 a.m." "12am" "12:15 PM"
 * Returns "HH:mm", or null when it is not a time.
 * Without am/pm: 13-23 and 0 are 24-hour as typed, 12 is noon, and 1-11 follow `fallbackPm`
 * (the period of the time already in the field, so editing "02:30 PM" to "4" gives 4 PM).
 */
export function parseTimeText(input: string, fallbackPm = false): string | null {
  let s = String(input ?? "").trim().toLowerCase().replace(/\s+/g, "").replace(/([ap])\.?m\.?/g, "$1m").replace(/\./g, ":");
  if (!s) return null;

  let meridiem: "am" | "pm" | null = null;
  const mm = /(a|p)(m)?:?$/.exec(s);
  if (mm) {
    meridiem = mm[1] === "a" ? "am" : "pm";
    s = s.slice(0, mm.index);
  }
  s = s.replace(/:+$/, "");

  let h: number;
  let min: number;
  let m = /^(\d{1,2}):(\d{1,2})$/.exec(s);
  if (m) {
    h = Number(m[1]);
    min = Number(m[2]);
  } else if ((m = /^(\d{1,4})$/.exec(s))) {
    const d = m[1];
    if (d.length <= 2) { h = Number(d); min = 0; }
    else if (d.length === 3) { h = Number(d[0]); min = Number(d.slice(1)); }
    else { h = Number(d.slice(0, 2)); min = Number(d.slice(2)); }
  } else {
    return null;
  }
  if (!Number.isInteger(h) || !Number.isInteger(min) || min < 0 || min > 59) return null;

  if (meridiem) {
    if (h < 1 || h > 12) return null;
    return from12(h, min, meridiem === "pm");
  }
  if (h < 0 || h > 23) return null;
  if (h === 0 || h >= 13) return `${pad(h)}:${pad(min)}`; // clearly 24-hour
  if (h === 12) return `12:${pad(min)}`; // noon
  return from12(h, min, fallbackPm);
}

/**
 * Moves a time by `delta` minutes, wrapping around midnight. With `snap` (default) the result lands on the
 * step grid: from 10:43, +5 gives 10:45 and -5 gives 10:40.
 */
export function shiftTime(hhmm: string, delta: number, snap = true): string {
  const t = to12(hhmm);
  const total = t ? ((t.h12 % 12) + (t.pm ? 12 : 0)) * 60 + t.m : 9 * 60;
  let next = total + delta;
  if (snap && Math.abs(delta) < 60 && total % Math.abs(delta) !== 0) {
    next = delta > 0 ? Math.ceil(total / delta) * delta : Math.floor(total / -delta) * -delta;
  }
  next = ((next % 1440) + 1440) % 1440;
  return `${pad(Math.floor(next / 60))}:${pad(next % 60)}`;
}
