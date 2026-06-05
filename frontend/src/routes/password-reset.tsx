import { createFileRoute, Link } from "@tanstack/react-router";
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
import { resetForgotPassword } from "@/generated/backend-client/sdk.gen";
import { handleApiError } from "@/utils/error-handler";

export const Route = createFileRoute("/password-reset")({
	component: PasswordResetPage,
});

function PasswordResetPage() {
	const [email, setEmail] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [sent, setSent] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsPending(true);
		try {
			await resetForgotPassword({
				body: { email },
				throwOnError: true,
			});
			setSent(true);
			toast.success("Password reset email sent.");
		} catch (error) {
			handleApiError(error, "Failed to send password reset email");
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
					<CardTitle>Reset password</CardTitle>
					<CardDescription>
						Enter your email and we will send a recovery link.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								If an account exists for that email, a reset link has been sent.
							</p>
							<Button asChild className="w-full">
								<Link to="/login">Back to login</Link>
							</Button>
						</div>
					) : (
						<form method="post" onSubmit={onSubmit} className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Sending..." : "Send reset link"}
							</Button>
							<Button asChild variant="ghost" className="w-full">
								<Link to="/login">Back to login</Link>
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
