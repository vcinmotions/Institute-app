import { createEnquiryAPI, createStudentPaymentAPI, getEnquiry } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPayment, setLoading, setError } from "@/store/slices/paymentSlice";

export const useCreateStudentPayment = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateStudentPayment:", token);

  const createStudentPayment = async (newStudentPaymentData: any) => {
    if (!token) throw new Error("No token in useCreateStudentPayment");

    console.log("Get Update studemt Pafement data in mutation:", newStudentPaymentData);

    try {
      dispatch(setLoading(true));

      await createStudentPaymentAPI(token, newStudentPaymentData, newStudentPaymentData.id);

      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
      console.log("get enquiry List after create new enquiry:", updated, updated.payment);

      // ✅ Only dispatch the array part
      dispatch(setPayment(updated.payment));
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to create enquiry"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { createStudentPayment };

};