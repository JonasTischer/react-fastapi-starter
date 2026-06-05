import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * 60 * 1000, // 30 minutes
			retry: (failureCount, error: unknown) => {
				// Don't retry on authentication errors - let the HTTP client interceptor handle it
				if (error instanceof Error && error.message.includes("401"))
					return false;

				// Standard retry logic for other errors
				return failureCount < 3;
			},
		},
	},
});

interface QueryProviderProps {
	children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.DEV && <ReactQueryDevtools />}
		</QueryClientProvider>
	);
};
