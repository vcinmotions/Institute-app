"use client";

import { useEffect } from "react";
import { sendHeartbeat } from "@/lib/api";
import { forceLogout } from "@/app/utils/forceLogout";

const BEAT_MS = 60 * 1000;

/**
 * Keeps this user's login seat alive. If the app crashes or loses the network the
 * beats stop and the server frees the seat on its own after a few minutes.
 */
export default function SessionKeeper() {
  useEffect(() => {
    const beat = () => {
      if (!window.sessionStorage.getItem("token")) return;
      sendHeartbeat().catch((e: any) => {
        // 401 is handled by the api client. 403 = the seat was lost and the plan limit is full.
        if (e?.response?.status === 403 && e?.response?.data?.code === "LOGIN_LIMIT") {
          alert(e.response.data.error);
          forceLogout();
        }
      });
    };
    const id = window.setInterval(beat, BEAT_MS);
    const onVisible = () => document.visibilityState === "visible" && beat();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
