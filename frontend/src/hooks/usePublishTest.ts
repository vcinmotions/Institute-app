import { createPublishTestAPI, getTest } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError, setTests } from "@/store/slices/testSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";

export const usePublishTest = () => {
    const dispatch = useDispatch();
    const { currentPage, searchQuery } = useSelector((state: RootState) => state.test);
    const token = useSelector((state: RootState) => state.auth.token);

    return useMutation({
        // Add the '?' right after id to mark it optional
        mutationFn: async (payload: { id?: number;[key: string]: any }) => {
            if (!token) throw new Error("Missing Token for authorization context.");

            dispatch(setLoading(true));
            await createPublishTestAPI(token, payload);
            return { token };
        },

        onSuccess: async ({ token }) => {
            // Refetch the data grid view so updated statuses reflect instantly
            const updated = await getTest({
                token,
                page: currentPage,
                limit: PAGE_SIZE,
                search: searchQuery
            });
            dispatch(setTests(updated.test));
        },

        onError: (error: any) => {
            const backendError = error?.response?.data?.error || "Failed to publish draft test";
            dispatch(setError(backendError));
            console.error("ERROR IN PUBLISHING TEST:", backendError);
        },
    });
};