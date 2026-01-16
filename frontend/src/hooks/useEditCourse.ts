import { editCourseAPI, getCourse } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";

export const useEditCourse = () => {
  const dispatch = useDispatch();
  const { currentPage, sortField, searchQuery, sortOrder } = useSelector((state: RootState) => state.course); 
  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useEditCourse:", token);

  return useMutation({
    mutationFn: async ({ newCourse, id }: { newCourse: any; id: any }) => {
      console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newCourse, id);
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await editCourseAPI(token, newCourse, id);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getCourse({ token, page: currentPage, limit: PAGE_SIZE, sortField, sortOrder, search: searchQuery });
      console.log(
        "get course List after create new course:",
        updated,
        updated.course,
      );

      // ✅ Only dispatch the array part
      dispatch(setCourses(updated.data));
    },

    onError: (error: any) => {
      const backendError =
        error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
      dispatch(setLoading(false));
    },
  });
};
