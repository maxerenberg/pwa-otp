import { derived, writable, type Updater } from "svelte/store";
import { z } from "zod";
import {
  base32decode,
  base32encode,
  generateAccountID,
  ParseError,
  TOTPCalculator,
  type TOTPAccount as UnencryptedTOTPAccount,
  TOTPAccount_schema as UnencryptedTOTPAccount_schema,
} from "./totp";
import { decrypt, deriveKey, encrypt, generateSaltAndIV } from "./encryption";

// TODO: support WebAuthn PRF
const EncryptionMethod_schema = z.enum(["password", "none"]);
export type EncryptionMethod = z.infer<typeof EncryptionMethod_schema>;
// Replace 'secret: Uint8Array' with 'encryptedSecret: Uint8Array'
const EncryptedTOTPAccount_schema = UnencryptedTOTPAccount_schema.omit({
  secret: true,
}).merge(z.object({ encryptedSecret: z.instanceof(Uint8Array) }));
type EncryptedTOTPAccount = z.infer<typeof EncryptedTOTPAccount_schema>;

const SCHEMA_VERSION = 1;
// Replace 'secret: Uint8Array' with 'secret: string'
const EncodedUnencryptedTOTPAccount_schema =
  UnencryptedTOTPAccount_schema.merge(z.object({ secret: z.string() }));
export type EncodedUnencryptedTOTPAccount = z.infer<
  typeof EncodedUnencryptedTOTPAccount_schema
>;
// Replace 'encryptedSecret: Uint8Array' with 'encryptedSecret: string'
const EncodedEncryptedTOTPAccount_schema = EncryptedTOTPAccount_schema.merge(
  z.object({ encryptedSecret: z.string() }),
);
export type EncodedEncryptedTOTPAccount = z.infer<
  typeof EncodedEncryptedTOTPAccount_schema
>;
const EncodedUserSettings_schema = z
  .object({
    version: z.number(),
    hideCodes: z.boolean(),
  })
  .and(
    z.union([
      z.object({
        encryptionMethod: z.literal("password"),
        salt: z.string(), // for PBKDF2 (base32-encoded)
        iv: z.string(), // for AES-GCM (base32-encoded)
        encryptedSalt: z.string(), // for verifying a password
        accounts: z.array(EncodedEncryptedTOTPAccount_schema),
      }),
      z.object({
        encryptionMethod: z.literal("none"),
        accounts: z.array(EncodedUnencryptedTOTPAccount_schema),
      }),
    ]),
  );
export type EncodedUserSettings = z.infer<typeof EncodedUserSettings_schema>;

export type EncryptedUserSettings = {
  hideCodes: boolean;
  encryptionMethod: "password";
  iv: Uint8Array;
  salt: Uint8Array;
  encryptedSalt: Uint8Array;
  encryptedAccounts: EncryptedTOTPAccount[];
};
export type UnencryptedUserSettings = {
  hideCodes: boolean;
  accounts: UnencryptedTOTPAccount[];
} & (
  | {
      encryptionMethod: "password";
      key: CryptoKey;
      iv: Uint8Array;
      salt: Uint8Array;
    }
  | {
      encryptionMethod: "none";
    }
);
export type UserSettings = EncryptedUserSettings | UnencryptedUserSettings;

export function settingsAreEncrypted(
  settings: UserSettings,
): settings is EncryptedUserSettings {
  return settings.hasOwnProperty("encryptedAccounts");
}

// TODO: request "persistent" storage
// https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

export const LOCALSTORAGE_SETTINGS_KEY = "pwa-otp-settings";

