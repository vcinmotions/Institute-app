// src/hooks/useEditEnquiry.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setEnquiries, setError, setTotal, setTotalPages } from "@/store/slices/enquirySlice";
import { editEnquiryAPI, getEnquiry } from "@/lib/api/enquiry";
import { setAdmissions } from "@/store/slices/admissionSlice";

export const useEditEnquiry = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const token = useSelector((state: RootState) => state.auth.token);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
    leadStatus,
  } = useSelector((state: RootState) => state.enquiry);
   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      await editEnquiryAPI(token, payload);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      //Refetch latest enquiries
      // ✅ reload enquiry list (keeps current page automatically)
      queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN EDIT!")


      console.log("MUTATION SUCCESSFUL")
      // ✅ reload enquiry list (keeps current page automatically)
      // queryClient.invalidateQueries({
      //   queryKey: ["enquiry"],
      // });
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update enquiry";
      dispatch(setError(backend));
    },
  });
};
