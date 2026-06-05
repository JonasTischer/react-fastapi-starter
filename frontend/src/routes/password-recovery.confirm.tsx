import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import Logo from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetResetPassword } from "@/generated/backend-client/sdk.gen";
import { passwordSchema } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";

interface ConfirmSearch {
	token?: string;
}

export const Route = createFileRoute("/password-recovery/confirm")({
	validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: PasswordRecoveryConfirmPage,
});

function PasswordRecoveryConfirmPage() {
	const { token } = Route.useSearch();
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const parsed = passwordSchema.safeParse(password);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Password is invalid.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords don't match.");
			return;
		}

		if (!token) {
			setError("Password reset token is missing.");
			return;
		}

		setIsPending(true);
		try {
			await resetResetPassword({
				body: { token, password },
				throwOnError: true,
			});
			toast.success("Password reset successfully.");
			navigate({ to: "/login", search: { reset: "success" } });
		} catch (error) {
			handleApiError(error, "Failed to reset password");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-cyan-50/50 to-teal-50/50 p-6 dark:from-transparent dark:to-transparent">
			<div className="mb-8 flex flex-col items-center gap-2">
				<Logo width={48} height={56} />
				<div className="flex flex-col items-center">
					<h1 className="medical-text-gradient text-xl font-semibold tracking-tight">
						React FastAPI
					</h1>
					<p className="text-sm text-muted-foreground">
						Your React FastAPI Starter Kit
					</p>
				</div>
			</div>

			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Choose a new password</CardTitle>
					<CardDescription>
						Use a strong password with an uppercase letter and a special
						character.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!token ? (
						<div className="space-y-4">
							<p className="text-sm text-destructive">
								Password reset token is missing.
							</p>
							<Button asChild className="w-full">
								<Link to="/password-reset">Request a new link</Link>
							</Button>
						</div>
					) : (
						<form method="post" onSubmit={onSubmit} className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="password">New password</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="confirmPassword">Confirm password</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									required
								/>
							</div>
							{error && <p className="text-sm text-destructive">{error}</p>}
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Resetting..." : "Reset password"}
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
