import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudentPaymentAPI } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setError } from "@/store/slices/paymentSlice";

export const useCreateStudentPayment = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newStudentPaymentData: any) => {
      if (!token) throw new Error("Missing authentication token context");

      // Execute the payment record creation/update multipart API handler
      return await createStudentPaymentAPI(token, newStudentPaymentData, newStudentPaymentData.id);
    },

    onSuccess: async () => {
      console.log("INVALIDATEQUERIES TRIGGERED IN STUDENT PAYMENTS!");

      // ✅ Clean invalidate targeting the root key name used in 'useFetchPayment'
      // This tells TanStack Query that the table layout dataset is stale, forcing an instant auto-refresh.
      await queryClient.invalidateQueries({
        queryKey: ["payments"]
      });

      // Clear any historic operational errors out of the view layer state
      dispatch(setError(null));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to finalize structural student payment";
      dispatch(setError(backendError));
    },
  });
};