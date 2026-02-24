import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("LeanLife")).toBeVisible();
    await expect(page.getByText("Logg inn på kontoen din")).toBeVisible();
    await expect(page.getByLabel("E-postadresse")).toBeVisible();
    await expect(page.getByLabel("Passord")).toBeVisible();
    await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-postadresse").fill("wrong@test.com");
    await page.getByLabel("Passord").fill("wrongpass");
    await page.getByRole("button", { name: "Logg inn" }).click();

    await expect(page.getByText(/feilet|ugyldig/i)).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByText("Registrer deg gratis").click();
    await expect(page).toHaveURL("/register");
  });
});

test.describe("Landing page", () => {
  test("should display hero and features", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("varig, sunn vekt")).toBeVisible();
    await expect(page.getByText("Smart kaloritracking")).toBeVisible();
    await expect(page.getByText("Start gratis")).toBeVisible();
  });

  test("should navigate to registration from CTA", async ({ page }) => {
    await page.goto("/");

    await page.getByText("Kom i gang gratis").first().click();
    await expect(page).toHaveURL("/register");
  });
});
