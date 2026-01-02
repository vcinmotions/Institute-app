import { createCourseAPI, createEnquiryAPI, createFacultyAPI, getCourse, getFaculty } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { setFaculties } from "@/store/slices/facultySlice";
import { useMutation } from "@tanstack/react-query";

export const useCreateFaculty = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateCourse:", token);

  return useMutation({
    mutationFn: async (newFacultyData: any) => {
      if (!token) throw new Error("Missing token for create enquiry");

      dispatch(setLoading(true));
      await createFacultyAPI(token, newFacultyData);

      // Return token for onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      try {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getFaculty({ token, page: 1, limit: 5, });
      console.log("get Faculty List after create new course:", updated, updated.faculty);

      // ✅ Only dispatch the array part
      dispatch(setFaculties(updated.faculty));
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