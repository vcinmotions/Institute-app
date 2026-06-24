// hooks/useFetchBatch.ts
import { useQuery } from '@tanstack/react-query';
import { getBatch } from '@/lib/api';

interface FetchBatchParams {
    page: number;
    limit: number;
    search: string;
}

export const useFetchBatch = (params: FetchBatchParams) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    return useQuery({
        // Keep parameters inside the cache key so caching remains context-aware
        queryKey: ['batches', params],
        queryFn: async () => {
            if (!token) throw new Error("Token missing from sessionStorage");
            return await getBatch({ token, ...params });
        },
        enabled: !!token,
        placeholderData: (previousData) => previousData, // Seamless transitions while picking new pages
    });
};