// src/hooks/useFetchFollowUps.ts
import { useQuery } from "@tanstack/react-query";
import { getFollowUp } from "@/lib/api";

export const useFetchFollowUps = (id: string | null) => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  return useQuery({
    queryKey: ["followups", id],
    queryFn: () => getFollowUp(token, id),
    enabled: !!token && !!id, // Declaratively runs whenever an ID is set
    staleTime: 1000 * 60 * 5, // 5 minutes cache structural holding
  });
};
