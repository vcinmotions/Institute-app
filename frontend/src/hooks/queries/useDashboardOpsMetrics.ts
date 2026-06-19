import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { apiClient } from "@/lib/apiClient";
import { getEnquiry } from "@/lib/api/enquiry";
import { getPayment } from "@/lib/api";

export const useDashboardOpsMetrics = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    const todayIsoStr = new Date().toISOString().split("T")[0];

    // 1. Fetch Today's Created Leads Array List
    const enquiryQuery = useQuery({
        queryKey: ["dashboard-metrics", "enquiries", todayIsoStr],
        queryFn: async () => {
            if (!token) throw new Error("Missing session authentication token");
            const res = await getEnquiry({ token, currentPage: 1, limit: 5, filters: { createDate: todayIsoStr } });
            return { total: res?.total || 0, list: res?.data || [] };
        },
        enabled: !!token,
        staleTime: 60 * 1000,
    });

    // 2. Fetch Pending Follow-Ups Array List
    const followUpQuery = useQuery({
        queryKey: ["dashboard-metrics", "followups-pending-list"],
        queryFn: async () => {
            if (!token) throw new Error("Missing session authentication token");
            // Target your operational endpoint list limit
            const response = await apiClient.get("/followup/pending", {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 5 }
            });
            return {
                total: response.data?.total || response.data?.count || response.data?.followup?.length || 0,
                list: response.data?.followup || response.data?.data || []
            };
        },
        enabled: !!token,
        staleTime: 60 * 1000,
    });

    // 3. Fetch Pending Admissions List (Won enquiries)
    const admissionQuery = useQuery({
        queryKey: ["dashboard-metrics", "admissions-pending"],
        queryFn: async () => {
            if (!token) throw new Error("Missing session authentication token");
            const response = await apiClient.get("/won-enquiry", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 5 },
            });
            return { total: response.data?.total || 0, list: response.data?.data || [] };
        },
        enabled: !!token,
        staleTime: 60 * 1000,
    });

    // 4. Fetch Pending Payments List
    const paymentQuery = useQuery({
        queryKey: ["dashboard-metrics", "payments-pending"],
        queryFn: async () => {
            if (!token) throw new Error("Missing session authentication token");
            const res = await getPayment({ token, page: 1, limit: 5, paymentStatus: "PENDING" });
            return { total: res?.total || 0, list: res?.data || [] };
        },
        enabled: !!token,
        staleTime: 60 * 1000,
    });

    return {
        metrics: {
            todayLeads: enquiryQuery.data?.total ?? 0,
            pendingFollowUps: followUpQuery.data?.total ?? 0,
            pendingAdmissions: admissionQuery.data?.total ?? 0,
            pendingPayments: paymentQuery.data?.total ?? 0,
        },
        lists: {
            todayLeads: enquiryQuery.data?.list ?? [],
            pendingFollowUps: followUpQuery.data?.list ?? [],
            pendingAdmissions: admissionQuery.data?.list ?? [],
            pendingPayments: paymentQuery.data?.list ?? [],
        },
        isLoading: enquiryQuery.isLoading || followUpQuery.isLoading || admissionQuery.isLoading || paymentQuery.isLoading,
    };
};