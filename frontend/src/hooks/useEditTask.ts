import { editCourseAPI, editStationaryAPI, editTaskAPI, getCourse, getStationary, getTask } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setStationaries } from "@/store/slices/stationarySlice";
import { setTasks } from "@/store/slices/taskSlice";

export const useEditTask = () => {
  const dispatch = useDispatch();
  const { currentPage, sortField, searchQuery, sortOrder } = useSelector((state: RootState) => state.course); 
  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useEditCourse:", token);

  return useMutation({
    mutationFn: async ({ newTask, id }: { newTask: any; id: any }) => {
      console.log("GET FACULT BATCH ASSIGNED DATA IN MUTATION:", newTask, id);
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await editTaskAPI(token, newTask, id);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getTask({ token, page: currentPage, limit: PAGE_SIZE, sortField, sortOrder, search: searchQuery });
      console.log(
        "get task List after create new task:",
        updated,
        updated.task,
      );

      // ✅ Only dispatch the array part
      dispatch(setTasks(updated.task));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
    },
  });
};
