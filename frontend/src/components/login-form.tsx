import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getSafeRedirectPath } from "@/lib/auth";
import { useLogin } from "@/tanstack/features/auth/mutations";

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(1, {
		message: "Password is required.",
	}),
});

export function LoginForm({ redirect }: { redirect?: string }) {
	const redirectTo = getSafeRedirectPath(redirect);
	const login = useLogin(redirectTo);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (credentials: z.infer<typeof formSchema>) => {
		login.mutate({
			body: {
				username: credentials.email,
				password: credentials.password,
			},
		});
	};

	const handleGoogleLogin = async () => {
		try {
			sessionStorage.setItem("postAuthRedirect", redirectTo);
			const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
			const response = await fetch(
				`${apiBaseUrl ?? ""}/auth/google/authorize`,
				{
					credentials: "include",
				},
			);
			const payload = (await response.json()) as {
				authorization_url?: string;
			};

			if (response.ok && payload.authorization_url) {
				window.location.href = payload.authorization_url;
			} else {
				toast.error("Failed to get Google authorization URL");
			}
		} catch (error) {
			console.error("Google login error:", error);
			toast.error("Failed to initiate Google login");
		}
	};

	return (
		<div className="w-full space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Welcome back!
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Sign in to your account to continue
				</p>
			</div>

			{import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true" && (
				<>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleGoogleLogin}
					>
						<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<title>Google</title>
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</Button>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>
				</>
			)}

			<Form {...form}>
				<form
					method="post"
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-medium text-muted-foreground">
									Email
								</FormLabel>
								<FormControl>
									<Input
										placeholder="your@email.com"
										{...field}
										className="mt-1"
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Password
									</FormLabel>
									<Link
										to="/password-reset"
										className="ml-auto inline-block text-xs text-primary hover:underline"
									>
										Forgot password?
									</Link>
								</div>
								<FormControl>
									<Input
										type="password"
										{...field}
										className="mt-1"
										placeholder="Your password"
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full medical-button-gradient text-primary-foreground font-semibold tracking-wide uppercase text-sm h-11"
						disabled={login.isPending}
					>
						{login.isPending ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</Form>

			<p className="text-center text-xs text-muted-foreground">
				Don't have an account?{" "}
				<Link
					to="/register"
					className="font-medium text-primary hover:underline"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}
