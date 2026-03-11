import { editTaskAPI, editTestAPI, getTest } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setTests } from "@/store/slices/testSlice";

export const useEditTest = () => {
    const dispatch = useDispatch();
    const { currentPage, searchQuery, } = useSelector((state: RootState) => state.test);
    const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
    console.log("get Token in useEditCourse:", token);

    return useMutation({
        mutationFn: async ({ newTest, id }: { newTest: any; id: any }) => {
            console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newTest, id);
            if (!token) throw new Error("Missing Token for assign batch");

            dispatch(setLoading(true));

            await editTestAPI(token, newTest, id);

            return { token };
        },

        onSuccess: async ({ token }) => {
            // ✅ Refetch updated list
            //const updated = await getEnquiry({ token, page: 1, limit: 5 });
            const updated = await getTest({ token, page: currentPage, limit: PAGE_SIZE, search: searchQuery });
            console.log(
                "get task List after create new task:",
                updated,
                updated.test,
            );

            // ✅ Only dispatch the array part
            dispatch(setTests(updated.test));
        },

        onError: (error: any) => {
            const backendError = error?.response?.data?.error || "Failed to assign batch";
            dispatch(setError(backendError));
        },
    });
};
