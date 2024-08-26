import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  addTOTPAccount,
  commonBeforeEach,
  commonAfterEach,
  encodedEncryptedSettings,
  encodedUnencryptedSettings,
  enterPassword,
  getEncodedSettings,
  reinitializeSettingsStore,
  saveEncodedSettings,
  totpSecret,
} from "../test/utils";
import type {
  EncodedEncryptedTOTPAccount,
  EncodedUnencryptedTOTPAccount,
} from "../lib/userSettings";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

test.each([true, false])("Add accounts (encryption: %s)", async (encrypted) => {
  const user = userEvent.setup();
  if (encrypted) {
    saveEncodedSettings(encodedEncryptedSettings);
  } else {
    saveEncodedSettings(encodedUnencryptedSettings);
  }
  render(App);
  if (encrypted) {
    await enterPassword(user, "password");
  }
  await screen.findByText("You don't have any accounts yet.");

  await addTOTPAccount(user, {
    issuer: "Gmail",
    name: "jdoe@gmail.com",
  });

  const noAccountsText = screen.queryByText("You don't have any accounts yet.");
  expect(noAccountsText).not.toBeInTheDocument();
  await screen.findByText("Gmail");
  let encodedSettings = getEncodedSettings();
  expect(encodedSettings.accounts).toHaveLength(1);
  expect(encodedSettings.accounts[0].digits).toBe(6);
  if (encrypted) {
    expect(encodedSettings.accounts[0]).toHaveProperty("encryptedSecret");
    expect(
      (encodedSettings.accounts[0] as EncodedEncryptedTOTPAccount)
        .encryptedSecret,
    ).not.toBe(totpSecret);
  } else {
    expect(encodedSettings.accounts[0]).toHaveProperty("secret");
    expect(
      (encodedSettings.accounts[0] as EncodedUnencryptedTOTPAccount).secret,
    ).toBe(totpSecret);
  }

  await addTOTPAccount(user, {
    issuer: "Outlook",
    name: "jdoe@live.com",
    digits: 8,
  });
  // Both accounts should be visible
  await screen.findByText("Gmail");
  await screen.findByText("Outlook");
  encodedSettings = getEncodedSettings();
  expect(encodedSettings.accounts).toHaveLength(2);
  expect(encodedSettings.accounts[1].digits).toBe(8);

  if (encrypted) {
    reinitializeSettingsStore();
    await enterPassword(user, "password");
    await screen.findByText("Gmail");
    await screen.findByText("Outlook");
  }
});

test("No settings", async () => {
  location.hash = "#/add-account";
  render(App);
  await screen.findByText("You need to setup an account to access this page.");
});
