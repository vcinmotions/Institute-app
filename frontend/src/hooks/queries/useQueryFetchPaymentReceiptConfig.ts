import { apiClient } from "@/lib/apiClient";
import { RootState } from "@/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";

export const useGetPaymentReceiptConfig = () => {
    //const token = useSelector((state: RootState) => state.auth.token);
    const token = sessionStorage.getItem("token");

    return useQuery({
        queryKey: ["payment-receipt-config"],
        queryFn: async () => {

            if (!token) throw new Error("Missing token");

            const res = await apiClient.get("/payment-receipt-config", {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        },
        enabled: !!token,
    });
};

export const useUpdatePaymentReceiptConfig = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    return useMutation({
        mutationFn: async (data: any) => {

            const res = await apiClient.post("/payment-receipt-config", data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        },
    });
};
