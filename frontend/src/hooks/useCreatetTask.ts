import { createCourseAPI, createEnquiryAPI, createTaskAPI, getCourse, getTask } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCourses, setLoading, setError } from "@/store/slices/courseSlice";
import { useMutation } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/constants/pagination";
import { setTasks } from "@/store/slices/taskSlice";

export const useCreateTask = () => {
  const dispatch = useDispatch();
  const { currentPage, searchQuery } = useSelector((state: RootState) => state.stationary); 
  const token = useSelector((state: RootState) => state.auth.token); // ✅ From Redux
  console.log("get Token in useCreateCourse:", token);

  return useMutation({
    mutationFn: async (newTaskData: any) => {
      console.log(
        "GET COURSE DATA IN MUTATION on USECREATECOURSE:",
        newTaskData,
      );
      if (!token) throw new Error("Missing Token for assign batch");

      dispatch(setLoading(true));

      await createTaskAPI(token, newTaskData);

      return { token };
    },

    onSuccess: async ({ token }) => {
      // ✅ Refetch updated list
      //const updated = await getEnquiry({ token, page: 1, limit: 5 });
      const updated = await getTask({ token, page: currentPage, limit: PAGE_SIZE, search: searchQuery });
      console.log(
        "get course List after create new course:",
        updated,
        updated.task,
      );

      // ✅ Only dispatch the array part
      dispatch(setTasks(updated.task));
    },

    onError: (error: any) => {
      const backendError = error?.response?.data?.error || "Failed to assign batch";
      dispatch(setError(backendError));
      console.error("ERROR IN CREATEING TASK:", backendError)
    },
  });
};
