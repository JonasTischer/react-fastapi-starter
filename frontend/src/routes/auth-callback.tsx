import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import Spinner from "@/components/common/spinner";
import { getSafeRedirectPath } from "@/lib/auth";

interface AuthCallbackSearch {
	error?: string;
}

export const Route = createFileRoute("/auth-callback")({
	validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => ({
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	component: AuthCallbackPage,
});

/**
 * OAuth callback handler.
 *
 * After Google OAuth the backend redirects here with the token already set in
 * an HTTPOnly cookie. There's nothing to persist client-side — we just bounce
 * the user to wherever they were headed (or surface the error).
 */
function AuthCallbackPage() {
	const { error } = Route.useSearch();
	const router = useRouter();

	useEffect(() => {
		if (error) {
			router.navigate({ to: "/login", search: { error } });
			return;
		}

		// Success! Backend has already set the HTTPOnly cookie.
		const redirectTo = getSafeRedirectPath(
			sessionStorage.getItem("postAuthRedirect"),
		);
		sessionStorage.removeItem("postAuthRedirect");
		router.history.push(redirectTo);
	}, [error, router]);

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="text-center">
				<Spinner />
				<p className="mt-4 text-sm text-muted-foreground">
					Completing sign in...
				</p>
			</div>
		</div>
	);
}
