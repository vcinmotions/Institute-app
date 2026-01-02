"use client";

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Props {
  allowedRoles: string[];
  children: ReactNode;
}

export default function ShowForRoles({ allowedRoles, children }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);

  // If user does NOT have the required role → hide the entire content
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
// #239bf5
