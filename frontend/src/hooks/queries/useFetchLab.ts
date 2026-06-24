// hooks/useFetchLab.ts
import { useQuery } from '@tanstack/react-query';
import { getLab } from '@/lib/api';

interface FetchLabParams {
    page: number;
    limit: number;
    search: string;
}

export const useFetchLab = (params: FetchLabParams) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    return useQuery({
        // Unique cache key for labs, tracking param changes context-aware
        queryKey: ['labs', params],
        queryFn: async () => {
            if (!token) throw new Error("Token missing from sessionStorage");
            return await getLab({ token, ...params });
        },
        enabled: !!token,
        placeholderData: (previousData) => previousData, // Smooth transitions during pagination
    });
};