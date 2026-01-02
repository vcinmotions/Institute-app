// export const forceLogout = () => {
//   if (typeof window !== "undefined") {
//     sessionStorage.removeItem("token");
//     //console.log("TOKEN REMOVED ON DOUBLE SIGN UP:");
//     window.location.replace("/signin");
//   }
// };

export const forceLogout = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("token");

    window.localStorage.clear();

    setTimeout(() => {
      window.location.replace("/signin");
    }, 10); // small delay fixes timing
  }
};
