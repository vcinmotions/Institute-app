// src/hooks/useDeleteEnquiry.ts
import { useMutation } from "@tanstack/react-query";
import { deletedEnquiry, getEnquiry } from "@/lib/api";
import { useDispatch } from "react-redux";
import { setEnquiries } from "@/store/slices/enquirySlice";

export const useDeleteEnquiry = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: string }) => {
      return await deletedEnquiry(token, id);
    },
    onSuccess: async (_data, { token }) => {
      //const updatedList = await getEnquiry(token);
      const updatedList = await getEnquiry({ token, page: 1, limit: 5, sortField: "createdAt" });
      console.log("get new Enquiry data in Delete mutation:", updatedList.enquiry)

      dispatch(setEnquiries(updatedList.enquiry));
    },
    onError: (error) => {
      console.error("Error Enquiry Delete :", error);
    },
  });
};