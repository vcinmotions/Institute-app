// hooks/useFetchCourse.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Faculty {
  id: string;
  name: string;
  durationWeeks: string;
  description: string;
}

interface GetFacultyResponse {
  faculty: Faculty[];
}

export const useFetchFaculty = () => {
  const token = sessionStorage.getItem("token");

  return useQuery<GetFacultyResponse>({
    queryKey: ['faculty'],
    queryFn: async () => {
      if (!token) throw new Error("Missing token");

      const response = await apiClient.get('/faculty', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!token,
  });
};
