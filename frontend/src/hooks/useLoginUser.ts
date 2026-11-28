import { useMutation } from "@tanstack/react-query";
import { loginUser, selectCompany } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "@/store/slices/authSlice";
import { persistLogin, CompanyChoice } from "@/lib/session";

export type CompanyPrompt = {
  email: string;
  selectionToken: string;
  companies: CompanyChoice[];
};

/** Saves the session and opens the dashboard. */
function useCompleteLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  return (data: any) => {
    dispatch(setUser(data));
    dispatch(setToken(data.token));
    persistLogin(data);
    router.replace(data.role === "MASTER_ADMIN" ? "/master-dashboard" : "/dashboard");
  };
}

/**
 * Step 1 of sign-in. A user with one company goes straight in; a user with
 * several gets onNeedsCompany() and must pick one (step 2: useSelectCompany).
 */
export const useLoginUser = (opts?: { onNeedsCompany?: (p: CompanyPrompt) => void }) => {
  const complete = useCompleteLogin();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data, vars) => {
      if (data?.needsCompany) {
        opts?.onNeedsCompany?.({
          email: String(vars.email).trim().toLowerCase(),
          selectionToken: data.selectionToken,
          companies: data.companies,
        });
        return;
      }
      complete(data);
    },
    onError: (error: any) => {
      console.warn("Login error:", error?.message);
    },
  });
};

/** Step 2 of sign-in for users with several companies. */
export const useSelectCompany = () => {
  const complete = useCompleteLogin();
  return useMutation({
    mutationFn: selectCompany,
    onSuccess: (data) => complete(data),
  });
};
