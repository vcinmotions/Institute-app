// useQueryFetchEnquiry.ts
import { getStudent, getStudentById } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Define the type of your API response
interface StudentApiResponse {
  student: any[];
  total: number;
  birthday: any[]
  totalPages: number;
}

export interface UseFetchStudentParams {
  token: string | null;
  currentPage?: number;
  limit?: number;
  searchQuery?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | number | null>;
}
export interface UseFetchStudentByIdParams {
  token: string | null;
  studentId: string
}

export const useFetchStudent = ({
  token,
  currentPage,
  searchQuery,
  limit = 5,
  sortField,
  sortOrder,
  filters = {},
}: UseFetchStudentParams) => {
  return useQuery<StudentApiResponse, Error>({
    queryKey: ["student", limit, currentPage, searchQuery, sortField, sortOrder, filters,],

    queryFn: async ({ signal }) => {
      if (!token) throw new Error("Missing token");


      const data = await getStudent({
        token,
        page: currentPage,
        limit,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters,
      });
      console.log("STUDENT USE QUERY FETCHED:", data)

      if (!data) throw new Error("No data returned");

      return data;
    },
    enabled: !!token,
    staleTime: 30 * 1000,   // ⭐ caching (30s)
  });
};

export const useFetchStudentById = ({
  token,
  studentId
}: UseFetchStudentByIdParams) => {
  return useQuery<StudentApiResponse, Error>({
    queryKey: ["student", studentId],

    queryFn: async ({ signal }) => {
      if (!token) throw new Error("Missing token");


      const data = await getStudentById({
        token,
        studentId: studentId
      });
      console.log("STUDENT USE QUERY FETCHED:", data)

      if (!data) throw new Error("No data returned");

      return data;
    },
    enabled: !!token,
    staleTime: 30 * 1000,   // ⭐ caching (30s)
  });
};
