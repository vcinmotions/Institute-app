"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type RoleProtectedOptions = {
  allowedRoles: string[];
};

export function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { allowedRoles }: RoleProtectedOptions
) {
  const ComponentWithRoleProtection: React.FC<P> = (props) => {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
      if (user && !allowedRoles.includes(user.role)) {
        router.replace("/dashboard");
      }
    }, [user, allowedRoles, router]);

    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithRoleProtection;
}
