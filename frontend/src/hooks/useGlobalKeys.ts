import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";

export const useGlobalKeys = () => {
  const router = useRouter();

  useHotkeys("f3", () => router.push("/masters/create"));
  useHotkeys("f4", () => router.push("/masters/alter"));
  useHotkeys("f5", () => router.push("/masters/view"));
  useHotkeys("esc", () => router.back());
};
