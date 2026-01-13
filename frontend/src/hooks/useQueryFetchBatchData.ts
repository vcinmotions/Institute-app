// hooks/useFetchCourse.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

type FetchBatchesOptions = {
  onlyAvailable?: boolean; // optional flag
};

export const useFetchAllBatches = ({ onlyAvailable = false }: FetchBatchesOptions = {}) => {
  const token = sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["all-batches", onlyAvailable],
    queryFn: async () => {
       // Construct URL dynamically
      const url = `/batch/all/${onlyAvailable}`; // path param instead of query param

      console.log("get req query for fetch batches:", onlyAvailable)
      const res = await apiClient.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // const res = await apiClient.get("/batch/all", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      console.log("GET ALL BATCHE DATA IN QUERY:", res.data);
      return res.data; // returns full array
    },
    enabled: !!token,
  });
};  

// hooks/useFetchCourse.ts
// import { useQuery } from "@tanstack/react-query";
// import { apiClient } from "@/lib/apiClient";

// export const useFetchAllBatches = ({ onlyAvailable = false }: FetchBatchesOptions = {}) => {
//   const token = sessionStorage.getItem("token");

//   return useQuery({
//     queryKey: ["all-batches"],
//     queryFn: async () => {
//       const res = await apiClient.get("/batch/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("GET ALL BATCHE DATA IN QUERY:", res.data);
//       return res.data; // returns full array
//     },
//     enabled: !!token,
//   });
// };  