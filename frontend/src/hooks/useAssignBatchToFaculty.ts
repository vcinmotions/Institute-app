// src/hooks/useAssignBatch.ts
import { useMutation } from "@tanstack/react-query";
import { createAssignBatchToFacultyAPI, getFaculty } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFaculties } from "@/store/slices/facultySlice";
import { setLoading, setError } from "@/store/slices/paymentSlice";

export const useAssignBatch = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  return useMutation({
    mutationFn: async ( newFaculty : any) => {
      console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newFaculty);
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await createAssignBatchToFacultyAPI(token, newFaculty);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch updated faculty list
      const updated = await getFaculty({
        token,
        page: 1,
        limit: 5,
        sortField: "createdAt",
      });

      dispatch(setFaculties(updated.faculty));
      dispatch(setError(null));
      dispatch(setLoading(false));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};
