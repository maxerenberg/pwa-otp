import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  getEncodedSettings,
  encodedUnencryptedSettings,
} from "../test/utils";

beforeEach(() => {
  commonBeforeEach();
  location.hash = "#/setup/security";
});
afterEach(commonAfterEach);

test("Create account with password", async () => {
  const user = userEvent.setup();
  render(App);
  const input: HTMLInputElement = await screen.findByLabelText("Password");
  expect(input).toBeChecked();
  const button = screen.getByRole("button", { name: "Continue" });
  await user.click(button);
  expect(location.hash).toBe("#/setup/security/password");
});

test("Create account without encryption", async () => {
  const user = userEvent.setup();
  render(App);
  const input: HTMLInputElement = await screen.findByLabelText("No encryption");
  await user.click(input);
  const button = screen.getByRole("button", { name: "Continue" });
  await user.click(button);
  expect(location.hash).toBe("");
  expect(getEncodedSettings()).toEqual(encodedUnencryptedSettings);
});
