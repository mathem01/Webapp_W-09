import { test, expect } from "@playwright/test";

const e2eEmail = process.env.E2E_EMAIL;
const e2ePassword = process.env.E2E_PASSWORD;

if (!e2eEmail || !e2ePassword) {
  throw new Error(
    "Mangler E2E_EMAIL eller E2E_PASSWORD. Sett dem før du kjører pnpm test:e2e.",
  );
}

test("innlogget bruker kan opprette og finne en tegning", async ({ page }) => {
  const title = `E2E tegning ${Date.now()}`;

  await page.goto("/login");

  await page.getByLabel("Email").fill(e2eEmail);
  await page.getByLabel("Passord").fill(e2ePassword);
  await page.getByRole("button", { name: "Logg inn" }).click();

  await page.goto("/myPage");

  await page.getByRole("button", { name: "Ny tegning" }).click();

  await page.getByLabel("Tittel").fill(title);
  await page.getByLabel("Bredde").fill("10");
  await page.getByLabel("Høyde").fill("10");

  await page.getByRole("button", { name: "Opprett tegning" }).click();

  await expect(page).toHaveURL(/\/canvas\/.+/);

  // Tegningen ble opprettet og kan finnes igjen på Min side.
  await page.goto("/myPage");

  await expect(page.getByText(title)).toBeVisible();
});
