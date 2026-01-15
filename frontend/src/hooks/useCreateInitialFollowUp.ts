// src/hooks/useCreateInitialFollowUp.ts
import { useMutation } from "@tanstack/react-query";
import { createInitialFolowUpAPI, getEnquiry, getFollowUp } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFollowUps, setLoading, setError } from "@/store/slices/followUpSlice";
import { setEnquiries } from "@/store/slices/enquirySlice";

export const useCreateInitialFollowUp = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
    leadStatus,
  } = useSelector((state: RootState) => state.enquiry);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      enquiryId: string;
      remark: string;
      scheduledAt: string;
      searchQuery: string;
      currentPage: number
    }) => {
      if (!token) throw new Error("No token in useCreateInitialFollowUp");

      dispatch(setLoading(true));
      await createInitialFolowUpAPI(token, newFollowUpData);

      // Return payload for use in onSuccess
      return { token, enquiryId: newFollowUpData.enquiryId};
    },

    onSuccess: async ({ token, enquiryId  }) => {
      try {
        // Fetch updated enquiry list
        const updatedEnquiry = await getEnquiry({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});

        // Fetch follow-ups for this enquiry
        const updatedFollowUps = await getFollowUp(token, enquiryId);

        // Update Redux state
        dispatch(setEnquiries(updatedEnquiry.enquiry));
        dispatch(setFollowUps(updatedFollowUps));
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch updated follow-ups"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create FollowUp";
      dispatch(setError(backend));
      dispatch(setLoading(false));
    },
  });
};
