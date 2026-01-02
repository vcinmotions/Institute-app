"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUser } from "@/lib/api";
import ClientAdminLayout from "../ClientAdminLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        // ⛔ Replace cookies() with sessionStorage
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/signin");
          return;
        }

        // 👉 fetch user
        const data = await getUser(token);

        if (!data) throw new Error("User not found");

        // ⛔ Prevent MASTER_ADMIN from entering AdminLayout
        if (data.userdata?.role === "MASTER_ADMIN") {
          router.replace("/master-dashboard");
          return;
        }

        setUserData(data);
      } catch (err) {
        router.replace("/signin");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) return null;

  return (
    <ClientAdminLayout user={userData?.userdata}>{children}</ClientAdminLayout>
  );
}
