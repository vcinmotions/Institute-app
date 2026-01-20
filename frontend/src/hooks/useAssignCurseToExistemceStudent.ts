import { useMutation } from "@tanstack/react-query";
import { assignCourseToStudent, getStudent } from "@/lib/api";
import { setCurrentPage, setStudents, setTotal, setTotalPages } from "@/store/slices/studentSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

type AdmissionPayload = {
  token: string;
  studentId: string;
  courseId: string;
  admissionDate: string;
  feeAmount: string;
  paymentType: string;
};

export const useCourseToExistenceStudent = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector((state: RootState) => state.student.currentPage);
  const token = useSelector((state: RootState) => state.auth.token);
  const searchQuery = useSelector((state: RootState) => state.student.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.student);

  return useMutation({
    mutationFn: async (payload: AdmissionPayload) => {
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
      await assignCourseToStudent(token, formData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      console.log("✅ Admission Created Successfully");

      const response = await getStudent({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});
      
      dispatch(setStudents(response.data || []));
      dispatch(setTotalPages(response.totalPages || 1));
      dispatch(setCurrentPage(currentPage)); // reset page when search changes
      dispatch(setTotal(response.total || 0));
    },
    onError: (error) => {
      console.error("❌ Error Creating Admission:", error);
    },
  });
};
