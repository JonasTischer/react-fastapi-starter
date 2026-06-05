import { expect, type Page } from "@playwright/test";

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for either success (dashboard) or stay on login page with error
  try {
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
  } catch (error) {
    // If we don't navigate to dashboard, check if we're still on login with error
    await expect(page).toHaveURL(/\/login$/);
    // The login might have failed, which is also valid behavior to test
    throw error;
  }
}

export async function logoutViaUi(page: Page) {
  await page.getByRole("button", { name: "User menu" }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await page.waitForURL("**/login");
  await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();
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
  await page.getByLabel("I agree to the Terms of Service and the Data Privacy Policy of React FastAPI.").check();
  await page.getByRole("button", { name: "Create Account" }).click();
}
