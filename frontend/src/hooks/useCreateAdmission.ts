import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdmission } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setStudents } from "@/store/slices/studentSlice";
import { setError, setSearchQuery } from "@/store/slices/admissionSlice";

type AdmissionPayload = {
  token: string;
  id: string;
  name: string;
  email?: string;
  contact: string;
  idProofType?: string;
  idProofNumber?: string;
  localAddressProofType: string;
  localAddressProofNumber: string;
  idCard: boolean;
  bag: boolean;
  referedBy: string,
  admissionDate: string;
  courseData: any[];
  advancePayments: any[];
  residentialAddress?: string;
  permenantAddress?: string;
  parentsContact?: string;
  fatherName: string;
  qualification?: string;
  dob: string;
  gender: string;
  religion?: string;
  profilePicture?: File | null;
};

export const useCreateAdmission = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdmissionPayload) => {
      const { token, profilePicture, advancePayments, courseData, ...rest } = payload;

      console.log("🔥 Received Payload inside Mutation:", payload);

      const formData = new FormData();

      // ✅ Append flat fields to FormData
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // ✅ Append files safely
      if (payload.profilePicture) {
        formData.append("profilePicture", payload.profilePicture);
      }

      // ✅ Stringify nested structural collections cleanly
      if (payload.courseData) {
        formData.append("courseData", JSON.stringify(payload.courseData));
      }
      if (payload.advancePayments) {
        formData.append("advancePayments", JSON.stringify(payload.advancePayments));
      }

      // Call your backend multipart API handler
      return await createAdmission(token, formData);
    },

    onSuccess: async () => {
      console.log("INVALIDATEQUERIES TRIGGERED IN ADMISSIONS!");

      // ✅ 1. Invalidate using the target namespace matching "useFetchWonAdmissions"
      // This tells TanStack Query to immediately trigger a background refetch for the table grid.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["won-admissions"] }),
        queryClient.invalidateQueries({ queryKey: ["enquiry"] }) // Invalidates the master enquiries view too since a lead was converted
      ]);

      // ✅ 2. Reset local filter fields cleanly 
      dispatch(setSearchQuery(""));
      dispatch(setError(null));
    },

    onError: (error: any) => {
      const backend = error?.response?.data?.error || "Failed to finalize admission file";
      dispatch(setError(backend));
    },
  });
};