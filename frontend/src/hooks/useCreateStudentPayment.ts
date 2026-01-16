import { createStudentPaymentAPI, getEnquiry, getPayment } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPayment, setLoading, setError } from "@/store/slices/paymentSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";

export const useCreateStudentPayment = () => {
  const dispatch = useDispatch();

  const currentPage = useSelector((state: RootState) => state.payment.currentPage);
  const token = useSelector((state: RootState) => state.auth.token);
  const searchQuery = useSelector((state: RootState) => state.payment.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.payment);

  console.log("get Token in useCreateStudentPayment:", token);

  // const createStudentPayment = async (newStudentPaymentData: any) => {
  //   if (!token) throw new Error("No token in useCreateStudentPayment");

  //   console.log("Get Update studemt Pafement data in mutation:", newStudentPaymentData);

  //   try {
  //     dispatch(setLoading(true));

  //     await createStudentPaymentAPI(token, newStudentPaymentData, newStudentPaymentData.id);

  //     // ✅ Refetch updated list
  //     //const updated = await getEnquiry({ token, page: 1, limit: 5 });
  //     const updated = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
  //     console.log("get enquiry List after create new enquiry:", updated, updated.data);

  //     // ✅ Only dispatch the array part
  //     dispatch(setPayment(updated.data));
  //   } catch (error: any) {
  //     dispatch(setError(error.message || "Failed to create enquiry"));
  //     throw error;
  //   } finally {
  //     dispatch(setLoading(false));
  //   }
  // };


  return useMutation({
    mutationFn: async (newStudentPaymentData: any) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      await createStudentPaymentAPI(token, newStudentPaymentData, newStudentPaymentData.id);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getPayment({token, page: currentPage, limit: PAGE_SIZE, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});

      // ✅ Only dispatch the array part
      dispatch(setPayment(updated.data));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to update payment";
      dispatch(setError(backend));
    },
  });

  // return { createStudentPayment };

};