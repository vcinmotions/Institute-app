import { createBatchAPI, createCourseAPI, createEnquiryAPI, getBatch, getCourse } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { useMutation } from "@tanstack/react-query";

export const useCreateBatch = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateBatch:", token);

    if (!token) throw new Error("No token in useCreateBatch");

  return useMutation({
    mutationFn: async ( newBatchData : any) => {
      console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newBatchData);
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await createBatchAPI(token, newBatchData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch updated faculty list
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getBatch({ token, page: 1, limit: 5 });
      console.log("get course List after create new batch:", updated, updated.batch);

      // ✅ Only dispatch the array part
      dispatch(setBatches(updated.batch));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};