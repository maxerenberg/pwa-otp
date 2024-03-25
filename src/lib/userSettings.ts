import { writable } from "svelte/store";
import {
  ParseError,
  parseOTPAuthURL,
  serializeTOTPAccountToURL,
  type TOTPAccount,
} from "./totp";

export type EncryptionMethod = "password" | "fido2" | "none";

const SCHEMA_VERSION = 1;
type EncodedUserSettings = {
  version: typeof SCHEMA_VERSION;
  encryptionMethod: EncryptionMethod;
  accounts: string[]; // array of otpauth:// URLs
};

export type UserSettings = {
  encryptionMethod: EncryptionMethod;
  accounts: TOTPAccount[];
};

// TODO: request "persistent" storage
// https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

const LOCALSTORAGE_SETTINGS_KEY = "pwa-otp-settings";

function getStoredSettings(): UserSettings | ParseError | null {
  const settingsStr = localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY);
  if (!settingsStr) {
    return null;
  }
  let encodedSettings: EncodedUserSettings;
  try {
    encodedSettings = JSON.parse(settingsStr);
  } catch (err) {
    return new ParseError("Invalid JSON");
  }
  // TODO: validate schema
  if (encodedSettings.version !== SCHEMA_VERSION) {
    return new ParseError(
      `Version mismatch: expected ${SCHEMA_VERSION}, got ${encodedSettings.version}`,
    );
  }
  let accounts: TOTPAccount[] = [];
  for (const otpauthURL of encodedSettings.accounts) {
    const account = parseOTPAuthURL(otpauthURL);
    if (account instanceof ParseError) {
      return account;
    }
    accounts.push(account);
  }
  return {
    encryptionMethod: encodedSettings.encryptionMethod,
    accounts,
  };
}

function save(settings: UserSettings) {
  const encodedSettings: EncodedUserSettings = {
    version: SCHEMA_VERSION,
    encryptionMethod: settings.encryptionMethod,
    accounts: settings.accounts.map(serializeTOTPAccountToURL),
  };
  localStorage.setItem(
    LOCALSTORAGE_SETTINGS_KEY,
    JSON.stringify(encodedSettings),
  );
}

// TODO: do computation in Worker instead of delaying startup
const initialSettings = getStoredSettings();
export const settingsError =
  initialSettings instanceof ParseError ? initialSettings : null;

function createSettingsStore() {
  const { subscribe, set, update } = writable(
    initialSettings instanceof ParseError ? null : initialSettings,
  );
  return {
    subscribe,
    create(encryptionMethod: EncryptionMethod) {
      const newSettings: UserSettings = { encryptionMethod, accounts: [] };
      save(newSettings);
      set(newSettings);
    },
    addAccount(account: TOTPAccount) {
      update((s) => {
        if (s) {
          s.accounts.push(account);
          save(s);
        }
        return s;
      });
    },
    swapAccounts(i: number, j: number) {
      // TODO: save to localStorage
      update((s) => {
        if (s) {
          const temp = s.accounts[i];
          s.accounts[i] = s.accounts[j];
          s.accounts[j] = temp;
          save(s);
        }
        return s;
      });
    },
    reset() {
      localStorage.removeItem(LOCALSTORAGE_SETTINGS_KEY);
      set(null);
    },
  };
}

export const settings = createSettingsStore();
