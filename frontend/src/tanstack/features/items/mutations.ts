import {
	createItemMutation,
	deleteItemMutation,
	listItemsQueryKey,
} from "@/generated/backend-client/@tanstack/react-query.gen";
import { handleApiError } from "@/utils/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateItem() {
	const queryClient = useQueryClient();
	return useMutation({
		...createItemMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: listItemsQueryKey() });
			toast.success("Item created");
		},
		onError: (error) => handleApiError(error, "Failed to create item"),
	});
}

export function useDeleteItem() {
	const queryClient = useQueryClient();
	return useMutation({
		...deleteItemMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: listItemsQueryKey() });
			toast.success("Item deleted");
		},
		onError: (error) => handleApiError(error, "Failed to delete item"),
	});
}
