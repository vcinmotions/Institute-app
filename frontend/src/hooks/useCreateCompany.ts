import { createCompanyApi, getMasterUser } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading } from "@/store/slices/authSlice";
import { setTenant } from "@/store/slices/authSlice";
import { setError } from "@/store/slices/authSlice";
import { useMutation } from "@tanstack/react-query";

export const useCreateCompany = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateCompany:", token);

  return useMutation({
    mutationFn: async (newCompanyData: any) => {
      console.log("GET Company Creating DATA IN MUTATION:", newCompanyData);
      if (!token) throw new Error("Missing Token for Company Creating");

      dispatch(setLoading(true));

      await createCompanyApi(token, newCompanyData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch updated faculty list
      const updated = await getMasterUser(token);

      console.log(
        "get Tenants List after create new Company:",
        updated,
        updated.tenant,
      );

      // ✅ Only dispatch the array part
      dispatch(setTenant(updated.tenant));
      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      const backendError =
        error?.response?.data?.error || error?.response?.data?.message;
      console.log(
        "error in company creation",
        error?.response?.data?.error,
        error?.response?.data?.message,
        error,
      );
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};
