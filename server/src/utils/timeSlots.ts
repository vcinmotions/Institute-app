export type SlotInput = { id?: number; day?: string; startTime?: string; endTime?: string };

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Validates a lab's time slots: HH:MM format, start before end, and no overlap
 * between two slots of the same lab on the same day ("Daily" overlaps every day).
 * Returns an error message, or null when valid.
 */
export function validateTimeSlots(slots: SlotInput[] | undefined): string | null {
  if (!Array.isArray(slots)) return null;
  const clean: { day: string; s: number; e: number; label: string }[] = [];
  for (const slot of slots) {
    const start = String(slot.startTime ?? "").trim();
    const end = String(slot.endTime ?? "").trim();
    if (!HHMM.test(start) || !HHMM.test(end)) {
      return "Each time slot needs a valid start and end time (HH:MM).";
    }
    if (toMin(start) >= toMin(end)) {
      return `Time slot ${start} - ${end} is invalid: the end time must be after the start time.`;
    }
    clean.push({
      day: String(slot.day ?? "Daily").trim().toLowerCase() || "daily",
      s: toMin(start),
      e: toMin(end),
      label: `${start} - ${end}`,
    });
  }
  for (let i = 0; i < clean.length; i++) {
    for (let j = i + 1; j < clean.length; j++) {
      const a = clean[i], b = clean[j];
      const sameDay = a.day === b.day || a.day === "daily" || b.day === "daily";
      if (sameDay && a.s < b.e && b.s < a.e) {
        return `Time slots ${a.label} and ${b.label} overlap for this lab.`;
      }
    }
  }
  return null;
}
