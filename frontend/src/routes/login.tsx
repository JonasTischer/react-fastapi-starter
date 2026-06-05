import { createFileRoute } from "@tanstack/react-router";

import Logo from "@/components/common/logo";
import { LoginForm } from "@/components/login-form";

interface LoginSearch {
	redirect?: string;
	error?: string;
	reset?: string;
}

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
		reset: typeof search.reset === "string" ? search.reset : undefined,
	}),
	component: LoginPage,
});

function LoginPage() {
	const { redirect } = Route.useSearch();

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-6 bg-linear-to-b from-cyan-50/50 to-teal-50/50 dark:from-transparent dark:to-transparent">
			{/* Logo and Branding */}
			<div className="mb-8 flex flex-col items-center gap-2">
				<Logo width={48} height={56} />
				<div className="flex flex-col items-center">
					<h1 className="text-xl font-semibold tracking-tight medical-text-gradient">
						React FastAPI
					</h1>
					<p className="text-sm text-muted-foreground">
						Your React FastAPI Starter Kit
					</p>
				</div>
			</div>

			{/* Login Form Container */}
			<div className="w-full max-w-sm">
				<LoginForm redirect={redirect} />
			</div>
		</main>
	);
}
