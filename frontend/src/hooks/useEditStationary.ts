import { editCourseAPI, editStationaryAPI, getCourse, getStationary } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setStationaries } from "@/store/slices/stationarySlice";

export const useEditStationary = () => {
  const dispatch = useDispatch();
  const { currentPage, sortField, searchQuery, sortOrder } = useSelector((state: RootState) => state.course); 
  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useEditCourse:", token);

  return useMutation({
    mutationFn: async ({ newStationary, id }: { newStationary: any; id: any }) => {
      console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newStationary, id);
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await editStationaryAPI(token, newStationary, id);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getStationary({ token, page: currentPage, limit: PAGE_SIZE, sortField, sortOrder, search: searchQuery });
      console.log(
        "get stationary List after create new stationary:",
        updated,
        updated.stationary,
      );

      // ✅ Only dispatch the array part
      dispatch(setStationaries(updated.stationary));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
    },
  });
};
