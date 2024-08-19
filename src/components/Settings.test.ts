import { render, screen } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  encodedEncryptedSettings,
  encodedUnencryptedSettings,
  saveEncodedSettings,
  getEncodedSettings,
  reinitializeSettingsStore,
  enterPassword,
} from "../test/utils";
import { LOCALSTORAGE_SETTINGS_KEY } from "../lib/userSettings";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

async function goToSettingsPage(user: UserEvent) {
  await user.click(await screen.findByRole("link", { name: "Settings" }));
  await screen.findByRole("heading", { name: "Settings" });
}

test("Delete account", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  await goToSettingsPage(user);
  await user.click(await screen.findByRole("link", { name: "Delete account" }));
  await screen.findByRole("heading", { name: "Delete account" });
  await user.click(
    await screen.findByRole("button", { name: "Yes, delete my data" }),
  );
  await screen.findByRole("heading", { name: "Account deleted" });
  await screen.findByText("Your account was successfully deleted.");
  expect(localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY)).toBeNull();
  await user.click(await screen.findByRole("button", { name: "Return home" }));
  await screen.findByRole("heading", { name: "Authenticator" });
  expect(location.hash).toBe("");
});

test("Add password", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  await goToSettingsPage(user);
  await user.click(await screen.findByRole("link", { name: "Add password" }));
  await screen.findByRole("heading", { name: "Create password" });
  const input1: HTMLInputElement = await screen.findByLabelText(
    "Please create a new password:",
  );
  await user.type(input1, "password");
  const input2: HTMLInputElement = await screen.findByLabelText(
    "Please confirm your password:",
  );
  await user.type(input2, "password");
  const button = screen.getByRole("button", { name: "Continue" });
  await user.click(button);
  await screen.findByRole("heading", { name: "Settings" });
  expect(getEncodedSettings().encryptionMethod).toBe("password");
  await user.click(await screen.findByLabelText("Back"));
  await screen.findByRole("heading", { name: "Authenticator" });
  reinitializeSettingsStore();
  await enterPassword(user, "password");
  await screen.findByRole("heading", { name: "Authenticator" });
});

test("Change password", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedEncryptedSettings);
  render(App);
  await enterPassword(user, "password");
  await goToSettingsPage(user);
  await user.click(
    await screen.findByRole("link", { name: "Change password" }),
  );
  await screen.findByRole("heading", { name: "Change password" });
  const input1: HTMLInputElement = await screen.findByLabelText(
    "Please enter your current password:",
  );
  await user.type(input1, "password");
  const input2: HTMLInputElement = await screen.findByLabelText(
    "Please create a new password:",
  );
  await user.type(input2, "password2");
  const input3: HTMLInputElement = await screen.findByLabelText(
    "Please confirm your password:",
  );
  await user.type(input3, "password2");
  const button = screen.getByRole("button", { name: "Continue" });
  await user.click(button);
  await screen.findByRole("heading", { name: "Settings" });
  await user.click(await screen.findByLabelText("Back"));
  await screen.findByRole("heading", { name: "Authenticator" });
  reinitializeSettingsStore();
  await enterPassword(user, "password2");
  await screen.findByRole("heading", { name: "Authenticator" });
});
