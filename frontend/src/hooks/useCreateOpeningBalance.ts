// src/hooks/useCreateLab.ts
import { useMutation } from "@tanstack/react-query";
import { createOpeningBalanceApi, getPayment } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPayment, setLoading, setError, setTotalPages, setTotal } from "@/store/slices/paymentSlice";
import { PAGE_SIZE } from "@/constants/pagination";

export const useCreateOpeningBalance = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const { currentPage, searchQuery, sortField, sortOrder, filters} = useSelector((state: RootState) => state.payment);

  return useMutation({
    mutationFn: async (newStudent: any) => {
      if (!token) throw new Error("Missing token for create enquiry");

      dispatch(setLoading(true));
      await createOpeningBalanceApi(token, newStudent);

      console.log("GET LAB DATA FOR CREATION:", newStudent);

      // Return token for onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      try {
        // Refetch latest enquiries
         const response = await getPayment({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 send filters to API
        });

        dispatch(setPayment(response.data || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch Create Lab"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create Lab";
      dispatch(setError(backend));
    },
  });
};