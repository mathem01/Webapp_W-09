import { test, expect } from "@playwright/test";

test("innlogget bruker kan opprette og finne en tegning", async ({ page }) => {
  const e2eEmail = `test+${Date.now()}@drawit.no`;
  const e2ePassword = "langtnokpassord12";
  const username = `test_${Date.now()}`.slice(0, 20);
  const title = `E2E tegning ${Date.now()}`;

  await page.goto("/register");

  await page.getByLabel("Navn", { exact: true }).fill("Test Bruker");
  await page.getByLabel("Brukernavn", { exact: true }).fill(username);
  await page.getByLabel("Email", { exact: true }).fill(e2eEmail);
  await page.getByLabel("Passord", { exact: true }).fill(e2ePassword);
  await page.getByRole("button", { name: "Lag bruker" }).click();

  await expect(page).toHaveURL(/\/$/);

  await page.goto("/myPage");

  await page.getByRole("button", { name: "Ny tegning" }).click();

  await page.getByLabel("Tittel").fill(title);
  await page.getByLabel("Bredde").fill("10");
  await page.getByLabel("Høyde").fill("10");

  await page.getByRole("button", { name: "Opprett tegning" }).click();

  await expect(page).toHaveURL(/\/canvas\/.+/);

  await page.goto("/myPage");

  await expect(page.getByText(title)).toBeVisible();
});