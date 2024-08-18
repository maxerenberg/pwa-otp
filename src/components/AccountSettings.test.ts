import { render, screen } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  addTOTPAccount,
  commonBeforeEach,
  commonAfterEach,
  encodedUnencryptedSettings,
  saveEncodedSettings,
  getEncodedSettings,
} from "../test/utils";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

async function deleteTOTPAccount(user: UserEvent, issuer: string) {
  await user.click(await screen.findByText(issuer));
  await user.click(
    await screen.findByRole("button", { name: "Account settings" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Remove account" }),
  );
  await user.click(await screen.findByRole("button", { name: "Continue" }));
}

test("Delete TOTP account", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  await addTOTPAccount(user, {
    issuer: "Gmail",
    name: "jdoe@gmail.com",
  });
  await addTOTPAccount(user, {
    issuer: "Outlook",
    name: "jdoe@live.com",
    digits: 8,
  });

  await deleteTOTPAccount(user, "Gmail");
  expect(getEncodedSettings().accounts).toHaveLength(1);
  await screen.findByText("Outlook");
  expect(screen.queryByText("Gmail")).not.toBeInTheDocument();

  await deleteTOTPAccount(user, "Outlook");
  expect(getEncodedSettings().accounts).toHaveLength(0);
  await screen.findByText("You don't have any accounts yet.");
});
