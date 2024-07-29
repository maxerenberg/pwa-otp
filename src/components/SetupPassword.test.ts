import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  getEncodedSettings,
  reinitializeSettingsStore,
} from "../test/utils";

beforeEach(() => {
  commonBeforeEach();
  location.hash = "#/setup/security/password";
});
afterEach(commonAfterEach);

async function fillForm(user: UserEvent, password1: string, password2: string) {
  render(App);
  const input1: HTMLInputElement = await screen.findByLabelText(
    "Please create a new password",
    { exact: false },
  );
  await user.type(input1, password1);
  const input2: HTMLInputElement = await screen.findByLabelText(
    "Please confirm your password",
    { exact: false },
  );
  await user.type(input2, password2);
  const button = screen.getByRole("button", { name: "Continue" });
  await user.click(button);
  return { input1, input2 };
}

test("Passwords do not match", async () => {
  const user = userEvent.setup();
  const { input2 } = await fillForm(user, "abc", "def");
  // URL should not have changed because there was an error
  expect(location.hash).toBe("#/setup/security/password");
  const errorMessageElem = screen.getByText("Passwords do not match");
  expect(errorMessageElem).toBeInTheDocument();
  // Error message should disappear when input is modified
  await user.type(input2, "[Backspace]");
  expect(errorMessageElem).not.toBeInTheDocument();
});

test("Passwords match", async () => {
  const user = userEvent.setup();
  await fillForm(user, "abc", "abc");
  await screen.findByText("You don't have any accounts yet.");
  expect(location.hash).toBe("");

  const encodedSettings = getEncodedSettings();
  expect(encodedSettings.encryptionMethod).toBe("password");

  reinitializeSettingsStore();
  const input = await screen.findByLabelText("enter your password", {
    exact: false,
  });
  await user.type(input, "abc");
  await user.keyboard("[Enter]");
  await screen.findByText("You don't have any accounts yet.");
});
