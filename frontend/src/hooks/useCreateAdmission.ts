import { useMutation } from "@tanstack/react-query";
import { createAdmission, getEnquiry, getWonEnquiry } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setStudents } from "@/store/slices/studentSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  setEnquiries,
} from "@/store/slices/enquirySlice";
import { setAdmissions, setCurrentPage, setSearchQuery } from "@/store/slices/admissionSlice";
import { RootState } from "@/store";

type AdmissionPayload = {
  token: string;
  id: string;
  name: string;
  email?: string;
  contact: string;
  idProofType?: string;
  idProofNumber?: string;
  admissionDate: string;
  courseData: any[];
  residentialAddress?: string;
  permenantAddress?: string;
  parentsContact?: string;
  fatherName: string;
  motherName?: string;
  dob: string;
  gender: string;
  religion?: string;
  profilePicture?: File | null;
};

export const useCreateAdmission = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const admissionCurrentPage = useSelector((state: RootState) => state.admission.currentPage);
  const enquiryCurrentPage = useSelector((state: RootState) => state.enquiry.currentPage);

  return useMutation({
    mutationFn: async (payload: AdmissionPayload) => {
      const { token, profilePicture, courseData, ...rest } = payload;

      console.log("🔥 Received Payload:", payload);
      console.log("Raw Jwt Token:", payload.token);

      const formData = new FormData();

      // ✅ Append all fields to FormData
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // ✅ Append profile picture if available
      // if (profilePicture) {
      //   formData.append("profilePicture", profilePicture);
      // }

      // Append file only if it exists
      if (payload.profilePicture) {
        formData.append("profilePicture", payload.profilePicture); // <--- actual File object
      }
      if (payload.courseData) {
        // 🔑 Stringify courseData array
        formData.append("courseData", JSON.stringify(payload.courseData));
      }

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
      return await createAdmission(token, formData);
    },

    // ✅ Make onSuccess async so you can await inside it
    onSuccess: async (data, variables) => {
      console.log("✅ Admission Created Successfully:", data);

      // Update students
      dispatch(setStudents(data.getAllStudent));

      // Refetch updated enquiries
      const updatedWonEnquiry = await getWonEnquiry({
        token: variables.token,
        page: admissionCurrentPage,
        limit: 5,
        sortField: "createdAt",
      });

      console.log("📋 Updated Enquiries After New Admission:", updatedWonEnquiry);

      dispatch(setAdmissions(updatedWonEnquiry.data));
      dispatch(setSearchQuery(""));
    },

    onError: (error) => {
      console.error("❌ Error Creating Admission:", error);
    },
  });
};
