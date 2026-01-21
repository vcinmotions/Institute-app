// useQueryFetchEnquiry.ts
import { useQuery } from "@tanstack/react-query";

// Define the type of your API response
interface EnquiryApiResponse {
  data: any[];
  total: number;
  totalPages: number;
}

export interface UseFetchEnquiryParams {
  token: string | null;
  currentPage?: number;
  limit?: number;
  searchQuery?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  leadStatus?: "HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null;
  filters?: Record<string, string | number | null>;
}

export const useFetchEnquiry = ({
  token,
  currentPage,
  searchQuery,
  limit = 5,
  sortField,
  sortOrder,
  leadStatus,
  filters = {},
}: UseFetchEnquiryParams) => {
  return useQuery<EnquiryApiResponse, Error>({
    queryKey: ["enquiry", limit, currentPage, searchQuery, sortField, sortOrder, leadStatus, filters,],

    queryFn: async ({ signal }) => {
      if (!token) throw new Error("Missing token");

      
      const data = await getEnquiry({
        token,
        page: currentPage,
        limit,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters,
      });
      console.log("ENQUIRY USE QUERY FETCHED:", data)

      if (!data) throw new Error("No data returned");

      return data;
    },
    enabled: !!token,
    staleTime: 30 * 1000,   // ⭐ caching (30s)
  });
};

// hooks/useFetchCourse.ts
import { apiClient } from "@/lib/apiClient";
import { getEnquiry } from "@/lib/api/enquiry";

export interface Enquiry {
  id: string;
  name: string;
  durationWeeks: string;
  description: string;
}

interface GetEnquiryResponse {
  enquiry: Enquiry[];
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
