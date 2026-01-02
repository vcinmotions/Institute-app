import { useMutation } from "@tanstack/react-query";
import { getFacultyBatches } from "@/lib/api";

type GetFacultyBatchParams = {
  token: string;
  facultyId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  leadStatus?: string;
};

export const useFetchFacultyBatches = () => {
  return useMutation({
    mutationFn: async (params: GetFacultyBatchParams) => {
      console.log("📦 Fetching Faculty Batches Params:", params);

      const {
        token,
        facultyId,
        page = 1,
        limit = 5,
        search = "",
        sortField,
        sortOrder,
        leadStatus,
      } = params;

      // ✅ Call API properly
      const data = await getFacultyBatches(
        { token, page, limit, search, sortField, sortOrder },
        facultyId
      );

      console.log("✅ Faculty batches fetched successfully:", data);
      return data;
    },

    onSuccess: (data) => {
      console.log("🎉 Faculty Batches Fetched Successfully:", data);
    },

    onError: (error: any) => {
      console.error("❌ Error fetching faculty batches:", error.message);
    },
  });
};
