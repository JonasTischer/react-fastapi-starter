import {
	authJwtLoginMutation,
	authJwtLogoutMutation,
	registerRegisterMutation,
} from "@/generated/backend-client/@tanstack/react-query.gen";
import { getSafeRedirectPath } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogin(redirectTo?: string | null) {
	// `redirectTo` is a free-form (but sanitized) path, so we navigate via the
	// history API rather than the type-checked `navigate({ to })`.
	const router = useRouter();
	return useMutation({
		...authJwtLoginMutation(),
		onSuccess: (_data) => {
			// No need to manually set token - backend sets HTTPOnly cookie automatically
			router.history.push(getSafeRedirectPath(redirectTo));
			toast.success("Logged in successfully!");
		},
		onError: (error) => {
			handleApiError(error, "Login failed");
		},
	});
}

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		...authJwtLogoutMutation(),
		onSuccess: () => {
			// No need to manually clear token - backend clears HTTPOnly cookie automatically
			queryClient.clear(); // Clear all cached data
			navigate({ to: "/login" });
		},
	});
}

export function useSignUp() {
	const login = useLogin();
	const navigate = useNavigate();
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
				navigate({ to: "/login" });
			}
		},
		onError: (error) => {
			handleApiError(error, "Sign up failed");
		},
	});
}
