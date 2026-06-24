// hooks/useCreateCourse.ts
import { createCourseAPI } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  // Safe token recovery fallback for SSR or edge scenarios
  const token = useSelector((state: RootState) => state.auth.token) ||
    (typeof window !== "undefined" ? sessionStorage.getItem("token") : null);

  return useMutation({
    mutationFn: async (newCourseData: any) => {
      console.log("GET COURSE DATA IN MUTATION on USECREATECOURSE:", newCourseData);

      if (!token) throw new Error("Missing Token for creating course");

      // Fire the API call
      return await createCourseAPI(token, newCourseData);
    },

    onSuccess: () => {
      console.log("Course created successfully, invalidating cache...");

      // ✅ Tell TanStack Query that the existing paginated and flat lists are obsolete.
      // This automatically forces any mounted tables or dropdowns to silently refetch.
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to create course";
      console.error("ERROR IN CREATING COURSE:", backendError);
    },
  });
};