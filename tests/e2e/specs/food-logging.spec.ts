import { test, expect } from "@playwright/test";

test.describe("Food logging page", () => {
  test("should redirect to login if not authenticated", async ({ page }) => {
    await page.goto("/food");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display food search input", async ({ page }) => {
    // Simulate authenticated state by setting localStorage
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem(
        "leanlife-auth",
        JSON.stringify({
          state: {
            user: { id: "test", email: "test@test.com", name: "Test", subscription: "FREE" },
            token: "fake-token",
            refreshToken: "fake-refresh",
          },
          version: 0,
        })
      );
    });

    await page.goto("/food");
    await expect(page.getByText("Logg mat")).toBeVisible();
    await expect(page.getByPlaceholder("Søk etter matvare")).toBeVisible();
  });
});
