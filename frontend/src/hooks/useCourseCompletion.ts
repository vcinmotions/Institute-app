import { useMutation } from "@tanstack/react-query";
import { courseCompletionAPI, createCourse, getStudentCourse } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setStudents } from "@/store/slices/studentSlice";
import { useDispatch, useSelector } from "react-redux";
import { setStudentCourse, setStudentDetail } from "@/store/slices/studentCourseSlice";
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
   const currentPage = useSelector((state: RootState) => state.studentCourse.currentPage);
  const token = useSelector((state: RootState) => state.auth.token);
  const searchQuery = useSelector((state: RootState) => state.studentCourse.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.studentCourse);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { token, ...rest } = payload;

      console.log("🔥 Received Payload:", payload);
      console.log("Raw Jwt Token:", payload.token);

      const formData = new FormData();

      // ✅ Append rest of fields to FormData
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // ✅ Debug FormData contents manually
      console.log("📦 Constructed FormData:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`${key}: File { name: ${val.name}, size: ${val.size}, type: ${val.type} }`);
        } else {
          console.log(`${key}: ${val}`);
        }
      }

      // Call your API
      return await courseCompletionAPI(token, formData);
    },

    onSuccess: async (data, variables) => {
      console.log("✅ Course Completion Successfully:", data);

      // Refetch updated enquiries
      const updated = await getStudentCourse({token: variables.token, page: currentPage, limit: PAGE_SIZE, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});

      console.log("📋 Updated Student Course After New Course Completion:", updated);
      dispatch(setStudentCourse(updated.data || []));
      dispatch(setStudentDetail(updated.detailedCourses || []));
    },
    onError: (error) => {
      console.error("❌ Error Creating Course Completion:", error);
    },
  });
};
