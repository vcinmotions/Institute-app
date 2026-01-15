import { useMutation } from "@tanstack/react-query";
import { createCourse, getStudent } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setStudents } from "@/store/slices/studentSlice";
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


export const useCreateCourse = () => {
  const router = useRouter();
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
      await createCourse(token, formData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      console.log("✅ Admission Created Successfully");

      console.log("CUrrent page of student in Add course to student murtation:", currentPage);
      // router.push("/dashboard");

       const response = await getStudent({token, page: currentPage, search: searchQuery, sortField: sortField, sortOrder: sortOrder, ...filters});
      
              dispatch(setStudents(response.student || []));

      dispatch(setStudents(response.student))
    },
    onError: (error) => {
      console.error("❌ Error Creating Admission:", error);
    },
  });
};
