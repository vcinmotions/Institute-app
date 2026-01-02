import { useMutation } from "@tanstack/react-query";
import { getEnquiry } from "@/lib/api";

type GetLabParams = {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc"; // ✅ Strict union
};

export const useFetchLab = () => {
  return useMutation({
    // Accept the whole object
    mutationFn: async (params: GetLabParams) => {
        console.log("get All Params:", params);
      return await getEnquiry(params); // ✅ Now you're passing the full object
    },
    onSuccess: (data) => {
      console.log("Lab data fetched successfully:", data);
      // You can dispatch to Redux or navigate if needed
    },
    onError: (error) => {
      console.error("Error fetching Lab data:", error);
    },
  });
};
