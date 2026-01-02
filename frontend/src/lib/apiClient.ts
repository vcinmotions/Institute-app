import axios from "axios";
import { forceLogout } from "@/app/utils/forceLogout";
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClientNew = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// ---- Common interceptor function ----
const add401Interceptor = (client: any) => {
  client.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.response?.status === 401) {
        console.warn("⛔ 401 detected → Auto logout");
        forceLogout();
      }
      return Promise.reject(error);
    },
  );
};

// Apply to BOTH clients
add401Interceptor(apiClient);
add401Interceptor(apiClientNew);
