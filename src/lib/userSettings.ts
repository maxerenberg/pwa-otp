import { derived, writable } from "svelte/store";
import {
  base32decode,
  base32encode,
  generateAccountID,
  ParseError,
  TOTPCalculator,
  type TOTPAccount,
  type Digits,
} from "./totp";

export type EncryptionMethod = "password" | "webauthn-prf" | "none";

const SCHEMA_VERSION = 1;
type EncodedTOTPAccount = Omit<TOTPAccount, "id" | "secret"> & {
  id?: string;
  secret: string;
};
type EncodedUserSettings = {
  version: number;
  encryptionMethod: EncryptionMethod;
  accounts: EncodedTOTPAccount[];
};

export type UserSettings = {
  encryptionMethod: EncryptionMethod;
  accounts: TOTPAccount[];
};

// TODO: request "persistent" storage
// https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

const LOCALSTORAGE_SETTINGS_KEY = "pwa-otp-settings";

// TODO: accept optional password param
// TODO: return NeedPasswordError if encryptionMethod === 'password'
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
  for (const encodedAccount of encodedSettings.accounts) {
    let id: string;
    if (encodedAccount.id) {
      id = encodedAccount.id;
    } else {
      // Generate a new ID if it wasn't saved
      id = generateAccountID();
    }
    const secret = base32decode(encodedAccount.secret);
    if (secret instanceof ParseError) {
      return secret;
    }
    const account: TOTPAccount = { ...encodedAccount, id, secret };
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
    accounts: settings.accounts.map((account) => ({
      ...account,
      secret: base32encode(account.secret),
    })),
  };
  localStorage.setItem(
    LOCALSTORAGE_SETTINGS_KEY,
    JSON.stringify(encodedSettings),
  );
}

// TODO: create TOTPCalculator instances (but factory is async...)
// TODO: do computation in Worker instead of delaying startup
const initialSettings = getStoredSettings();
export const settingsError =
  initialSettings instanceof ParseError ? initialSettings : null;
// TODO: show error message to user if stored settings are corrupt
if (settingsError) console.error(settingsError);

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
    addAccount(formAccount: Omit<TOTPAccount, "id">) {
      update((s) => {
        if (s) {
          const id = generateAccountID();
          const account: TOTPAccount = { ...formAccount, id };
          s.accounts.push(account);
          save(s);
        }
        return s;
      });
    },
    removeAccount(accountID: string) {
      update((s) => {
        if (s) {
          s.accounts = s.accounts.filter((account) => account.id !== accountID);
          save(s);
        }
        return s;
      });
    },
    setAccountIssuer(accountID: string, issuer: string) {
      update((s) => {
        if (s) {
          for (const account of s.accounts) {
            if (account.id === accountID) {
              account.issuer = issuer;
              save(s);
              break;
            }
          }
        }
        return s;
      });
    },
    swapAccounts(i: number, j: number) {
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

/**
 * @returns undefined if the settings are null; null if the settings
 *   are loaded but the account does not exist; or the account in
 *   settings.account with the given ID
 */
export function getAccountByID(
  settings: UserSettings | null,
  accountID: string,
): TOTPAccount | undefined | null {
  if (!settings) return undefined;
  const filtered = settings.accounts.filter((a) => a.id === accountID);
  if (filtered.length === 0) {
    return null;
  }
  return filtered[0];
}

const initialTotpCalculators: Partial<Record<string, TOTPCalculator>> = {};
export const totpCalculators = derived(
  settings,
  ($settings, set, update) => {
    if (!$settings) return;
    update((totpCalculators) => {
      const validAccountIDs = new Set<string>();
      for (const account of $settings.accounts) {
        validAccountIDs.add(account.id);
        // TODO: check if account changed (e.g. number of digits)
        if (!totpCalculators.hasOwnProperty(account.id)) {
          TOTPCalculator.factory(account).then((totpCalculator) => {
            update((totpCalculators) => {
              totpCalculators[account.id] = totpCalculator;
              return totpCalculators;
            });
          });
        }
      }
      for (const accountID of Object.keys(totpCalculators)) {
        if (!validAccountIDs.has(accountID)) {
          delete totpCalculators[accountID];
        }
      }
      return totpCalculators;
    });
  },
  initialTotpCalculators,
);
