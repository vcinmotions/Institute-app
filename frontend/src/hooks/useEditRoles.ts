import {
  createEnquiryAPI,
  createRoles,
  createStudentPaymentAPI,
  editRolesApi,
  getEnquiry,
  getRoles,
} from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPayment, setLoading, setError } from "@/store/slices/paymentSlice";
import { setRoles } from "@/store/slices/rolesSlices";
import { useMutation } from "@tanstack/react-query";

export const useEditRoles = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useEditRoles:", token);

  return useMutation({
    mutationFn: async ({ formData, id }: { formData: any; id: any }) => {
      if (!token) throw new Error("Missing Token for edit enquiry");

      await editRolesApi(token, formData, id);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getRoles(token);
      console.log(
        "get Roles List after create new enquiry:",
        updated,
        updated.roles,
      );

      // ✅ Only dispatch the array part
      dispatch(setRoles(updated.roles));
    },

    onError: (error: any) => {
      const backend =
        error?.response?.data?.error || "Failed to update enquiry";
      dispatch(setError(backend));
    },
  });
};
