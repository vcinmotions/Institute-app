import axios from "axios";
import { API_BASE_URL } from "./config";

// Separate client for the public website: it must not use the app's login token
// or its 401 auto-logout.
export const portalApi = axios.create({ baseURL: API_BASE_URL });

const KEY = "portalToken";

export const getPortalToken = (): string | null => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setPortalToken = (t: string | null) => {
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
};

export const portalAuthHeader = () => ({ Authorization: `Bearer ${getPortalToken()}` });
