import {
	authJwtLoginMutation,
	authJwtLogoutMutation,
	registerRegisterMutation,
} from "@/generated/backend-client/@tanstack/react-query.gen";
import { getSafeRedirectPath } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogin(redirectTo?: string | null) {
	const router = useRouter();
	return useMutation({
		...authJwtLoginMutation(),
		onSuccess: (_data) => {
			// No need to manually set token - backend sets HTTPOnly cookie automatically
			router.push(getSafeRedirectPath(redirectTo));
			toast.success("Logged in successfully!");
		},
		onError: (error) => {
			handleApiError(error, "Login failed");
		},
	});
}

export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		...authJwtLogoutMutation(),
		onSuccess: () => {
			// No need to manually clear token - backend clears HTTPOnly cookie automatically
			queryClient.clear(); // Clear all cached data
			router.push("/");
		},
	});
}

export function useSignUp() {
	const login = useLogin();
	const router = useRouter();
	return useMutation({
		...registerRegisterMutation(),
		onSuccess: (
			_data,
			variables: { body: { email: string; password: string } },
		) => {
			toast.success("Account created successfully!");
			if (variables?.body?.email && variables?.body?.password) {
				// Auto-login after successful registration
				// Backend will set HTTPOnly cookie on successful login
				login.mutate({
					body: {
						username: variables.body.email,
						password: variables.body.password,
					},
				});
			} else {
				toast.error(
					"Account created, but auto-login failed. Please log in manually.",
				);
				router.push("/login");
			}
		},
		onError: (error) => {
			handleApiError(error, "Sign up failed");
		},
	});
}
