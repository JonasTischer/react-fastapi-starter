import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import Spinner from "@/components/common/spinner";
import { useUser } from "@/tanstack/features/auth/queries";
import { UserProvider } from "./user-provider";

/**
 * Client-side auth gate for the authenticated section of the app.
 *
 * Auth is cookie-based (HTTPOnly), so the only way to know if the visitor is
 * signed in is to ask the backend — that's what `useUser()` does. While the
 * check is in flight we show a spinner; if it fails we send the visitor to
 * /login with a `redirect` back to where they were heading.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { data: user, isLoading, isError } = useUser();
	const navigate = useNavigate();

	const unauthenticated = !isLoading && (isError || !user);

	useEffect(() => {
		if (unauthenticated) {
			const currentPath = `${window.location.pathname}${window.location.search}`;
			navigate({
				to: "/login",
				search: { redirect: currentPath },
				replace: true,
			});
		}
	}, [unauthenticated, navigate]);

	if (isLoading || unauthenticated || !user) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return <UserProvider initialUser={user}>{children}</UserProvider>;
}
