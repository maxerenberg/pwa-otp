import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  encodedEncryptedSettings,
  saveEncodedSettings,
  deleteSettings,
} from "../test/utils";

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

describe("No settings", () => {
  test("Welcome page appears", async () => {
    const user = userEvent.setup();
    render(App);
    const button = screen.getByRole("button", { name: "Get started" });
    await user.click(button);
    const p = screen.getByText("This website is a Progressive Web App", {
      exact: false,
    });
    expect(p).toBeInTheDocument();
  });
});

describe("Encrypted settings", () => {
  beforeEach(() => saveEncodedSettings(encodedEncryptedSettings));

  afterEach(deleteSettings);

  test("Password page appears", async () => {
    const user = userEvent.setup();
    render(App);
    const input = await screen.findByLabelText("enter your password", {
      exact: false,
    });
    await user.type(input, "password");
    await user.keyboard("[Enter]");
    await screen.findByText("You don't have any accounts yet.");
  });
});
