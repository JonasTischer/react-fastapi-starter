import { expect, type Page } from "@playwright/test";

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Login navigates via the SPA router (history.push), so wait on the URL
  // (regex tolerates an optional ?redirect=... query) and the page heading.
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();
}

export async function logoutViaUi(page: Page) {
  await page.getByRole("button", { name: "User menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Welcome back!" }),
  ).toBeVisible();
}

export async function registerViaUi(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Create Password").fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page
    .getByLabel(
      "I agree to the Terms of Service and the Data Privacy Policy of React FastAPI.",
    )
    .check();
  await page.getByRole("button", { name: "Create Account" }).click();
}
