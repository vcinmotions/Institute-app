import { apiClient } from "@/lib/apiClient";
import { RootState } from "@/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";

export const useGetAdmissionConfig = () => {
    //const token = useSelector((state: RootState) => state.auth.token);
    const token = sessionStorage.getItem("token");

    return useQuery({
        queryKey: ["admission-config"],
        queryFn: async () => {

            if (!token) throw new Error("Missing token");

            const res = await apiClient.get("/admission-config", {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        },
        enabled: !!token,
    });
};

export const useUpdateAdmissionConfig = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    return useMutation({
        mutationFn: async (data: any) => {

            const res = await apiClient.post("/admission-config", data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        },
    });
};