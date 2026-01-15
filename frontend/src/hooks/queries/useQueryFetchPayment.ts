// useQueryFetchPayment.ts
import { useQuery } from '@tanstack/react-query';
import { getPayment } from '@/lib/api';

export interface UseFetchPaymentParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useFetchPayment = ({
  token,
  page = 1,
  limit = 5,
  search = '',
  sortField,
  sortOrder,
}: UseFetchPaymentParams) => {
  return useQuery({
    queryKey: ['payment', page, limit, search, sortField, sortOrder],
    queryFn: async () => {
      if (!token) throw new Error('Missing token');
      const data = await getPayment({
        token,
        page,
        limit,
        search,
        sortField,
        sortOrder,
      });

      if (!data) throw new Error('No data returned');

      return data;
    },
    enabled: !!token,
  });
};
