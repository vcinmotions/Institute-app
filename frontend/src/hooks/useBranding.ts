"use client";

import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/apiClient";
import { SERVER_ORIGIN } from "@/lib/config";

export type Branding = { instituteName: string | null; logoUrl: string | null };

/**
 * Institute name + logo set by the Super Admin (Master > Branding).
 * Public read, so the login screen can show it too. Refetched automatically after any save.
 */
export function useBranding() {
  const { data } = useQuery<Branding>({
    queryKey: ["branding"],
    queryFn: async () => (await publicApi.get("/branding/public")).data,
    staleTime: 60_000,
    retry: false,
  });
  return {
    instituteName: data?.instituteName ?? null,
    // The server replaces the file name on every upload, so the URL changes and caches never go stale.
    logoSrc: data?.logoUrl ? `${SERVER_ORIGIN}${data.logoUrl}` : null,
  };
}
