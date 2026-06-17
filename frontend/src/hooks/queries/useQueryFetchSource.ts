// hooks/useFetchCourse.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Source {
  id: number;
  name: string;
  slug: string;
}

export interface GetSourceResponse {
  message: string;
  source: Source[];
  totalPages: number;
  totalCount: number;
  page: number;
  limit: number;
}

export const useFetchSource = () => {
  const token = sessionStorage.getItem("token");

  return useQuery<GetSourceResponse>({
    queryKey: ['source'],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");

      const response = await apiClient.get('/source', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("GET SOURCE DATA IN QUERY:", response);

      return response.data;
    },
    enabled: !!token,
  });
};
