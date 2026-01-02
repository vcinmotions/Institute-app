"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMasterUser } from "@/lib/api";
import MasterAdminLayout from "../MasterAdminLayout";

export default function MasterLayout({
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
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/signin");
          return;
        }

        const data = await getMasterUser(token); // token is now string
        if (!data) throw new Error("User data not found");

        if (data.userdata?.role !== "MASTER_ADMIN") {
          router.replace("/dashboard");
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
    <MasterAdminLayout user={userData?.userdata}>{children}</MasterAdminLayout>
  );
}
