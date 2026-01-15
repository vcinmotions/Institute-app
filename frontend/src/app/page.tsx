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