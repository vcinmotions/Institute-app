import { API_BASE_URL } from "./config";

export type CompanyChoice = { id: string; name: string; role: string };

/** Frees this user's seat on the server and ends the token. Safe to call while the page is closing. */
export function serverLogout() {
  if (typeof window === "undefined") return;
  const token = window.sessionStorage.getItem("token");
  if (!token) return;
  try {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true, // lets the request finish even if the page is going away
    }).catch(() => {});
  } catch {
    /* nothing to do: the server frees the seat after the heartbeat timeout */
  }
}

/** Remembers the signed-in session and the company the user is working in. */
export function persistLogin(data: any) {
  window.localStorage.setItem(
    "auth",
    JSON.stringify({
      token: data.token,
      email: data.email,
      role: data.role,
      userType: data.userType,
      companyId: data.companyId ?? null,
      companyName: data.companyName ?? null,
      companies: data.companies ?? [],
      loggedAt: Date.now(),
    }),
  );
}
