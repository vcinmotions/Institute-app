import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInitialFolowUpAPI, getFollowUp } from "@/lib/api";
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

      dispatch(setLoading(true));
      await createInitialFolowUpAPI(token, newFollowUpData);

      return newFollowUpData.enquiryId;
    },

    onSuccess: async (enquiryId: string) => {
      if (!token) throw new Error("Missing Token");

      // Sync data to Redux slice
      const followData = await getFollowUp(token, enquiryId);
      dispatch(setFollowUps(followData.followup));

      // ✅ FIX: Invalidate both the master enquiry profile and the timeline query arrays
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] }),
        queryClient.invalidateQueries({ queryKey: ["followup", enquiryId] }), // Matches the key inside useFollowUp
      ]);

      console.log("🔥 RE-FETCH PIPELINES INITIATED FOR ENQUIRY AND TIMELINE!");

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