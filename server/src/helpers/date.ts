//helpers/date.ts
export function parseDate(value?: string) {
  return value ? new Date(value) : null;
}
