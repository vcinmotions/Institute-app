import { useQuery } from "@tanstack/react-query";
import { getWonEnquiry, getCourse, getBatch } from "@/lib/api";
import { PAGE_SIZE } from "@/constants/pagination";

interface FetchAdmissionsParams {
    page: number;
    search: string;
    sortField: string;
    sortOrder: "asc" | "desc";
    leadStatus: "HOT" | "WARM" | "COLD" | null;
}

const getValidToken = () => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("token");
};

// Hook for Paginated Admission Data
export const useFetchWonAdmissions = (params: FetchAdmissionsParams) => {
    const token = getValidToken();

    return useQuery({
        // The query automatically refetches whenever any element in this key tuple changes
        queryKey: ["won-admissions", params.page, params.search, params.sortField, params.sortOrder, params.leadStatus],
        queryFn: async () => {
            if (!token) throw new Error("Authentication token missing");
            return await getWonEnquiry({
                token,
                page: params.page,
                limit: PAGE_SIZE,
                search: params.search,
                sortField: params.sortField,
                sortOrder: params.sortOrder,
                leadStatus: params.leadStatus,
            });
        },
        enabled: !!token,
        placeholderData: (previousData) => previousData, // Keeps old data visible while fetching next page (prevents UI flickering)
        staleTime: 1000 * 60 * 2, // 2 Minutes client cache validation
    });
};

// Hook for Metadata (Courses and Batches)
export const useFetchAdmissionMetadata = () => {
    const token = getValidToken();

    return useQuery({
        queryKey: ["admission-metadata"],
        queryFn: async () => {
            if (!token) throw new Error("Authentication token missing");

            const [courseRes, batchRes] = await Promise.all([
                getCourse({ token }),
                getBatch({ token }),
            ]);

            return {
                courses: courseRes?.course || [],
                batches: batchRes?.batch || [],
            };
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 15, // Meta properties rarely update; cache for 15 mins
    });
};