import { useMutation, useQueryClient } from "@tanstack/react-query"; // 👈 Added useQueryClient
import { courseCompletionAPI, getStudentCourse } from "@/lib/api";
import { setStudentCourse, setStudentDetail } from "@/store/slices/studentCourseSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { PAGE_SIZE } from "@/constants/pagination";

type Payload = {
  token: string;
  studentId: string;
  studentCourseId: string;
  remark: string;
  feedback: string;
};

export const useCourseCompletion = () => {
  const queryClient = useQueryClient(); // 👈 Essential for syncing React Query cache
  const dispatch = useDispatch();

  // Get current state from Redux to pass to the refetch API call
  const currentPage = useSelector((state: RootState) => state.studentCourse.currentPage);
  const searchQuery = useSelector((state: RootState) => state.studentCourse.searchQuery);
  const { filters, sortField, sortOrder } = useSelector((state: RootState) => state.studentCourse);

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { token, ...rest } = payload;

      console.log("🔥 Received Payload:", payload);

      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      return await courseCompletionAPI(token, formData);
    },

    onSuccess: async (data, variables) => {
      console.log("✅ Course Completion Successfully:", data);

      // 1. Invalidate React Query Cache so your `useFetchStudentCourses` hook automatically refetches
      queryClient.invalidateQueries({ queryKey: ["studentCourses"] });

      // 2. Safely call the API to update Redux store manually 
      try {
        const updatedResponse = await getStudentCourse({
          token: variables.token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 Correctly spreads the filter fields into the root parameter object
        });

        console.log("📋 Updated Student Course Payload:", updatedResponse);

        // Note: assumed getStudentCourse returns `response.data` which contains { data, detailedCourses }
        dispatch(setStudentCourse(updatedResponse?.data || []));
        dispatch(setStudentDetail(updatedResponse?.detailedCourses || []));
      } catch (error) {
        console.error("❌ Failed to manually sync Redux state:", error);
      }
    },
    onError: (error) => {
      console.error("❌ Error Creating Course Completion:", error);
    },
  });
};