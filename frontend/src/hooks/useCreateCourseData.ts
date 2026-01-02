import { createCourseAPI, createEnquiryAPI, getCourse } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";

export const useCreateCourse = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateCourse:", token);

  return useMutation({
    mutationFn: async (newCourseData: any) => {
      console.log(
        "GET COURSE DATA IN MUTATION on USECREATECOURSE:",
        newCourseData,
      );
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await createCourseAPI(token, newCourseData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getCourse({ token, page: 1, limit: 5 });
      console.log(
        "get course List after create new course:",
        updated,
        updated.course,
      );

      // ✅ Only dispatch the array part
      dispatch(setCourses(updated.course));
    },

    onError: (error: any) => {
      const backendError =
        error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};
