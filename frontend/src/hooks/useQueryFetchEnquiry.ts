// useQueryFetchPayment.ts
import { useQuery } from "@tanstack/react-query";
import { getEnquiry } from "@/lib/api";

export interface UseFetchEnquiryParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export const useFetchEnquiry = ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
}: UseFetchEnquiryParams) => {
  return useQuery({
    queryKey: ["enquiry", page, limit, search, sortField, sortOrder],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");
      const data = await getEnquiry({
        token,
        page,
        limit,
        search,
        sortField,
        sortOrder,
      });

      if (!data) throw new Error("No data returned");

      return data;
    },
    enabled: !!token,
  });
};

// hooks/useFetchCourse.ts
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

export const useFetchEnquiryById = (id: string) => {
  const token = sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["enquiry", id],
    queryFn: async ({ queryKey }) => {
      const [, enquiryId] = queryKey;

      if (!token) throw new Error("Missing token");

      const response = await apiClient.get(`/enquiry/${enquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!token && !!id,
  });
};
