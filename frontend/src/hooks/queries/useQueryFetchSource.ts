// hooks/useFetchSource.ts
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

export interface GetAllSourceResponse {
  message: string;
  source: Source[];
}

export const useFetchSource = (params: any = {}) => {
  return useQuery<GetSourceResponse>({
    queryKey: ['source', params],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      if (!token) throw new Error("Missing token");

      const response = await apiClient.get('/source', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" ? !!sessionStorage.getItem("token") : false,
  });
};

export const useFetchAllSource = () => {
  return useQuery<GetAllSourceResponse>({
    queryKey: ['all-source'],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      if (!token) throw new Error("Missing token");

      const response = await apiClient.get('/source/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" ? !!sessionStorage.getItem("token") : false,
    staleTime: 5 * 60 * 1000, // Cache metadata for 5 mins
  });
};