import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNextFolowUpAPI, editNextFolowUpAPI, getEnquiry, getFollowUp } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFollowUps, setLoading, setError } from "@/store/slices/followUpSlice";
import { setEnquiries } from "@/store/slices/enquirySlice";

export const useCreateNextFollowUp = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient(); // ✅ Added QueryClient access
  const token = useSelector((state: RootState) => state.auth.token);
  const {
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.enquiry);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      followUpId: string;
      remark: string;
      scheduledAt: string;
      enquiryId: string | null;
      currentPage: number;
    }) => {
      if (!token) throw new Error("Missing token for create next follow-up");

      dispatch(setLoading(true));
      await createNextFolowUpAPI(token, newFollowUpData, newFollowUpData.followUpId);

      // Return payload for onSuccess
      return { token, enquiryId: newFollowUpData.enquiryId, currentPage: newFollowUpData.currentPage };
    },

    onSuccess: async ({ token, enquiryId, currentPage }) => {
      try {
        if (!enquiryId) throw new Error("Enquiry ID missing");

        // Fetch updated data from API for Redux fallback sync
        const updated = await getFollowUp(token, enquiryId);
        const updatedEnquiry = await getEnquiry({
          token,
          page: currentPage,
          search: searchQuery,
          sortField: sortField,
          sortOrder: sortOrder,
          ...filters
        });

        // Sync Redux Store state
        dispatch(setFollowUps(updated.followup));
        dispatch(setEnquiries(updatedEnquiry.data));

        // ✅ CRITICAL FIX: Force TanStack Query hooks to fetch the clean server state instantly
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] }),
          queryClient.invalidateQueries({ queryKey: ["followup", enquiryId] })
        ]);

        console.log("🔥 NEXT FOLLOW-UP CREATED & LIFECYCLE QUERIES INVALIDATED");
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch updated follow-ups"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create next follow-up";
      dispatch(setError(backend));
      dispatch(setLoading(false)); // Ensure loading stops if it crashes early
    },
  });
};

// src/hooks/useEditNextFollowUp.ts
export const useEditNextFollowUp = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient(); // ✅ Added QueryClient access
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      followUpId: string;
      remark: string;
      scheduledAt: string;
      enquiryId: string | null;
      currentPage: number;
    }) => {
      if (!token) throw new Error("Missing token for edit follow-up");

      dispatch(setLoading(true));
      await editNextFolowUpAPI(token, newFollowUpData, newFollowUpData.followUpId);

      // Return payload for onSuccess
      return { token, enquiryId: newFollowUpData.enquiryId, currentPage: newFollowUpData.currentPage };
    },

    onSuccess: async ({ token, enquiryId }) => {
      try {
        if (!enquiryId) throw new Error("Enquiry ID missing");

        // Fetch updated follow-ups for Redux store compatibility
        const updated = await getFollowUp(token, enquiryId);
        dispatch(setFollowUps(updated.followup));

        // ✅ CRITICAL FIX: Force TanStack Query hooks to fetch the updated logs instantly
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] }),
          queryClient.invalidateQueries({ queryKey: ["followup", enquiryId] })
        ]);

        console.log("🔥 FOLLOW-UP RECORD UPDATED & LIFECYCLE QUERIES INVALIDATED");
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch updated follow-ups"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update follow-up";
      dispatch(setError(backend));
      dispatch(setLoading(false)); // Ensure loading stops if it crashes early
    },
  });
};