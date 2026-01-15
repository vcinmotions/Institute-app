// import { createEnquiryAPI, getEnquiry } from "@/lib/api";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { setEnquiries, setLoading, setError } from "@/store/slices/enquirySlice";

// export const useCreateEnquiry = () => {
//   const dispatch = useDispatch();

//   const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
//   console.log("get Token in useCreateEnquiry:", token);

//   const createEnquiry = async (newEnquiryData: any) => {
//     if (!token) throw new Error("No token in useCreateEnquiry");

//     try {
//       dispatch(setLoading(true));

//       await createEnquiryAPI(token, newEnquiryData);

//       // ✅ Refetch updated list
//       //const updated = await getEnquiry({ token, page: 1, limit: 5 });
//       const updated = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
//       console.log("get enquiry List after create new enquiry:", updated, updated.enquiry);

//       // ✅ Only dispatch the array part
//       dispatch(setEnquiries(updated.enquiry));
//     } catch (error: any) {
//       dispatch(setError(error.message || "Failed to create enquiry"));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return { createEnquiry };
// };

// src/hooks/useCreateEnquiry.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { setEnquiries, setLoading, setError } from "@/store/slices/enquirySlice";
import { createEnquiryAPI } from "@/lib/api/enquiry";

export const useCreateEnquiry = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async (newEnquiryData: any) => {
      if (!token) throw new Error("Missing token for create enquiry");

      dispatch(setLoading(true));
      await createEnquiryAPI(token, newEnquiryData);

      // Return token for onSuccess
      return { token };
    },

    onSuccess: () => {
      // ✅ reload enquiry list (keeps current page automatically)
      queryClient.invalidateQueries({
        queryKey: ["enquiry"],
      });
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create enquiry";
      dispatch(setError(backend));
      dispatch(setLoading(false));
    },
  });
};
