import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";
import {
  addTOTPAccount,
  commonBeforeEach,
  commonAfterEach,
  encodedUnencryptedSettings,
  getEncodedSettings,
  saveEncodedSettings,
} from "../test/utils";
import App from "../App.svelte";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

test("Hide codes", async () => {
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  await screen.findByText("You don't have any accounts yet.");

  await addTOTPAccount(user, {
    issuer: "Gmail",
    name: "jdoe@gmail.com",
  });

  expect(getEncodedSettings().hideCodes).toBe(false);
  await screen.findByText("Code");
  await user.click(await screen.findByRole("button", { name: "Hide codes" }));
  expect(screen.queryByText("Code")).not.toBeInTheDocument();
  expect(getEncodedSettings().hideCodes).toBe(true);

  await user.click(await screen.findByRole("button", { name: "Show codes" }));
  expect(screen.queryByText("Code")).toBeInTheDocument();
  expect(getEncodedSettings().hideCodes).toBe(false);
});
