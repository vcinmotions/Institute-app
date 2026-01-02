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
import { useMutation } from "@tanstack/react-query";
import { createEnquiryAPI, getEnquiry } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setEnquiries, setLoading, setError } from "@/store/slices/enquirySlice";

export const useCreateEnquiry = () => {
  const dispatch = useDispatch();
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

    onSuccess: async ({ token }) => {
      try {
        console.log("GET THE CURENT PAGE IN ENQUIYR CREATE MUTATION:", currentPage);
        // Refetch latest enquiries
        const updated = await getEnquiry({
          page: currentPage,
          token,
          limit: 5,
          sortField: "createdAt",
        });

        dispatch(setEnquiries(updated.enquiry));
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to fetch updated enquiries"));
      } finally {
        dispatch(setLoading(false));
      }
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create enquiry";
      dispatch(setError(backend));
      dispatch(setLoading(false));
    },
  });
};
