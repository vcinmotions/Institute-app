import { useMutation } from "@tanstack/react-query";
import { createCourse } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setStudents } from "@/store/slices/studentSlice";
import { useDispatch } from "react-redux";

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
      return await createCourse(token, formData);
    },

    onSuccess: (data) => {
      console.log("✅ Admission Created Successfully:", data);
      // router.push("/dashboard");
      dispatch(setStudents(data.getStudents))
    },
    onError: (error) => {
      console.error("❌ Error Creating Admission:", error);
    },
  });
};
