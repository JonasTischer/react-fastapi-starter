import { currentUserOptions } from "@/generated/backend-client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
	return useQuery({
		...currentUserOptions(),
		retry: false, // Don't retry auth requests - 401 is definitive
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes to avoid repeated checks
	});
}
