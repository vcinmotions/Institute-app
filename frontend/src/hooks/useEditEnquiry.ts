// src/hooks/useEditEnquiry.ts
import { useMutation } from "@tanstack/react-query";
import { editEnquiryAPI, getEnquiry } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setEnquiries, setError, setFilteredEnquiries } from "@/store/slices/enquirySlice";

export const useEditEnquiry = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      await editEnquiryAPI(token, payload);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch latest enquiries
      const updated = await getEnquiry({
        token,
        page: 1,
        limit: 5,
        sortField: "createdAt",
      });

      dispatch(setEnquiries(updated.enquiry));
      dispatch(setFilteredEnquiries(updated.filteredEnquiries));
      dispatch(setError(null));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update enquiry";
      dispatch(setError(backend));
    },
  });
};
