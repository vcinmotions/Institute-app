/**
 * Turns a failed request into a message a person can read.
 * Prefers the server's own message (for example "Username already exists").
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = error as any;
  const data = e?.response?.data;

  if (typeof data === "string" && data.trim()) return data.slice(0, 300);
  if (data?.error && typeof data.error === "string") return data.error;
  if (data?.message && typeof data.message === "string") return data.message;
  if (Array.isArray(data?.details) && data.details[0]?.message) return String(data.details[0].message);

  if (e?.code === "ERR_NETWORK" || (e && !e.response && /network/i.test(String(e.message)))) {
    return "Cannot reach the server. Check that the app is running and try again.";
  }
  if (typeof e?.message === "string" && e.message && e.message !== "Request failed with status code 500") {
    return e.message;
  }
  return fallback;
}
