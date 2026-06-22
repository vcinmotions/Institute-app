import { useQuery } from "@tanstack/react-query";
import { getPayment } from "@/lib/api";
import { PAGE_SIZE } from "@/constants/pagination";

interface UsePaymentsProps {
  currentPage: number;
  searchQuery: string;
  sortField: string;
  sortOrder: "asc" | "desc";
  filters: Record<string, string | null>;
}

export function useFetchPayment({
  currentPage,
  searchQuery,
  sortField,
  sortOrder,
  filters,
}: UsePaymentsProps) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  return useQuery({
    // The query key acts as a dependency array for your network requests
    queryKey: ["payments", { currentPage, searchQuery, sortField, sortOrder, filters }],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token missing from sessionStorage");
      }
      return getPayment({
        token,
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters,
      });
    },
    // Prevent query running if there's no auth token available
    enabled: !!token,
    // Optional: Keeps previous data on screen while fetching new pages (prevents flickering)
    placeholderData: (previousData) => previousData,
  });
}