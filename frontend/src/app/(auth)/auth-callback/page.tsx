"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/common/spinner";
import { getSafeRedirectPath } from "@/lib/auth";

/**
 * OAuth callback handler
 *
 * After Google OAuth authentication, the backend redirects here with the token in a cookie.
 * We just need to redirect to the dashboard - the cookie is already set by the backend.
 */
function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check if there was an error
		const error = searchParams.get("error");

		if (error) {
			// Redirect to login with error message
			router.push(`/login?error=${encodeURIComponent(error)}`);
		} else {
			// Success! Backend has already set the HTTPOnly cookie
			const redirectTo = getSafeRedirectPath(
				sessionStorage.getItem("postAuthRedirect"),
			);
			sessionStorage.removeItem("postAuthRedirect");
			router.push(redirectTo);
		}
	}, [router, searchParams]);

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

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-screen items-center justify-center">
					<Spinner />
				</div>
			}
		>
			<AuthCallbackContent />
		</Suspense>
	);
}