function decodeSettings(encodedSettings_: unknown): UserSettings | Error {
  const parseResult = EncodedUserSettings_schema.safeParse(encodedSettings_);
  if (!parseResult.success) {
    return parseResult.error;
  }
  const encodedSettings = parseResult.data;
  if (encodedSettings.version !== SCHEMA_VERSION) {
    return new ParseError(
      `Version mismatch: expected ${SCHEMA_VERSION}, got ${encodedSettings.version}`,
    );
  }
  const { encryptionMethod, hideCodes } = encodedSettings;
  if (encryptionMethod === "password") {
    const iv = base32decode(encodedSettings.iv);
    if (iv instanceof ParseError) return iv;
    const salt = base32decode(encodedSettings.salt);
    if (salt instanceof ParseError) return salt;
    const encryptedAccounts: EncryptedTOTPAccount[] = new Array(
      encodedSettings.accounts.length,
    );
    for (let i = 0; i < encodedSettings.accounts.length; i++) {
      const encodedAccount = encodedSettings.accounts[i];
      const encryptedSecret = base32decode(encodedAccount.encryptedSecret);
      if (encryptedSecret instanceof ParseError) return encryptedSecret;
      encryptedAccounts[i] = {
        ...encodedAccount,
        encryptedSecret,
      };
    }
    const encryptedSalt = base32decode(encodedSettings.encryptedSalt);
    if (encryptedSalt instanceof ParseError) return encryptedSalt;
    return {
      encryptionMethod,
      iv,
      salt,
      encryptedSalt,
      encryptedAccounts,
      hideCodes,
    };
  } else if (encryptionMethod === "none") {
    const accounts: UnencryptedTOTPAccount[] = new Array(
      encodedSettings.accounts.length,
    );
    for (let i = 0; i < encodedSettings.accounts.length; i++) {
      const encodedAccount = encodedSettings.accounts[i];
      const secret = base32decode(encodedAccount.secret);
      if (secret instanceof ParseError) return secret;
      accounts[i] = {
        ...encodedAccount,
        secret,
      };
    }
    return { encryptionMethod, accounts, hideCodes };
  } else {
    // Should never get here
    return new ParseError(
      `Invalid encryption method ${(encodedSettings as any).encryptionMethod}`,
    );
  }
}

type SettingsStoreType = UserSettings | null;

export function settingsAreReady(
  s: SettingsStoreType,
): s is UnencryptedUserSettings {
  return s !== null && !settingsAreEncrypted(s);
}

function getStoredSettings(): UserSettings | Error | null {
  const settingsStr = localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY);
  if (!settingsStr) {
    return null;
  }
  let encodedSettings: unknown;
  try {
    encodedSettings = JSON.parse(settingsStr);
  } catch (err) {
    return new ParseError("Invalid JSON");
  }
  return decodeSettings(encodedSettings);
}

export async function encodeSettings(
  settings: UnencryptedUserSettings,
): Promise<EncodedUserSettings> {
  const { encryptionMethod } = settings;
  if (encryptionMethod === "password") {
    const promises = settings.accounts.map((account) =>
      encrypt({
        key: settings.key,
        iv: settings.iv,
        data: account.secret,
      }),
    );
    const encryptedSecrets = await Promise.all(promises);
    const encryptedSalt = await encrypt({
      key: settings.key,
      iv: settings.iv,
      data: settings.salt,
    });
    return {
      version: SCHEMA_VERSION,
      hideCodes: settings.hideCodes,
      accounts: settings.accounts.map((account, i) => {
        const { secret, ...accountWithoutSecret } = account;
        return {
          ...accountWithoutSecret,
          encryptedSecret: base32encode(encryptedSecrets[i]),
        };
      }),
      encryptionMethod,
      iv: base32encode(settings.iv),
      salt: base32encode(settings.salt),
      encryptedSalt: base32encode(encryptedSalt),
    };
  } else if (encryptionMethod === "none") {
    return {
      version: SCHEMA_VERSION,
      hideCodes: settings.hideCodes,
      accounts: settings.accounts.map((account) => ({
        ...account,
        secret: base32encode(account.secret),
      })),
      encryptionMethod,
    };
  } else {
    // Should never get here
    throw new ParseError(
      `Invalid encryption method ${(settings as any).encryptionMethod}`,
    );
  }
}

function saveEncoded(encodedSettings: EncodedUserSettings) {
  localStorage.setItem(
    LOCALSTORAGE_SETTINGS_KEY,
    JSON.stringify(encodedSettings),
  );
}

async function save(settings: UnencryptedUserSettings) {
  const encodedSettings = await encodeSettings(settings);
  saveEncoded(encodedSettings);
}

function uint8ArraysAreEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

async function decryptSettings(
  settings: EncryptedUserSettings,
  password: string,
): Promise<UnencryptedUserSettings> {
  const key = await deriveKey(password, settings.salt);
  const promises = settings.encryptedAccounts.map(({ encryptedSecret }) =>
    decrypt({ key, iv: settings.iv, data: encryptedSecret }),
  );
  const decryptedSecrets = await Promise.all(promises);
  const decryptedSalt = await decrypt({
    key,
    iv: settings.iv,
    data: settings.encryptedSalt,
  });
  if (!uint8ArraysAreEqual(decryptedSalt, settings.salt)) {
    throw new Error("Decrypted salt does not match unencrypted salt");
  }
  return {
    encryptionMethod: "password",
    hideCodes: settings.hideCodes,
    accounts: settings.encryptedAccounts.map((account, i) => {
      const { encryptedSecret, ...accountWithoutSecret } = account;
      return {
        ...accountWithoutSecret,
        secret: decryptedSecrets[i],
      };
    }),
    iv: settings.iv,
    salt: settings.salt,
    key,
  };
}

