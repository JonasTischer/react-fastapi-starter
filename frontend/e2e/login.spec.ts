import { expect, test } from "@playwright/test";

import { createTestUser } from "./utils/auth";
import { loginViaUi, logoutViaUi } from "./utils/user";

const LOGIN_HEADING = "Welcome back!";
const DASHBOARD_HEADING = "Dashboard";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login page", () => {
  test("shows the expected form elements", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: LOGIN_HEADING }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page, request }) => {
    const credentials = await createTestUser(request);

    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait a moment for any potential navigation or error messages
    await page.waitForTimeout(2000);

    // Should remain on login page when credentials are invalid
    await expect(page).toHaveURL(/\/login$/);
  });

  test("allows a user to login successfully", async ({ page, request }) => {
    const credentials = await createTestUser(request);

    await loginViaUi(page, credentials.email, credentials.password);

    await expect(
      page.getByRole("heading", { name: DASHBOARD_HEADING }),
    ).toBeVisible();
  });

  test("allows a user to logout via the user menu", async ({ page, request }) => {
    const credentials = await createTestUser(request);
    await loginViaUi(page, credentials.email, credentials.password);

    await logoutViaUi(page);
  });

  test("redirects unauthenticated visitors to login when accessing the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // The guard redirects to /login?redirect=%2Fdashboard, so match on the path
    // with a regex (a "**/login" glob would not match the query string).
    await page.waitForURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: LOGIN_HEADING }),
    ).toBeVisible();
  });
});
