import { createTestAPI, getTest } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLoading, setError } from "@/store/slices/testSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setTests } from "@/store/slices/testSlice";

export const useCreateTest = () => {
    const dispatch = useDispatch();
    const { currentPage, searchQuery } = useSelector((state: RootState) => state.test);
    const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
    console.log("get Token in useCreateCourse:", token);

    return useMutation({
        mutationFn: async (newTestData: any) => {
            console.log(
                "GET TEST DATA IN MUTATION on USECREATECOURSE:",
                newTestData,
            );
            if (!token) throw new Error("Missing Token for assign batch");

            dispatch(setLoading(true));

            await createTestAPI(token, newTestData);

            return { token };
        },

        onSuccess: async ({ token }) => {
            // ✅ Refetch updated list
            //const updated = await getEnquiry({ token, page: 1, limit: 5 });
            const updated = await getTest({ token, page: currentPage, limit: PAGE_SIZE, search: searchQuery });
            console.log(
                "get course List after create new course:",
                updated,
                updated.test,
            );

            // ✅ Only dispatch the array part
            dispatch(setTests(updated.test));
        },

        onError: (error: any) => {
            const backendError = error?.response?.data?.error || "Failed to assign batch";
            dispatch(setError(backendError));
            console.error("ERROR IN CREATEING TEST:", backendError)
        },
    });
};
