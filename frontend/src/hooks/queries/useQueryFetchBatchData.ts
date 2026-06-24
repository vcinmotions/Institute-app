// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

type FetchBatchesOptions = {
  onlyAvailable?: boolean; // optional flag
};

export const useFetchAllBatches = ({ onlyAvailable = false }: FetchBatchesOptions = {}) => {
  const token = sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["all-batches", onlyAvailable],
    queryFn: async () => {
      // Construct URL dynamically
      const url = `/batch/all/${onlyAvailable}`; // path param instead of query param

      const res = await apiClient.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // returns full array
    },
    enabled: !!token,
  });
};