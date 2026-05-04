import { apiClient } from "@/lib/apiClient";
import { RootState } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export const useCreateAdvancePayment = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    
    return useMutation({
        mutationFn: async (advancePayments: any[]) => {
            if (!token) throw new Error("Missing token");

            const res = await apiClient.post("/advance-payment", { advancePayments }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        },
    });
};
