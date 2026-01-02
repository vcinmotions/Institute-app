"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type GlobalHotKeysProps = {
  children: React.ReactNode;
};

export default function MasterGlobalHotkeys({ children }: GlobalHotKeysProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {

        case "F2":
          e.preventDefault();
          router.push("/master-dashboard/company");
          break;

        case "F1":
          e.preventDefault();
          router.push("/master-dashboard");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return <>{children}</>;
}
