import { useMutation } from "@tanstack/react-query";
import { getStudentCourse } from "@/lib/api";

type GetStudentParams = {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc"; // ✅ Strict union
};

export const useFetchStudentCourse = () => {
  return useMutation({
    // Accept the whole object
    mutationFn: async (params: GetStudentParams) => {
        console.log("get All Params:", params);
      return await getStudentCourse(params); // ✅ Now you're passing the full object
    },
    onSuccess: (data) => {
      console.log("StudentCourse data fetched successfully:", data);
      // You can dispatch to Redux or navigate if needed
    },
    onError: (error) => {
      console.error("Error fetching StudentCourse data:", error);
    },
  });
};
