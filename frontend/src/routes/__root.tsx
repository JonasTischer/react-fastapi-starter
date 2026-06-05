import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { NotFound } from "@/components/not-found";

// Router devtools are dev-only — in production this resolves to a no-op so the
// devtools bundle is never shipped to users. They're also disabled under e2e
// (VITE_DISABLE_DEVTOOLS=true) so the devtools panel can't shadow page content.
const devtoolsDisabled =
	import.meta.env.PROD || import.meta.env.VITE_DISABLE_DEVTOOLS === "true";
const TanStackRouterDevtools = devtoolsDisabled
	? () => null
	: lazy(() =>
			import("@tanstack/react-router-devtools").then((m) => ({
				default: m.TanStackRouterDevtools,
			})),
		);

export const Route = createRootRoute({
	component: RootComponent,
	notFoundComponent: NotFound,
});

function RootComponent() {
	return (
		<>
			<Outlet />
			<Suspense>
				<TanStackRouterDevtools position="bottom-right" />
			</Suspense>
		</>
	);
}
