// components/auth/ProtectedRoute.tsx
"use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { getUser } from "@/lib/api";

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const verifyUser = async () => {
//       const token = sessionStorage.getItem("token");

//       if (!token) {
//         router.replace("/signin");
//         return;
//       }

//       try {
//         //await getUser(token);
//         setLoading(false);
//       } catch (err) {
//         console.error("❌ Token invalid or user fetch failed", err);
//         router.replace("/signin");
//       }
//     };

//     verifyUser();
//   }, []);

//   if (loading) return null; // Optionally show a spinner here

//   return <>{children}</>;
// }

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional (defaults to MASTER_ADMIN + CLIENT_ADMIN)
};

export default function ProtectedRoute({
  children,
  allowedRoles = ["MASTER_ADMIN", "ADMIN"],
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // 🚫 No token → redirect to login
    if (!token) {
      router.replace("/signin");
      return;
    }

    // ✅ Check user and role
    if (user) {
      if (!allowedRoles.includes(user?.role)) {
        console.warn("Unauthorized role:", user?.role);
        router.replace("/dashboard"); // fallback
      } else {
        setLoading(false);
      }
    } else {
      // Wait for user to be fetched before deciding
      setLoading(true);
    }
  }, [user, allowedRoles, router]);

  if (loading) return null; // can replace with a spinner if you like

  return <>{children}</>;
}
