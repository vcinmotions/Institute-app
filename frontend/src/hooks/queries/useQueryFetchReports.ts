"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface ReportApiResponse {
    message: string;
    data: any[];
}

export interface UseFetchReportsParams {
    token: string | null;
    reportType: "ENQUIRIES" | "FINANCE" | "STUDENTS";
    startDate?: string;
    endDate?: string;
    sourceId?: string;
    courseId?: string;
    batchId?: string;
    financeStatus?: "ALL" | "PAID" | "OUTSTANDING";
}

export const useFetchReports = ({
    token,
    reportType,
    startDate,
    endDate,
    sourceId,
    courseId,
    batchId,
    financeStatus,
}: UseFetchReportsParams) => {
    return useQuery<ReportApiResponse, Error>({
        // Included all filters in the queryKey to guarantee automatic refetching on filter change
        queryKey: ["reports", reportType, startDate, endDate, sourceId, courseId, batchId, financeStatus],

        queryFn: async ({ signal }) => {
            if (!token) throw new Error("Missing token");

            const params = new URLSearchParams({ reportType });
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (sourceId) params.append("sourceId", sourceId);
            if (courseId) params.append("courseId", courseId);
            if (batchId) params.append("batchId", batchId);
            if (financeStatus) params.append("financeStatus", financeStatus);

            const response = await apiClient.get(`/reports/data?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal,
            });

            if (!response.data) throw new Error("No data returned");

            return response.data;
        },
        enabled: !!token && !!reportType,
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });
};