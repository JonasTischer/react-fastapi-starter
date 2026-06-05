import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordContainsEmail, passwordSchema } from "@/lib/auth";
import { useSignUp } from "@/tanstack/features/auth/mutations";
import { CheckCircle } from "lucide-react";

const formSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		password: passwordSchema,
		confirmPassword: z.string(),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the Terms of Service and Privacy Policy.",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})
	.refine((data) => !passwordContainsEmail(data.password, data.email), {
		message: "Password should not contain e-mail.",
		path: ["password"],
	});

export function SignUpForm() {
	const signUp = useSignUp();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		await signUp.mutate({
			body: {
				email: values.email,
				password: values.password,
			},
		});
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader className="text-center lg:text-left">
				<CardTitle className="text-2xl font-bold tracking-tight">
					React FastAPI Account
				</CardTitle>
				<CardDescription className="mt-1 text-sm">
					Create your React FastAPI account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Divider */}
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
											type="email"
											placeholder="john.doe@example.com"
											{...field}
											className="mt-1"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Create Password
									</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="At least 8 characters"
											{...field}
											className="mt-1"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Confirm Password
									</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Confirm your password"
											{...field}
											className="mt-1"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="terms"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel className="text-xs font-normal leading-snug text-muted-foreground">
											I agree to the{" "}
											<a href="/agb" className="underline hover:text-primary">
												Terms of Service
											</a>{" "}
											and the{" "}
											<a
												href="/datenschutz"
												className="underline hover:text-primary"
											>
												Data Privacy Policy
											</a>{" "}
											of React FastAPI.
										</FormLabel>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full medical-button-gradient text-primary-foreground font-semibold tracking-wide uppercase text-sm h-11"
							disabled={signUp.isPending}
						>
							{signUp.isPending ? "Create Account..." : "Create Account"}
						</Button>
					</form>
				</Form>

				<div className="mt-6 space-y-3 text-center">
					<p className="text-xs text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-primary hover:underline"
						>
							Login
						</Link>
					</p>
					<p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
						<CheckCircle className="h-3.5 w-3.5 text-green-600" />
						GDPR-compliant
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
