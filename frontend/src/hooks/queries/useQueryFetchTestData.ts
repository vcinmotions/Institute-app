// D:\SHOBHA\vcinmotions-application-ai\frontend\src\hooks\queries\useQueryFetchTestData.ts

import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

// Helper function to extract headers
const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

interface FetchTestsParams {
    page: number;
    limit: number;
    search?: string;
}

// 1. Hook to fetch paginated/filtered list of tests
export function useFetchAllTests({ page, limit, search }: FetchTestsParams) {
    return useQuery({
        queryKey: ["tests", page, limit, search],
        queryFn: async () => {
            // REMOVED /api prefix here -> changed "/api/test" to "/test"
            const response = await apiClient.get("/test", {
                params: { page, limit, search },
                ...getAuthHeaders(),
            });
            return response.data;
        },
        placeholderData: (previousData) => previousData,
    });
}

// 2. Hook to fetch a single test entity object via ID context
export function useFetchTestById(id: string | null) {
    return useQuery({
        queryKey: ["test", id],
        queryFn: async () => {
            if (!id) return null;
            // REMOVED /api prefix here -> changed `/api/test/${id}` to `/test/${id}`
            const response = await apiClient.get(`/test/${id}`, getAuthHeaders());
            return response.data.test;
        },
        enabled: !!id,
    });
}