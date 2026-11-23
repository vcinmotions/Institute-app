import { serverLogout } from "@/lib/session";
// export const forceLogout = () => {
//   if (typeof window !== "undefined") {
//     sessionStorage.removeItem("token");
//     //console.log("TOKEN REMOVED ON DOUBLE SIGN UP:");
//     window.location.replace("/signin");
//   }
// };

export const forceLogout = () => {
  if (typeof window !== "undefined") {
    serverLogout(); // free the seat on the server before the token is dropped
    sessionStorage.removeItem("token");

    window.localStorage.clear();

    setTimeout(() => {
      window.location.replace("/signin");
    }, 10); // small delay fixes timing
  }
};
