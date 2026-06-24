import { editCourseAPI } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditCourse = () => {
  const queryClient = useQueryClient();
  // Safe token check for SSR/session scenarios
  const token = useSelector((state: RootState) => state.auth.token) ||
    (typeof window !== "undefined" ? sessionStorage.getItem("token") : null);

  return useMutation({
    mutationFn: async ({ newCourse, id }: { newCourse: any; id: any }) => {
      if (!token) throw new Error("Missing Token for edit course");
      return await editCourseAPI(token, newCourse, id);
    },

    onSuccess: () => {
      // ✅ Invalidate everything under the "courses" query key prefix.
      // This tells TanStack Query that the cached paginated lists are now stale.
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to create course";
      console.error("Mutation error:", backendError);
    },
  });
};