import { z } from "zod";

const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*(),.?":{}|<>]/;

export const passwordSchema = z
	.string()
	.min(8, "Password should be at least 8 characters.")
	.refine(
		(value) => /[A-Z]/.test(value),
		"Password should contain at least one uppercase letter.",
	)
	.refine(
		(value) => SPECIAL_CHARACTER_PATTERN.test(value),
		"Password should contain at least one special character.",
	);

export function passwordContainsEmail(password: string, email: string) {
	return password.toLowerCase().includes(email.toLowerCase());
}

export function getSafeRedirectPath(
	value: string | null | undefined,
	fallback = "/dashboard",
) {
	if (!value?.startsWith("/") || value.startsWith("//")) {
		return fallback;
	}

	try {
		const parsed = new URL(value, "http://localhost");
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return fallback;
	}
}
