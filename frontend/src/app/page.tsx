"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { setToken, setUser } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import SubscriptionLanding from "@/components/subscription/SubscriptionLanding";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  // null = not decided yet, true = hosted website, false = Windows EXE
  const [isWeb, setIsWeb] = useState<boolean | null>(null);

  useEffect(() => {
    // The EXE preload exposes window.electronAPI; the public website does not.
    // Website root -> subscription page. EXE -> normal boot (login).
    // A browser visitor who is already signed in to the app (token saved) also
    // takes the normal boot path; otherwise /signin would bounce to the plans page.
    const hasAppSession =
      !!window.sessionStorage.getItem("token") || !!window.localStorage.getItem("auth");
    const inExe = typeof window !== "undefined" && (!!window.electronAPI || hasAppSession);
    setIsWeb(!inExe);
    if (!inExe) return;

    async function boot() {
      try {

        // 1️⃣ Check setup status
        const res = await apiClient.get("/setup/status");
        console.log("GET SETUP STATUS IN FRONTEDN:", res);

        const status = res.data.setupComplete;

        // if (status === "NOT_STARTED") {
        //   router.replace("/setup");
        //   return;
        // }

        if (status === "NOT_STARTED") {
          router.replace("/setup-choice"); // ✅ IMPORTANT
          return;
        }

        if (status === "BASIC_DONE") {
          router.replace("/setup/address");
          return;
        }

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

  if (isWeb) return <SubscriptionLanding />;
  return null;
}


// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { apiClient } from "@/lib/apiClient";
// import { setToken, setUser } from "@/store/slices/authSlice";
// import { useDispatch } from "react-redux";
// import { useQuery } from "@tanstack/react-query";

// // ✅ Type for setup status
// interface SetupStatusResponse {
//   setupComplete: "NOT_STARTED" | "BASIC_DONE" | "COMPLETE";
// }

// export default function Home() {
//   const router = useRouter();
//   const dispatch = useDispatch();

//   // ✅ Typed query
//   const { data: setupData, isLoading, isError } = useQuery<SetupStatusResponse, Error>({
//     queryKey: ["setupStatus"],
//     queryFn: async () => {
//       const res = await apiClient.get("/setup/status");
//       return res.data as SetupStatusResponse;
//     },
//     staleTime: 1000 * 60 * 5,
//   });

//   useEffect(() => {
//     if (isLoading) return; // wait for setup status
//     if (isError) {
//       router.replace("/signin");
//       return;
//     }

//     // 1️⃣ Handle setup redirect
//     if (setupData?.setupComplete === "NOT_STARTED") {
//       router.replace("/setup");
//       return;
//     }
//     if (setupData?.setupComplete === "BASIC_DONE") {
//       router.replace("/setup/address");
//       return;
//     }

//     // 2️⃣ Restore session
//     const raw = window.localStorage.getItem("auth");
//     if (raw) {
//       const session = JSON.parse(raw);

//       if (session?.token) {
//         dispatch(setUser(session));
//         dispatch(setToken(session.token));

//         router.replace(
//           session.role === "MASTER_ADMIN"
//             ? "/master-dashboard"
//             : "/dashboard"
//         );
//         return;
//       }
//     }

//     // 3️⃣ Fallback: sessionStorage token
//     const token = sessionStorage.getItem("token");
//     if (token) {
//       dispatch(setToken(token));
//       router.replace("/dashboard");
//       return;
//     }

//     // 4️⃣ Fallback
//     router.replace("/signin");
//   }, [setupData, isLoading, isError]);

//   return null;
// }