// import { createCompleteFolowUpAPI, createEnquiryAPI, createHoldEnquiryAPI, createInitialFolowUpAPI, createLostEnquiryAPI, createNextFolowUpAPI, getEnquiry, getFollowUp } from "@/lib/api";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { setFollowUps, setLoading, setError } from "@/store/slices/followUpSlice";
// import { setEnquiries } from "@/store/slices/enquirySlice";

// export const useCreateCompleteFollowUp = () => {
//   const dispatch = useDispatch();

//   const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
//   console.log("get Token in useCreateCompleteFollowUp:", token);

//   const createCompleteFollowUp = async (newFollowUpData: {
//     remark: string;
//     enquiryId: string | null;
//   }) => {
//     if (!token) throw new Error("No token in useCreateCompleteFollowUp");

//     try {
//       dispatch(setLoading(true));

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData.enquiryId);

//       await createCompleteFolowUpAPI(token, newFollowUpData);

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData);

//       // ✅ Fetch updated follow-ups using enquiryId
//       const updated = await getFollowUp(token, newFollowUpData.enquiryId);
//       //dispatch(setFollowUps(updated));

//       console.log("Geting Follow-Up in useCreateCompleteFollowUp:", updated.followup);

//       // ✅ Refetch updated list
//             //const updatedEnquiry = await getEnquiry(token);
//             const updatedEnquiry = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
//             console.log("get enquiry List after create new enquiry:", updated, updated.enquiry);
      
//             // ✅ Only dispatch the array part
//             dispatch(setEnquiries(updatedEnquiry.enquiry));

//             console.log("Geting Follow-Up in UseCreateNextFollowUpHook:", updated.followup);

//       // ✅ Ensure correct data is passed
//       //dispatch(setFollowUps(updated.followup)); // not `updated` directly!

//       // ✅ Ensure correct data is passed
//       dispatch(setFollowUps(updated.followup)); // not `updated` directly!
//     } catch (error: any) {
//       dispatch(setError(error.message || "Failed to create FollowUp"));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return { createCompleteFollowUp };
// };

// export const useCreateHoldEnquiry = () => {
//   const dispatch = useDispatch();

//   const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
//   console.log("get Token in useCreateCompleteFollowUp:", token);

//   const createHoldEnquiry = async (newFollowUpData: {
//     remark: string;
//     enquiryId: string | null;
//   }) => {
//     if (!token) throw new Error("No token in useCreateCompleteFollowUp");

//     try {
//       dispatch(setLoading(true));

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData.enquiryId);

//       await createHoldEnquiryAPI(token, newFollowUpData);

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData);

//       // ✅ Fetch updated follow-ups using enquiryId
//       const updated = await getFollowUp(token, newFollowUpData.enquiryId);
//       //dispatch(setFollowUps(updated));

//       console.log("Geting Follow-Up in useCreateCompleteFollowUp:", updated.followup);

//       // ✅ Refetch updated list
//             //const updatedEnquiry = await getEnquiry(token);
//             const updatedEnquiry = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
//             console.log("get enquiry List after create new enquiry:", updated, updated.enquiry);
      
//             // ✅ Only dispatch the array part
//             dispatch(setEnquiries(updatedEnquiry.enquiry));

//             console.log("Geting Follow-Up in UseCreateNextFollowUpHook:", updated.followup);

//       // ✅ Ensure correct data is passed
//       //dispatch(setFollowUps(updated.followup)); // not `updated` directly!

//       // ✅ Ensure correct data is passed
//       dispatch(setFollowUps(updated.followup)); // not `updated` directly!
//     } catch (error: any) {
//       dispatch(setError(error.message || "Failed to create FollowUp"));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return { createHoldEnquiry };
// };

// export const useCreateLostEnquiry = () => {
//   const dispatch = useDispatch();

//   const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
//   console.log("get Token in useCreateCompleteFollowUp:", token);

//   const createLostEnquiry = async (newFollowUpData: {
//     remark: string;
//     enquiryId: string | null;
//   }) => {
//     if (!token) throw new Error("No token in useCreateCompleteFollowUp");

//     try {
//       dispatch(setLoading(true));

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData.enquiryId);

//       await createLostEnquiryAPI(token, newFollowUpData);

//       console.log("GEt Enquiry id and Remark For complete Enquiry Follow=Up to Admission", newFollowUpData);

//       // ✅ Fetch updated follow-ups using enquiryId
//       const updated = await getFollowUp(token, newFollowUpData.enquiryId);
//       //dispatch(setFollowUps(updated));

//       console.log("Geting Follow-Up in useCreateCompleteFollowUp:", updated.followup);

//       // ✅ Refetch updated list
//             //const updatedEnquiry = await getEnquiry(token);
//             const updatedEnquiry = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
//             console.log("get enquiry List after create new enquiry:", updated, updated.enquiry);
      
//             // ✅ Only dispatch the array part
//             dispatch(setEnquiries(updatedEnquiry.enquiry));

//             console.log("Geting Follow-Up in UseCreateNextFollowUpHook:", updated.followup);

//       // ✅ Ensure correct data is passed
//       //dispatch(setFollowUps(updated.followup)); // not `updated` directly!

//       // ✅ Ensure correct data is passed
//       dispatch(setFollowUps(updated.followup)); // not `updated` directly!
//     } catch (error: any) {
//       dispatch(setError(error.message || "Failed to create FollowUp"));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return { createLostEnquiry };
// };

import { useMutation } from "@tanstack/react-query";
import {
  createCompleteFolowUpAPI,
  createHoldEnquiryAPI,
  createLostEnquiryAPI,
  getEnquiry,
  getFollowUp,
} from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError, setFollowUps } from "@/store/slices/followUpSlice";
import { setEnquiries, setTotal, setTotalPages } from "@/store/slices/enquirySlice";

export const useCreateCompleteFollowUp = () => {
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

      const updatedEnquiry = await getEnquiry({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});
      console.log("ENQUIRY AFTER COMPLETE FOLOW_UP:", updatedEnquiry);
      dispatch(setEnquiries(updatedEnquiry.data));
      dispatch(setTotal(updatedEnquiry.total));
      dispatch(setTotalPages(updatedEnquiry.totalPages));

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
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
    leadStatus,
  } = useSelector((state: RootState) => state.enquiry);
  const token = useSelector((state: RootState) => state.auth.token);

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

      const updatedEnquiry = await getEnquiry({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});
      console.log("ENQUURY DATA FOR HOLD FOLLOW_UP:", updatedEnquiry);
      dispatch(setEnquiries(updatedEnquiry.data));
      dispatch(setTotal(updatedEnquiry.total));
      dispatch(setTotalPages(updatedEnquiry.totalPages));

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
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
    leadStatus,
  } = useSelector((state: RootState) => state.enquiry);
  const token = useSelector((state: RootState) => state.auth.token);

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

      const updatedEnquiry = await getEnquiry({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});
      console.log("ENQUURY DATA FOR LOST FOLLOW_UP:", updatedEnquiry);
      dispatch(setEnquiries(updatedEnquiry.data));
      dispatch(setTotal(updatedEnquiry.total));
      dispatch(setTotalPages(updatedEnquiry.totalPages));

      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to create FollowUp"));
      dispatch(setLoading(false));
    },
  });
};
