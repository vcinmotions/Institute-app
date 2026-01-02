import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiClient } from '@/lib/apiClient';

// Define the expected type for the fetched data
interface UserData {
  id: string;
  status: string;
  message: string;
  // ✅ Add more fields as needed
}

// Custom Hook for fetching Follow-Up Data using React Query
export const useFetchUser = () => {
  //const token = useSelector((state: RootState) => state.auth.token);
  const token = sessionStorage.getItem("token");

  const {
    data: user, //array
    isLoading,
    isError,
    refetch,
  } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      if (!token) throw new Error('Missing Token in useQueryFetchUser');

      const response = await apiClient.get(`/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!token, // Only run if both exist
  });

  return {
    user,
    isLoading,
    isError,
    refetch,
  };
};
