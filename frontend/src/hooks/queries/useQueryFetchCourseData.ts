// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface Course {
  id: string;
  name: string;
  durationWeeks: string;
  description: string;
}

interface GetCourseResponse {
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
  const token = sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const res = await apiClient.get("/course/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // returns full array
    },
    enabled: !!token,
  });
};
