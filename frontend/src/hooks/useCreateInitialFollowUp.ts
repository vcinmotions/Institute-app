import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInitialFolowUpAPI, getFollowUp } from "@/lib/api"; // Added getFollowUp API
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError, setFollowUps } from "@/store/slices/followUpSlice";

export const useCreateInitialFollowUp = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      enquiryId: string;
      remark: string;
      scheduledAt: string;
    }) => {
      if (!token) throw new Error("Authentication token missing from store context");

      // 1️⃣ Match loading states exactly like the others
      dispatch(setLoading(true));

      await createInitialFolowUpAPI(token, newFollowUpData);

      // Return the ID for use in the next step
      return newFollowUpData.enquiryId;
    },

    onSuccess: async (enquiryId: string) => {
      if (!token) throw new Error("Missing Token");

      // 2️⃣ Fetch and sync the updated follow-up details straight to the timeline state
      const followData = await getFollowUp(token, enquiryId);
      dispatch(setFollowUps(followData.followup));

      // 3️⃣ FIXED: Match the exact singular string "enquiry" used by your table view query
      await queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN INITIAL FOLLOW-UP!");

      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to create Follow-Up";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};