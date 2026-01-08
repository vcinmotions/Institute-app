
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setTenant,
  setToken,
  setUser,
  setLoading,
} from "@/store/slices/authSlice";

export const useCreateUser = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: createUser,
    // mutationFn: async () => {

    //       dispatch(setLoading(true));

    //       await createUser;

    //     },
    onSuccess: async (data) => {
      console.log("Login Successful:", data);

      // Save user + token to Redux
      dispatch(setUser(data));

      dispatch(setToken(data.token));

      dispatch(setToken(data.token));

      // ✅ PERSIST LOGIN (THIS IS THE KEY)
      window.localStorage.setItem("auth", JSON.stringify({
        token: data.token,
        email: data.email,
        role: data.role,
        userType: data.userType,
        dbUrl: data.dbUrl,
        loggedAt: Date.now(),
      }));

      console.log("Get User Data in Login and Saved in Redux:", data);

      // ✅ Role-based redirect logic
      if (data.role === "MASTER_ADMIN") {
        router.replace("/master-dashboard");
      } else {
        router.replace("/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Error logging in user:", error);
      console.log("error in login", error.message);
    },
  });
};
