import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCompleteFolowUpAPI,
  createHoldEnquiryAPI,
  createLostEnquiryAPI,
  getFollowUp,
} from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError, setFollowUps } from "@/store/slices/followUpSlice";
import { setEnquiries, setTotal, setTotalPages } from "@/store/slices/enquirySlice";

export const useCreateCompleteFollowUp = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      enquiryId: string;
      remark: string;
      currentPage: number;
    }) => {
      if (!token) throw new Error("Missing Token");

      dispatch(setLoading(true));

      await createCompleteFolowUpAPI(token, data);

       // ✅ return ONE object
      return {
        enquiryId: data.enquiryId,
        currentPage: data.currentPage,
      };
    },

    onSuccess: async (data) => {
      if (!token) throw new Error("Missing Token");

      const { enquiryId, currentPage } = data;

      const followData = await getFollowUp(token, enquiryId);
      dispatch(setFollowUps(followData.followup));

      queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN WON!")

      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to create FollowUp"));
      dispatch(setLoading(false));
    },
  });
};

export const useCreateHoldEnquiry = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error("Missing Token");

      dispatch(setLoading(true));

      await createHoldEnquiryAPI(token, data);

      return data.enquiryId;
    },

    onSuccess: async (enquiryId: string) => {
      if (!token) throw new Error("Missing Token");
      const followData = await getFollowUp(token, enquiryId);
      dispatch(setFollowUps(followData.followup));


      queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN HOLD!")

      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to create FollowUp"));
      dispatch(setLoading(false));
    },
  });
};

export const useCreateLostEnquiry = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error("Missing Token");

      dispatch(setLoading(true));

      await createLostEnquiryAPI(token, data);

      return data.enquiryId;
    },

    onSuccess: async (enquiryId: string) => {
      if (!token) throw new Error("Missing Token");
      const followData = await getFollowUp(token, enquiryId);
      dispatch(setFollowUps(followData.followup));

      // ✅ reload enquiry list (keeps current page automatically)
      queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN LOST!")

      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to create FollowUp"));
      dispatch(setLoading(false));
    },
  });
};
