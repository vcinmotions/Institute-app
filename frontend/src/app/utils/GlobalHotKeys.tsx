"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type GlobalHotKeysProps = {
  children: React.ReactNode;
};

export default function GlobalHotkeys({ children }: GlobalHotKeysProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          router.push("/dashboard/enquiry");
          break;

        case "F2":
          e.preventDefault();
          router.push("/dashboard/enquiry/create");
          break;

        case "F3":
          e.preventDefault();
          router.push("/dashboard/batch");
          break;

        // case "F4":
        //   e.preventDefault();
        //   router.push("/dashboard/batch/create");
        //   break;

        case "F5":
          e.preventDefault();
          router.push("/dashboard/course");
          break;

        case "F6":
          e.preventDefault();
          router.push("/dashboard/course/create");
          break;

        case "F7":
          e.preventDefault();
          router.push("/dashboard/lab");
          break;

        case "F8":
          e.preventDefault();
          router.push("/dashboard/lab/create");
          break;

        case "F9":
          e.preventDefault();
          router.push("/dashboard/faculty");
          break;

        case "F10":
          e.preventDefault();
          router.push("/dashboard/faculty/create");
          break;

        case "F11":
          e.preventDefault();
          router.push("/dashboard/roles");
          break;

        case "F12":
          e.preventDefault();
          router.push("/dashboard/roles/create");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return <>{children}</>;
}
