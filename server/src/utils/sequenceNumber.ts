/**
 * Admission / receipt number layout, identical to the live preview on the settings screens:
 *   prefix - zero-padded number - 2-digit year (when "Include Year" is ticked) - suffix
 * e.g. S-0001-26. Empty parts are skipped.
 */
export function formatSequenceNumber(config: {
  prefix?: string | null;
  suffix?: string | null;
  separator?: string | null;
  numberLength: number;
  currentNumber: number;
  includeYear?: boolean | null;
}, now: Date = new Date()): string {
  const parts: string[] = [];
  if (config.prefix) parts.push(config.prefix);
  parts.push(String(config.currentNumber).padStart(config.numberLength, "0"));
  if (config.includeYear) parts.push(String(now.getFullYear()).slice(-2));
  if (config.suffix) parts.push(config.suffix);
  return parts.join(config.separator ?? "-");
}
