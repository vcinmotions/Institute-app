import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiClient } from '@/lib/apiClient';

// Define the expected type for the fetched data
interface FollowUpData {
  id: string;
  status: string;
  message: string;
  // ✅ Add more fields as needed
}

// Custom Hook for fetching Follow-Up Data using React Query
export const useFollowUp = (enquiryId: string | null) => {
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    data: followupDetails = [], //array
    isLoading,
    isError,
    refetch,
  } = useQuery<FollowUpData>({
    queryKey: ['followup', enquiryId],
    queryFn: async () => {
      if (!enquiryId || !token) throw new Error('Missing enquiry ID or token');

      const response = await apiClient.get(`/followup/${enquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!enquiryId && !!token, // Only run if both exist
  });

  return {
    followupDetails,
    isLoading,
    isError,
    refetch,
  };
};
