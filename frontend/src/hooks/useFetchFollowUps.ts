// src/hooks/useFetchFollowUps.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser, getFollowUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export const useFetchFollowUps = () => {
  const route = useRouter();
  const dispatch = useDispatch();
  return useMutation({  
     mutationFn: async ({ token, id }: { token: string; id: string }) => {
      return await getFollowUp(token, id);
    },
    onSuccess: (data) => {
      console.log("FollowUps data Fetch successfully:", data);
      // You can invalidate queries or show toasts here

        //sessionStorage.setItem("token", data.token);

        //dispatch(setFollowUps(data));

        //   if(data) {
        //     route.push('/dashboard');
        //   }
    },
    onError: (error) => {
      console.error("Error Fetch FollowUps Data:", error);
    },
  });
};
