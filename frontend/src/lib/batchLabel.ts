/** Dropdown label for a batch. Lab is optional, so a batch may have no time slot. */
export function batchLabel(b: any): string {
  const ts = b?.labTimeSlot;
  if (!ts) return `${b?.name} | ${b?.classType ?? "Regular"}`;
  return `${b.name} | ${ts.startTime} - ${ts.endTime} | PCs: ${ts.availablePCs}`;
}
