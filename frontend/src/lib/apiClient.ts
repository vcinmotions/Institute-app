import { API_BASE_URL } from "./config";
import axios from "axios";
import { forceLogout } from "@/app/utils/forceLogout";
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** For endpoints that need no login (branding, activation status). No auth, no 401 auto-logout. */
export const publicApi = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });

export const apiClientNew = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// ---- Common interceptor function ----
const add401Interceptor = (client: any) => {
  client.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.response?.data?.code === "CLIENT_KEY_REQUIRED" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("client-key-required"));
      }
      if (error?.response?.data?.code === "ACTIVATION_REQUIRED" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("activation-required"));
      }
      if (
        error?.response?.status === 402 &&
        error?.response?.data?.code === "SUBSCRIPTION_EXPIRED" &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent("subscription-expired", { detail: error.response.data }),
        );
      }
      // A 401 from the login call itself just means a wrong username/password:
      // stay on the page and let the form show the message. Only expired sessions log out.
      const url = String(error?.config?.url ?? "");
      const isLoginCall = /\/auth\/(master-login|login|select-company)/.test(url);
      // Only a signed-in session can "expire": with no token (e.g. on the sign-in page) a 401 must never
      // trigger a logout/redirect, or the sign-in page reloads itself in a loop.
      const hasSession = typeof window !== "undefined" && !!window.sessionStorage.getItem("token");
      if (error?.response?.status === 401 && !isLoginCall && hasSession) {
        console.warn("⛔ 401 detected → Auto logout");
        forceLogout();
      }
      return Promise.reject(error);
    },
  );
};

// ---- Duplicate-submission guard ----
// An identical POST (same URL + body) already in flight is cancelled, so a double click or an impatient
// retry on a slow LAN cannot create the record twice. The key is released when the first call finishes.
const inFlight = new Set<string>();
const NEVER_DEDUPE = /\/(heartbeat|logout|login|master-login|select-company|switch-company|device-activation)/;

apiClient.interceptors.request.use((config) => {
  if ((config.method ?? "get").toLowerCase() === "post" && !NEVER_DEDUPE.test(String(config.url))) {
    const key = `${config.url}|${typeof config.data === "string" ? config.data : JSON.stringify(config.data ?? "")}`;
    if (inFlight.has(key)) {
      const c = new AbortController();
      c.abort();
      config.signal = c.signal;
      (config as any).__duplicate = true;
    } else {
      inFlight.add(key);
      (config as any).__dupKey = key;
    }
  }
  return config;
});
const release = (cfg: any) => cfg?.__dupKey && inFlight.delete(cfg.__dupKey);
apiClient.interceptors.response.use(
  (r) => { release(r.config); return r; },
  (e) => {
    release(e?.config);
    const method = String(e?.config?.method ?? "get").toLowerCase();
    if (!e?.response && method !== "get" && !e?.config?.__duplicate && typeof window !== "undefined" && e?.code !== "ERR_CANCELED") {
      window.dispatchEvent(new CustomEvent("network-write-failed"));
    }
    return Promise.reject(e);
  },
);

// Client PCs send the token they received when they confirmed the company's Client key.
const withDeviceToken = (config: any) => {
  try {
    const dt = window.localStorage.getItem("vc_device_token");
    if (dt) config.headers["X-Device-Token"] = dt;
  } catch { /* storage unavailable */ }
  return config;
};
apiClientNew.interceptors.request.use(withDeviceToken);

apiClient.interceptors.request.use(withDeviceToken);
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Apply to BOTH clients
add401Interceptor(apiClient);
add401Interceptor(apiClientNew);
