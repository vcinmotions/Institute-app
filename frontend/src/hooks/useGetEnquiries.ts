import { useMutation } from "@tanstack/react-query";
import { getEnquiry } from "@/lib/api";

type GetEnquiryParams = {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc"; // ✅ Strict union
};

export const useFetchEnquiry = () => {
  return useMutation({
    // Accept the whole object
    mutationFn: async (params: GetEnquiryParams) => {
        console.log("get All Params:", params);
      return await getEnquiry(params); // ✅ Now you're passing the full object
    },
    onSuccess: (data) => {
      console.log("Enquiry data fetched successfully:", data);
      // You can dispatch to Redux or navigate if needed
    },
    onError: (error) => {
      console.error("Error fetching Enquiry data:", error);
    },
  });
};