/**
 * Updates the settings using the given callback if the settings are non-null
 * and decrypted. If the settings are updated, they will be (asynchronously)
 * saved to localStorage.
 * @param update The Svelte store "update" function
 * @param f The callback which updates the settings
 */
async function updateAsync(
  update: (f: Updater<SettingsStoreType>) => void,
  f: (s: UnencryptedUserSettings) => UnencryptedUserSettings,
) {
  let updated: SettingsStoreType = null;
  update((s: SettingsStoreType) => {
    if (settingsAreReady(s)) {
      s = f(s);
      updated = s;
    }
    return s;
  });
  if (updated) {
    await save(updated);
  }
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsStoreType>(null);
  return {
    set,
    subscribe,
    async createWithoutEncryption() {
      const newSettings: UnencryptedUserSettings = {
        encryptionMethod: "none",
        hideCodes: false,
        accounts: [],
      };
      await save(newSettings);
      set(newSettings);
    },
    async createWithPassword(password: string) {
      const { salt, iv } = generateSaltAndIV();
      const newSettings: UnencryptedUserSettings = {
        hideCodes: false,
        encryptionMethod: "password",
        key: await deriveKey(password, salt),
        iv,
        salt,
        accounts: [],
      };
      await save(newSettings);
      set(newSettings);
    },
    importSettings(imported: unknown) {
      const encoded = EncodedUserSettings_schema.parse(imported);
      const decoded = decodeSettings(encoded);
      if (decoded instanceof Error) {
        throw decoded;
      }
      saveEncoded(encoded);
      set(decoded);
    },
    async addOrChangePassword(
      oldSettings: UnencryptedUserSettings,
      password: string,
    ) {
      const { salt, iv } = generateSaltAndIV();
      const newSettings: UnencryptedUserSettings = {
        hideCodes: oldSettings.hideCodes,
        encryptionMethod: "password",
        key: await deriveKey(password, salt),
        iv,
        salt,
        accounts: oldSettings.accounts,
      };
      await save(newSettings);
      set(newSettings);
    },
    async decrypt(encryptedSettings: EncryptedUserSettings, password: string) {
      const decryptedSettings = await decryptSettings(
        encryptedSettings,
        password,
      );
      set(decryptedSettings);
    },
    async addAccount(formAccount: Omit<UnencryptedTOTPAccount, "id">) {
      await updateAsync(update, (s) => {
        const id = generateAccountID();
        const account: UnencryptedTOTPAccount = { ...formAccount, id };
        s.accounts.push(account);
        return s;
      });
    },
    async removeAccount(accountID: string) {
      await updateAsync(update, (s) => {
        s.accounts = s.accounts.filter((account) => account.id !== accountID);
        return s;
      });
    },
    async setAccountIssuer(accountID: string, issuer: string) {
      await updateAsync(update, (s) => {
        for (const account of s.accounts) {
          if (account.id === accountID) {
            account.issuer = issuer;
            break;
          }
        }
        return s;
      });
    },
    async toggleHideCodes() {
      await updateAsync(update, (s) => {
        s.hideCodes = !s.hideCodes;
        return s;
      });
    },
    async setAccounts(accounts: UnencryptedTOTPAccount[]) {
      await updateAsync(update, (s) => {
        s.accounts = accounts;
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
export const settingsError = writable<Error | null>(null);

export function initializeSettingsStore() {
  // TODO: do computation in Worker instead of delaying startup
  const initialSettings = getStoredSettings();
  if (initialSettings instanceof Error) {
    settingsError.set(initialSettings);
  } else {
    settings.set(initialSettings);
  }
}

/**
 * @returns undefined if the settings are null or encrypted; null if the
 *   settings are loaded but the account does not exist; or the account in
 *   settings.account with the given ID
 */
export function getAccountByID(
  settings: SettingsStoreType,
  accountID: string,
): UnencryptedTOTPAccount | undefined | null {
  if (!settingsAreReady(settings)) {
    return undefined;
  }
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
    if (!settingsAreReady($settings)) {
      return;
    }
    // TODO: consider using https://github.com/square/svelte-store to simplify
    // async logic
    update((totpCalculators) => {
      const validAccountIDs = new Set<string>();
      // Create calculators for new accounts
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
      // Remove calculators of deleted accounts
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
