import { listItemsOptions } from "@/generated/backend-client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

export function useItems() {
	return useQuery({
		...listItemsOptions(),
	});
}
