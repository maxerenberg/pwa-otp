import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  encodedUnencryptedSettings,
  saveEncodedSettings,
} from "../test/utils";
import { LOCALSTORAGE_SETTINGS_KEY } from "../lib/userSettings";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

test("Delete account", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  await user.click(await screen.findByRole("link", { name: "Settings" }));
  await screen.findByRole("heading", { name: "Settings" });
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
