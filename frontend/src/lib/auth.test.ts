import { describe, expect, it } from "vitest";

import {
	getSafeRedirectPath,
	passwordContainsEmail,
	passwordSchema,
} from "./auth";

describe("getSafeRedirectPath", () => {
	it("falls back to /dashboard for nullish input", () => {
		expect(getSafeRedirectPath(null)).toBe("/dashboard");
		expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
		expect(getSafeRedirectPath("")).toBe("/dashboard");
	});

	it("blocks open-redirects to other origins", () => {
		expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
		expect(getSafeRedirectPath("//evil.example")).toBe("/dashboard");
		expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
	});

	it("preserves a safe relative path with query and hash", () => {
		expect(getSafeRedirectPath("/items?page=2#top")).toBe("/items?page=2#top");
	});

	it("honors a custom fallback", () => {
		expect(getSafeRedirectPath(null, "/login")).toBe("/login");
	});
});

describe("passwordSchema", () => {
	it("accepts a strong password", () => {
		expect(passwordSchema.safeParse("Str0ng!pass").success).toBe(true);
	});

	it("rejects passwords shorter than 8 characters", () => {
		expect(passwordSchema.safeParse("A!a").success).toBe(false);
	});

	it("requires an uppercase letter", () => {
		expect(passwordSchema.safeParse("weak!password").success).toBe(false);
	});

	it("requires a special character", () => {
		expect(passwordSchema.safeParse("NoSpecialChar1").success).toBe(false);
	});
});

describe("passwordContainsEmail", () => {
	it("detects the email inside the password (case-insensitive)", () => {
		expect(passwordContainsEmail("myJohn@x.comPass", "john@x.com")).toBe(true);
	});

	it("returns false when the password does not contain the email", () => {
		expect(passwordContainsEmail("Str0ng!pass", "john@x.com")).toBe(false);
	});
});
