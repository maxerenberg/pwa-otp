import { vi } from "vitest";
import { normalizedPath } from "../lib/routing";
import {
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

export function saveEncodedSettings(s: EncodedUserSettings) {
  localStorage.setItem(LOCALSTORAGE_SETTINGS_KEY, JSON.stringify(s));
}

export function deleteSettings() {
  localStorage.removeItem(LOCALSTORAGE_SETTINGS_KEY);
}
