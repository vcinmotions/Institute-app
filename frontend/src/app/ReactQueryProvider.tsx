import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Master-data auto-refresh: after ANY successful create/update/delete mutation
 * every query is marked stale and the ones on screen refetch. A record added in
 * a master form (lab, faculty, course, source, batch, ...) therefore shows up in
 * every dropdown and list immediately - no restart or page reload needed.
 * Deleted / deactivated records disappear the same way because the server's
 * list endpoints are the source of truth.
 */
const queryClient: QueryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
});

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
