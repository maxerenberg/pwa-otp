type SaltAndIV = {
  salt: Uint8Array; // for PBKDF2
  iv: Uint8Array; // for AES
};

export function generateSaltAndIV(): SaltAndIV {
  return {
    salt: crypto.getRandomValues(new Uint8Array(16)),
    iv: crypto.getRandomValues(new Uint8Array(12)),
  };
}

export async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const baseKeySecret = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    baseKeySecret,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 },
    baseKey,
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt", "decrypt"],
  );
}

type EncryptionInput = {
  key: CryptoKey;
  iv: Uint8Array;
  data: Uint8Array;
};
type DecryptionInput = EncryptionInput;

export async function encrypt({
  key,
  iv,
  data,
}: EncryptionInput): Promise<Uint8Array> {
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new Uint8Array(encryptedBuffer);
}

export async function decrypt({
  key,
  iv,
  data,
}: DecryptionInput): Promise<Uint8Array> {
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new Uint8Array(decryptedBuffer);
}
