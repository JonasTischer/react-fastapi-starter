import { expect, test } from "@playwright/test";

import { createTestUser } from "./utils/auth";
import { randomEmail, randomPassword } from "./utils/random";

const REGISTER_HEADING = "React FastAPI Account";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Registration page", () => {
  test("shows the expected form elements", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByText(REGISTER_HEADING, { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Create Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Login" }),
    ).toBeVisible();
  });

  test("registers a new user and redirects to login", async ({ page }) => {
    const email = randomEmail();
    const password = randomPassword();

    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Create Password").fill(password);
    await page.getByLabel("Confirm Password").fill(password);
    await page.getByLabel("I agree to the Terms of Service and the Data Privacy Policy of React FastAPI.").check();
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for either navigation to dashboard (auto-login) or redirect to login
    try {
      // Try auto-login to dashboard
      await page.waitForURL("**/dashboard", { timeout: 10000 });
      await expect(page.getByText("Dashboard")).toBeVisible();
    } catch {
      // Fall back to manual redirect to login
      await page.waitForURL("**/login", { timeout: 5000 });
      await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();
    }
  });

  test("rejects weak passwords client-side", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Email").fill(randomEmail());
    await page.getByLabel("Create Password").fill("weak");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Password should be at least 8 characters."),
    ).toBeVisible();
  });

  test("rejects invalid email addresses", async ({ page }) => {
    const password = randomPassword();
    await page.goto("/register");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Create Password").fill(password);
    await page.getByLabel("Confirm Password").fill(password);
    await page.getByLabel("I agree to the Terms of Service and the Data Privacy Policy of React FastAPI.").check();
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByLabel("Email")).toHaveJSProperty(
      "validity.valid",
      false,
    );
    await expect(page).toHaveURL(/\/register$/);
  });

  test("rejects duplicated email addresses", async ({ page, request }) => {
    const existingUser = await createTestUser(request);

    const password = randomPassword();
    await page.goto("/register");
    await page.getByLabel("Email").fill(existingUser.email);
    await page.getByLabel("Create Password").fill(password);
    await page.getByLabel("Confirm Password").fill(password);
    await page.getByLabel("I agree to the Terms of Service and the Data Privacy Policy of React FastAPI.").check();
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait a moment for any potential navigation or error messages
    await page.waitForTimeout(2000);

    // Should remain on register page when user already exists
    await expect(page).toHaveURL(/\/register$/);
  });
});
