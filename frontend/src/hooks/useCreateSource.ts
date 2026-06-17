import { createSourceAPI } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setError } from "@/store/slices/sourceSlice";

export const useCreateSource = () => {
  const dispatch = useDispatch();

  const token = useSelector(
    (state: RootState) => state.auth.token
  );

  return useMutation({
    mutationFn: async (newSource: any) => {
      if (!token) throw new Error("Missing token");

      return createSourceAPI(token, newSource);
    },

    onError: (error: any) => {
      dispatch(
        setError(
          error?.response?.data?.error ||
            "Failed to create source"
        )
      );
    },
  });
};