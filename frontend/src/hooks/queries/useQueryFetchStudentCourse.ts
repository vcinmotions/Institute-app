import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

interface FetchStudentCourseParams {
    page: number;
    limit: number;
    search?: string;
    sortField?: string | null;
    sortOrder?: "asc" | "desc" | null;
    filters?: Record<string, any>;
}

export function useFetchStudentCourses({
    page,
    limit,
    search,
    sortField,
    sortOrder,
    filters,
}: FetchStudentCourseParams) {
    return useQuery({
        queryKey: ["studentCourses", page, limit, search, sortField, sortOrder, filters],
        queryFn: async () => {
            const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
            if (!token) throw new Error("Missing Token Context");

            const response = await apiClient.get("/student-course", {
                params: {
                    page,
                    limit,
                    search,
                    sortField,
                    sortOrder,
                    ...filters,
                },
                ...getAuthHeaders(),
            });
            return response.data; // contains data, detailedCourses, totalPages, total
        },
        placeholderData: (previousData) => previousData,
    });
}