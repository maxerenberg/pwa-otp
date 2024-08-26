import { assert, expect, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import type { UserEvent } from "@testing-library/user-event";
import { normalizedPath } from "../lib/routing";
import type { Digits } from "../lib/totp";
import {
  initializeSettingsStore,
  LOCALSTORAGE_SETTINGS_KEY,
  settings,
  settingsError,
  type EncodedUserSettings,
} from "../lib/userSettings";

export function commonBeforeEach() {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
  }
}

export function commonAfterEach() {
  location.pathname = "/";
  location.hash = "";
  location.search = "";
  settings.set(null);
  settingsError.set(null);
  normalizedPath.set("/");
  // This seems to cause a crash due to a race condition where a component
  // is getting torn down and calling isInstalledAsPWA()
  //delete (window as any).matchMedia;
  deleteSettings();
}

// password is "password"
const encodedEncryptedSettings: EncodedUserSettings = {
  version: 1,
  hideCodes: false,
  accounts: [],
  encryptionMethod: "password",
  iv: "H4LTNKNWLD2VT4WXCIBQ",
  salt: "6IOBLP2RXLXHXKU7FVOGXZ3WZ4",
  encryptedSalt: "JPSWQ7XT6Q4ZPEYKKDUKFG3ZLCJ7FPGZW7QQIUUVOAZ26NOX73AA",
};
Object.freeze(encodedEncryptedSettings);
export { encodedEncryptedSettings };

export const encodedUnencryptedSettings: EncodedUserSettings = {
  version: 1,
  hideCodes: false,
  accounts: [],
  encryptionMethod: "none",
};

// Generated with `head -c 20 /dev/urandom | base32`
export const totpSecret = "WJTYRQ5CNNJ77LPO6ZHOXWH6YCLAQYH7";

export function saveEncodedSettings(s: EncodedUserSettings) {
  localStorage.setItem(LOCALSTORAGE_SETTINGS_KEY, JSON.stringify(s));
}

export function deleteSettings() {
  localStorage.removeItem(LOCALSTORAGE_SETTINGS_KEY);
}

export function getEncodedSettings(): EncodedUserSettings {
  const s = localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY);
  if (s === null) {
    assert.fail("No settings are stored in localStorage");
  }
  return JSON.parse(s);
}

export function reinitializeSettingsStore() {
  initializeSettingsStore();
}

/**
 * Types the password into the form and submits it.
 * WARNING: this does not wait until the page has changed. The caller
 * is responsible for checking this after calling this function.
 */
export async function enterPassword(user: UserEvent, password: string) {
  const input = await screen.findByLabelText("enter your password", {
    exact: false,
  });
  await user.type(input, password);
  await user.keyboard("[Enter]");
}

/**
 * Adds a TOTP account. Must be called from the home page. Will
 * return to the home page at the end of the function call.
 */
export async function addTOTPAccount(
  user: UserEvent,
  {
    issuer,
    name,
    secret,
    digits,
  }: {
    issuer: string;
    name: string;
    secret?: string;
    digits?: Digits;
  },
) {
  // We need to use findAll because if no accounts have been created yet,
  // then two buttons will be present (but only the first will be visible)
  let button = (
    await screen.findAllByRole("button", { name: "Add account" })
  )[0];
  expect(button).toBeDefined();
  await user.click(button);
  await user.click(
    await screen.findByRole("button", { name: "Enter code manually" }),
  );
  let input = await screen.findByLabelText("Issuer");
  expect(location.hash).toBe("#/add-account/manual");
  await user.type(input, issuer);
  input = await screen.findByLabelText("Name");
  await user.type(input, name);
  input = await screen.findByLabelText("Secret");

  secret ??= totpSecret;
  await user.type(input, secret);
  digits ??= 6;
  input = await screen.findByLabelText(digits.toString());
  await user.click(input);
  button = await screen.findByRole("button", { name: "Finish" });
  await user.click(button);

  await screen.findByRole("button", { name: "Add account" });
  expect(location.hash).toBe("");
}
