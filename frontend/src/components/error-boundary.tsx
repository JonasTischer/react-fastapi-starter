import * as Sentry from "@sentry/react";
import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Root error boundary for the router. A render error in any route lands here
 * instead of blanking the whole app; the error is reported to Sentry (when a
 * DSN is configured) and the user gets a way to recover.
 */
export function DefaultCatchBoundary({ error, reset }: ErrorComponentProps) {
	useEffect(() => {
		if (import.meta.env.VITE_SENTRY_DSN) {
			Sentry.captureException(error);
		} else {
			console.error(error);
		}
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<p className="max-w-md text-sm text-muted-foreground">
				An unexpected error occurred. You can try again or head back home.
			</p>
			{import.meta.env.DEV && (
				<pre className="max-w-full overflow-auto rounded-md bg-muted p-4 text-left text-xs text-destructive">
					{error.message}
				</pre>
			)}
			<div className="flex gap-3">
				<Button onClick={() => reset()}>Try again</Button>
				<Button variant="outline" asChild>
					<Link to="/">Go home</Link>
				</Button>
			</div>
		</div>
	);
}
