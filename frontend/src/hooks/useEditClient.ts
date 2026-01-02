// src/hooks/useEditEnquiry.ts
import { useMutation } from "@tanstack/react-query";
import { editClientAPI, editEnquiryAPI, editMasterAPI, getEnquiry, getMasterUser, getUser } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setEnquiries, setError, setFilteredEnquiries } from "@/store/slices/enquirySlice";
import { setUser } from "@/store/slices/authSlice";

export const useEditClient = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      console.log("GET UPDATE CLIENT PROFILE DATA IN MUTATION:", payload);
      await editClientAPI(token, payload);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch latest enquiries
      const data = await getUser(token);

      dispatch(setUser(data.userdata));
      dispatch(setError(null));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update enquiry";
      dispatch(setError(backend));
    },
  });
};
