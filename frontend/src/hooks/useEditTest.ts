import { editTestAPI, publishTestAPI, getTest } from "@/lib/api"; // 🔧 Imported here
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setTests } from "@/store/slices/testSlice";

export const useEditTest = () => {
    const dispatch = useDispatch();
    const { currentPage, searchQuery } = useSelector((state: RootState) => state.test);
    const token = useSelector((state: RootState) => state.auth.token);

    return useMutation({
        mutationFn: async ({ newTest, id, action }: { newTest: any; id: any; action: "DRAFT" | "PUBLISH" }) => {
            if (!token) throw new Error("Missing Token Context");

            dispatch(setLoading(true));
            let responseData;

            if (action === "PUBLISH") {
                // ✅ Calls your clean, isolated publish function mirroring edit API style
                responseData = await publishTestAPI(token, newTest);
            } else {
                // ✅ Calls your standard edit draft function
                responseData = await editTestAPI(token, newTest, id);
            }

            return { token, responseData };
        },

        onSuccess: async ({ token }) => {
            const updated = await getTest({ token, page: currentPage, limit: PAGE_SIZE, search: searchQuery });
            dispatch(setTests(updated.test));
        },

        onError: (error: any) => {
            const backendError = error?.response?.data?.error || "Failed to alter test configuration schema context.";
            dispatch(setError(backendError));
        },
    });
};