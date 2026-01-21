// src/hooks/useEditEnquiry.ts
import { useMutation } from "@tanstack/react-query";
import { getNotification, updateNotification } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setError } from "@/store/slices/enquirySlice";
import { setNotifications } from "@/store/slices/notificationSlice";

export const useUpdateNotification = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      console.log("GET UID IN MUTATION:", id, token);
      await updateNotification(token, id);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch latest enquiries
      const data = await getNotification({token});

      dispatch(setNotifications(data.notification));
      dispatch(setError(null));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update enquiry";
      dispatch(setError(backend));
    },
  });
};
