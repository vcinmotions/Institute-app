import { createCourseAPI, createEnquiryAPI, createStationaryAPI, getCourse, getStationary } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setStationaries, setLoading, setError } from "@/store/slices/stationarySlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";

export const useCreateStationary = () => {
  const dispatch = useDispatch();
  const { currentPage, sortField, searchQuery, sortOrder } = useSelector((state: RootState) => state.course); 
  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateStationary:", token);

  return useMutation({
    mutationFn: async (newStationaryData: any) => {
      console.log(
        "GET Stationary DATA IN MUTATION on useCreateStationary:",
        newStationaryData,
      );
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await createStationaryAPI(token, newStationaryData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getStationary({ token, page: currentPage, limit: PAGE_SIZE, sortField, sortOrder, search: searchQuery });
      console.log(
        "get stationary List after create new Stationary:",
        updated,
        updated.stationary,
      );

      // ✅ Only dispatch the array part
      dispatch(setStationaries(updated.stationary));
    },

    onError: (error: any) => {
      // const backendError = error?.response?.data?.error || "Failed to assign batch";
      // dispatch(setError(backendError));
      // console.error("ERROR IN CREATING STATIONAY ITEM", backendError);

      const backendError =
      error?.response?.data?.error || "Failed to assign batch";

      dispatch(setError(backendError));

      console.error("ERROR IN CREATING STATIONAY ITEM", backendError);

      // ✅ Auto clear after 3 seconds
      setTimeout(() => {
        dispatch(setError(null));
      }, 2000);
      },
  });
};
