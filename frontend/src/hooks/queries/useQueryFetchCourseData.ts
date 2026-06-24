// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { getCourse } from "@/lib/api";
import { apiClient } from "@/lib/apiClient";

export interface Installment {
  id: string | number;
  number: number;
  amount: string | number;
}

export interface CourseFeeStructure {
  id: string | number;
  paymentType: string[];
  totalAmount: string | number;
  installments?: Installment[];
}

export interface Course {
  id: string | number;
  name: string;
  durationMonths: string | number;
  description: string;
  courseFeeStructure?: CourseFeeStructure;
}

interface GetCourseResponse {
  message: string;
  course: Course[]; // Matches backend controller envelope key
  totalPages?: number;
  total?: number;
}

interface FetchCourseParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 1. Paginated Filter Hook
export const useFetchCourse = (params: FetchCourseParams) => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  return useQuery<GetCourseResponse>({
    queryKey: ["courses", params],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");
      return await getCourse({ token, ...params });
    },
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
};

// 2. Universally Available Hook for ANY Page
export const useFetchAllCourses = () => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  return useQuery<GetCourseResponse, Error>({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const res = await apiClient.get("/course/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // Returns: { message, course: [...] }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins so changing pages doesn't spam the API
  });
};