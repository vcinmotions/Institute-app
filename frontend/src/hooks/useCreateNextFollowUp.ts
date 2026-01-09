// import { createEnquiryAPI, createInitialFolowUpAPI, createNextFolowUpAPI, getEnquiry, getFollowUp } from "@/lib/api";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { setFollowUps, setLoading, setError } from "@/store/slices/followUpSlice";

// export const useCreateNextFollowUp = () => {
//   const dispatch = useDispatch();

//   const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
//   console.log("get Token in useCreateInitialFollowUp:", token);

//   const createnextFollowUp = async (newFollowUpData: {
//     followUpId: string;
//     remark: string;
//     scheduledAt: string;
//     enquiryId: string | null;
//   }) => {
//     if (!token) throw new Error("No token in useCreateInitialFollowUp");

//     try {
//       dispatch(setLoading(true));

//       await createNextFolowUpAPI(token, newFollowUpData, newFollowUpData.followUpId);

//       // ✅ Fetch updated follow-ups using enquiryId
//       const updated = await getFollowUp(token, newFollowUpData.enquiryId);
//       //dispatch(setFollowUps(updated));

//       console.log("Geting Follow-Up in UseCreateNextFollowUpHook:", updated.followup);

//       // ✅ Ensure correct data is passed
//       dispatch(setFollowUps(updated.followup)); // not `updated` directly!
//     } catch (error: any) {
//       dispatch(setError(error.message || "Failed to create FollowUp"));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return { createnextFollowUp };
// };

// src/hooks/useCreateNextFollowUp.ts
import { useMutation } from "@tanstack/react-query";
import { createNextFolowUpAPI, editNextFolowUpAPI, getEnquiry, getFollowUp } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFollowUps, setLoading, setError } from "@/store/slices/followUpSlice";
import { setEnquiries } from "@/store/slices/enquirySlice";

export const useCreateNextFollowUp = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      followUpId: string;
      remark: string;
      scheduledAt: string;
      enquiryId: string | null;
      currentPage: number
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

        // Fetch updated follow-ups for this enquiry
        const updated = await getFollowUp(token, enquiryId);
        const updatedEnquiry = await getEnquiry({token, page: currentPage, search: searchQuery, sortField: "srNo", sortOrder: "asc"});

        console.log("Updated follow-ups:", updated.followup);
        console.log("Updated Enquiry:", updatedEnquiry);

        // Update Redux state
        dispatch(setFollowUps(updated.followup));
        dispatch(setEnquiries(updatedEnquiry.enquiry));
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
      dispatch(setLoading(false));
    },
  });
};



// src/hooks/useEditNextFollowUp.ts

export const useEditNextFollowUp = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newFollowUpData: {
      followUpId: string;
      remark: string;
      scheduledAt: string;
      enquiryId: string | null;
      currentPage: number
    }) => {
      if (!token) throw new Error("Missing token for create next follow-up");

      dispatch(setLoading(true));
      await editNextFolowUpAPI(token, newFollowUpData, newFollowUpData.followUpId);

      // Return payload for onSuccess
      return { token, enquiryId: newFollowUpData.enquiryId, currentPage: newFollowUpData.currentPage };
    },

    onSuccess: async ({ token, enquiryId, currentPage }) => {
      try {
        if (!enquiryId) throw new Error("Enquiry ID missing");

        // Fetch updated follow-ups for this enquiry
        const updated = await getFollowUp(token, enquiryId);

        console.log("Updated follow-ups:", updated.followup);

        // Update Redux state
        dispatch(setFollowUps(updated.followup));
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
      dispatch(setLoading(false));
    },
  });
};