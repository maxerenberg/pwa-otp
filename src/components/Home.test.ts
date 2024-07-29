import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  encodedEncryptedSettings,
  saveEncodedSettings,
  enterPassword,
} from "../test/utils";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

describe("No settings", () => {
  test("Welcome page appears", async () => {
    const user = userEvent.setup();
    render(App);
    const button = screen.getByRole("button", { name: "Get started" });
    await user.click(button);
    await screen.findByText("This website is a Progressive Web App", {
      exact: false,
    });
  });
});

describe("Encrypted settings", () => {
  beforeEach(() => saveEncodedSettings(encodedEncryptedSettings));

  test("Password page appears", async () => {
    const user = userEvent.setup();
    render(App);
    await enterPassword(user, "password");
    await screen.findByText("You don't have any accounts yet.");
  });
});
