"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type RoleProtectedProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleProtected({
  allowedRoles,
  children,
}: RoleProtectedProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user && !allowedRoles.includes(user?.role)) {
      router.replace("/dashboard");
    }
  }, [user, allowedRoles, router]);

  if (!user || !allowedRoles.includes(user?.role)) {
    return null; // or an Access Denied component
  }

  return <>{children}</>;
}

// "use client";

// import { useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";

// export default function RoleProtected({ allowedRoles, children }: RoleProtectedProps) {
//   const router = useRouter();
//   const user = useSelector((state: RootState) => state.auth.user);

//   // 1) Still loading user → show nothing
//   if (!user) {
//     return null;
//   }

//   // 2) If role not allowed → redirect immediately
//   if (!allowedRoles.includes(user.role)) {
//     router.replace("/dashboard");
//     return null; // PREVENTS UI FLASH
//   }

//   return <>{children}</>;
// }
