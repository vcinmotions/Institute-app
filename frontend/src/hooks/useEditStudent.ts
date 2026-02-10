import { useMutation } from "@tanstack/react-query";
import { createAdmission, editStudent, getEnquiry, getWonEnquiry } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setStudents } from "@/store/slices/studentSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  setEnquiries,
} from "@/store/slices/enquirySlice";
import { setAdmissions, setCurrentPage, setError, setSearchQuery } from "@/store/slices/admissionSlice";
import { RootState } from "@/store";

type EditStudentPayload = {
  token: string;
  id: string;
  name: string;
  email?: string;
  contact: string;
  idProofType?: string;
  idProofNumber?: string;
  residentialAddress?: string;
  permenantAddress?: string;
  parentsContact?: string;
  fatherName: string;
  motherName?: string;
  dob: string;
  gender: string;
  religion?: string;
};

export const useEditStudent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const admissionCurrentPage = useSelector((state: RootState) => state.admission.currentPage);
  const enquiryCurrentPage = useSelector((state: RootState) => state.enquiry.currentPage);

  return useMutation({
    mutationFn: async (payload: EditStudentPayload) => {
      const { token, id, ...rest } = payload;

      console.log("🔥 Received Payload:", payload);
      console.log("Raw Jwt Token:", payload.token);

      const formData = new FormData();

      // ✅ Append all fields to FormData
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Debug
      console.log("📦 Constructed FormData:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(
            `${key}: File { name: ${val.name}, size: ${val.size}, type: ${val.type} }`,
          );
        } else {
          console.log(`${key}: ${val}`);
        }
      }

      // Call your backend API
      return await editStudent(token, formData, id);
    },

    // ✅ Make onSuccess async so you can await inside it
    onSuccess: async (data, variables) => {
      console.log("✅ Admission Created Successfully:", data);

      // Update students
      dispatch(setStudents(data.getAllStudent));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create enquiry";
      dispatch(setError(backend));
    },
  });
};
