"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { setToken, setUser } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    async function boot() {
      try {
        
        // 1️⃣ Check setup status
        const res = await apiClient.get("/setup/status");
        console.log("GET SETUP STATUS IN FRONTEDN:", res);

        const status = res.data.setupComplete;

        if (status === "NOT_STARTED") {
          router.replace("/setup");
          return;
        }

        if (status === "BASIC_DONE") {
          router.replace("/setup/address");
          return;
        }

        // const data = await res.json();
        // if (res.data.setupComplete === false) {
        //   router.replace("/setup");
        //   return;
        // }

      // 2️⃣ Restore session
      console.log("WINDOW:", window);
      const raw = window.localStorage.getItem("auth");

      if (raw) {
        const session = JSON.parse(raw);

        if (session?.token) {
          dispatch(setUser(session));
          dispatch(setToken(session.token));

          router.replace(
            session.role === "MASTER_ADMIN"
              ? "/master-dashboard"
              : "/dashboard"
          );
          return;
        }
      }

     
        // 3️⃣ Fallback: check token in sessionStorage (optional)
        const token = sessionStorage.getItem("token");
        if (!token) {
          router.replace("/signin");
          return;
        }
      } catch (err) {
        console.error(err);
        router.replace("/signin"); // fallback
      }
    }

    boot();
  }, []);

  return null;
}
