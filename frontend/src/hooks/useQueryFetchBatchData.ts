// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useFetchAllBatches = () => {
  const token = sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["all-batches"],
    queryFn: async () => {
      const res = await apiClient.get("/batch/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("GET ALL BATCHE DATA IN QUERY:", res.data);
      return res.data; // returns full array
    },
    enabled: !!token,
  });
};  