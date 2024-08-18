import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test } from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  enterPassword,
  totpSecret,
} from "../test/utils";
import type { EncodedUserSettings } from "../lib/userSettings";

beforeEach(() => {
  commonBeforeEach();
  location.hash = "#/setup/import";
});
afterEach(commonAfterEach);

const encodedEncryptedSettings: EncodedUserSettings = {
  version: 1,
  hideCodes: false,
  accounts: [
    {
      issuer: "Google",
      name: "jdoe@gmail.com",
      algorithm: "SHA1",
      digits: 6,
      id: "JRyu8-aLOR",
      encryptedSecret:
        "4LCO6HTB6F3WCZNP2WVTW55TNCV5X2FOSR2WRXCVA6TO55M67Y5XVWXWFI",
    },
  ],
  encryptionMethod: "password",
  iv: "TOMG5ZE3G733XOCQIWKQ",
  salt: "AJEP2PDKNYU7U6O7ZIOJNYBJOY",
  encryptedSalt: "KLVZVYNJ6QGWJMM65H4UMT3E3YUI2IWJPZUXFY5LFPOFTLJBNJSA",
};
const encodedUnencryptedSettings: EncodedUserSettings = {
  version: 1,
  hideCodes: false,
  accounts: [
    {
      issuer: "Google",
      name: "jdoe@gmail.com",
      algorithm: "SHA1",
      secret: totpSecret,
      digits: 6,
      id: "JRyu8-aLOR",
    },
  ],
  encryptionMethod: "none",
};

test.each([true, false])("Add accounts (encryption: %s)", async (encrypted) => {
  const user = userEvent.setup();
  render(App);
  await screen.findByText("Would you like to import existing settings?");
  // Normally clicking the button automatically clicks the hidden input, but
  // I'm not sure how to provide a file to user.click()
  await screen.findByRole("button", { name: "Yes" });
  const input = await screen.findByTestId("import-settings-input");
  const encodedSettings = encrypted
    ? encodedEncryptedSettings
    : encodedUnencryptedSettings;
  const file = new File([JSON.stringify(encodedSettings)], "settings.json", {
    type: "application/json",
  });
  await user.upload(input, file);
  if (encrypted) {
    await enterPassword(user, "password");
  }
  await screen.findByRole("heading", { name: "Authenticator" });
  await screen.findByText("Google");
  await screen.findByText("jdoe@gmail.com");
});
