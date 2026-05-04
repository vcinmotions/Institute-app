import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  qualification?: string;
  dob: string;
  gender: string;
  religion?: string;
};

export const useEditStudent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentPage = useSelector((state: RootState) => state.student.currentPage);
  const searchQuery = useSelector((state: RootState) => state.student.searchQuery);
  const {
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.student);
  const admissionCurrentPage = useSelector((state: RootState) => state.admission.currentPage);
  const enquiryCurrentPage = useSelector((state: RootState) => state.enquiry.currentPage);

  return useMutation({
    mutationFn: async (payload: EditStudentPayload) => {
      const { token, id, ...rest } = payload;
      
      if (!token) throw new Error("Missing Token for edit student");

      console.log("EDIT STUDENT PAYLOAD WITH NORMALIZATION", payload);

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

      await editStudent(token, formData, id);

      // Return token for use in onSuccess
      return { token };
    },

    onSuccess: async ({ token }) => {
      // Refetch latest students (keeps current page and search automatically)
      queryClient.invalidateQueries({
        queryKey: ["student"],
        exact: false,
      });

      console.log("INVALIDATEQUERIES TRIGGERED IN EDIT STUDENT!");
      console.log("MUTATION SUCCESSFUL");
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to create enquiry";
      dispatch(setError(backend));
    },
  });
};
