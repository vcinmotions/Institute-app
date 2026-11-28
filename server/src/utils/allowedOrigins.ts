// Which browser origins may call the API and open a socket connection.
//
// Always allowed: this PC (localhost) and computers on the institute's private network
// (LAN mode: the app is opened from http://<server-ip>:3000).
// Extra public sites come from CORS_ALLOWED_ORIGINS in the env file, a comma-separated list of
// host names ("iapp.vcglobalskills.in") or full origins ("https://iapp.vcglobalskills.in").
// A host name allows that host on any scheme/port; a full origin must match exactly.

let extraHosts: Set<string> | null = null;
let extraOrigins: Set<string> | null = null;

function loadExtra() {
  if (extraHosts && extraOrigins) return;
  extraHosts = new Set();
  extraOrigins = new Set();
  for (const raw of (process.env.CORS_ALLOWED_ORIGINS || "").split(",")) {
    const entry = raw.trim().toLowerCase().replace(/\/+$/, "");
    if (!entry) continue;
    if (entry.includes("://")) {
      try {
        extraOrigins.add(new URL(entry).origin);
      } catch {
        console.warn(`CORS_ALLOWED_ORIGINS: ignoring invalid entry "${raw.trim()}"`);
      }
    } else {
      extraHosts.add(entry);
    }
  }
}

export function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true; // same-origin / non-browser clients
  try {
    const url = new URL(origin);
    const h = url.hostname.toLowerCase();
    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      /^169\.254\./.test(h)
    ) {
      return true;
    }
    loadExtra();
    return extraHosts!.has(h) || extraOrigins!.has(url.origin.toLowerCase());
  } catch {
    return false;
  }
}
