import { test, expect, type Page } from "@playwright/test";

// Downloaded from https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992
const filename = "TOTP-AcmeCo-jdoe@example.com.png";

async function setupAccount(page: Page) {
  await page.goto("/");
  await expect(page).toHaveTitle("Authenticator");
  await page.getByRole("button", { name: "Get started" }).click();
  // PWA prompt
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  // Import existing settings
  await page.getByRole("button", { name: "No" }).click();
  // Encryption type
  await page.getByLabel("No encryption").check();
  await page.getByRole("button", { name: "Continue" }).click();
  // Home page
  await expect(
    page.getByText("You don't have any accounts yet."),
  ).toBeVisible();
}

test("Add account from QR code picture", async ({ page }) => {
  await setupAccount(page);
  await page.getByRole("button", { name: "Add account" }).click();
  await page.getByRole("button", { name: "Scan QR code" }).click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Scan from file instead" }).click();
  const filechooser = await fileChooserPromise;
  await filechooser.setFiles("./e2e/" + filename);
  // Should return to home page after successful scan
  await expect(page).toHaveTitle("Authenticator");
  await expect(page.getByText("ACME Co")).toBeVisible();
  await expect(page.getByText("jdoe@example.com")).toBeVisible();
});
