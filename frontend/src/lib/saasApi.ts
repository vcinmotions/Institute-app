import axios from "axios";
import { API_BASE_URL } from "./config";

// Client for the SaaS Super Admin pages. Uses its own token so it never mixes
// with the institute app login or the customer portal login.
export const saasApi = axios.create({ baseURL: API_BASE_URL });

const KEY = "saasToken";

export const getSaasToken = (): string | null => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setSaasToken = (t: string | null) => {
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
};

saasApi.interceptors.request.use((config) => {
  const t = getSaasToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
