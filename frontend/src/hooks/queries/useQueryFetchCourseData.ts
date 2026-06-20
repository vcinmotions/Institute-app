// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface Course {
  id: string;
  name: string;
  durationMonths: string;
  description: string;
}

interface GetCourseResponse {
  message: string;
  course: Course[];
}

export const useFetchCourse = () => {
  const token = sessionStorage.getItem("token");

  return useQuery<GetCourseResponse>({
    queryKey: ["course"],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");

      const response = await apiClient.get("/course", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!token,
  });
};

export const useFetchAllCourses = () => {
  // Safe validation check for Server-Side Rendering (SSR) environments
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  return useQuery<GetCourseResponse, Error, Course[]>({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const res = await apiClient.get("/course/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    // ✅ Extract the flat course array out of the response envelope automatically
    select: (data) => data.course || [],
    enabled: !!token,
  });
};
