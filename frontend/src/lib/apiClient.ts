import { API_BASE_URL } from "./config";
import axios from "axios";
import { forceLogout } from "@/app/utils/forceLogout";
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
      if (error?.response?.status === 401 && !isLoginCall) {
        console.warn("⛔ 401 detected → Auto logout");
        forceLogout();
      }
      return Promise.reject(error);
    },
  );
};

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
