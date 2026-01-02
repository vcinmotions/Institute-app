// src/hooks/useCreateLab.ts
import { useMutation } from "@tanstack/react-query";
import { createEnquiryAPI, createLabApi, getEnquiry, getLab } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setEnquiries, setLoading, setError } from "@/store/slices/enquirySlice";
import { setLab } from "@/store/slices/labSlice";

export const useCreateLab = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newLabData: any) => {
      if (!token) throw new Error("Missing token for create enquiry");

      dispatch(setLoading(true));
      await createLabApi(token, newLabData);

      console.log("GET LAB DATA FOR CREATION:", newLabData);

      // Return token for onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      try {
        // Refetch latest enquiries
        const updated = await getLab({
          token,
          page: 1,
          limit: 5,
          sortField: "createdAt",
        });

        dispatch(setLab(updated.labs));
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch Create Lab"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create Lab";
      dispatch(setError(backend));
      dispatch(setLoading(false));
    },
  });
};