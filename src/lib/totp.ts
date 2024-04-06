export class ParseError extends Error {}

// See https://en.wikipedia.org/wiki/Base32#Base_32_Encoding_per_%C2%A76
export function base32decode(s: string): Uint8Array | ParseError {
  s = s.toUpperCase();
  s = s.replace(/=+$/, "");
  let value = 0;
  let numBits = 0;
  let arr: number[] = [];
  for (const c of s) {
    value <<= 5;
    if ("A" <= c && c <= "Z") {
      value += c.charCodeAt(0) - "A".charCodeAt(0);
    } else if ("2" <= c && c <= "7") {
      value += 26 + (c.charCodeAt(0) - "2".charCodeAt(0));
    } else {
      return new ParseError(`Invalid base32 character '${c}'`);
    }
    numBits += 5;
    if (numBits >= 8) {
      const numLowerBits = numBits - 8;
      arr.push(value >> numLowerBits);
      value &= (1 << numLowerBits) - 1;
      numBits -= 8;
    }
  }
  return new Uint8Array(arr);
}

const base32EncodeLookup: string[] = [];
for (let i = 0; i < 26; i++) {
  base32EncodeLookup.push(String.fromCharCode("A".charCodeAt(0) + i));
}
for (let i = 0; i < 6; i++) {
  base32EncodeLookup.push(String.fromCharCode("2".charCodeAt(0) + i));
}
export function base32encode(arr: Uint8Array): string {
  let chars: string[] = [];
  let value = 0;
  let numBits = 0;
  for (const b of arr) {
    value = (value << 8) + b;
    numBits += 8;
    while (numBits >= 5) {
      const numLowerBits = numBits - 5;
      chars.push(base32EncodeLookup[value >> numLowerBits]);
      value &= (1 << numLowerBits) - 1;
      numBits -= 5;
    }
  }
  if (numBits > 0) {
    chars.push(base32EncodeLookup[value << (5 - numBits)]);
  }
  return chars.join("");
}

const hashAlgorithms = ["SHA1", "SHA256", "SHA512"] as const;
export type HashAlgorithm = (typeof hashAlgorithms)[number];
export type Digits = 6 | 8;

export type TOTPAccount = {
  secret: Uint8Array; // unencrypted
  name: string;
  issuer?: string;
  algorithm: HashAlgorithm;
  digits: Digits;
};

/**
 * Converts an integer into an 8-byte Uint8Array in big-endian order
 */
function intToBytes(x: number): Uint8Array {
  // From https://www.ietf.org/rfc/rfc4226.txt:
  // "8-byte counter value, the moving factor"
  // "the Counter ... values are hashed high-order byte first"
  const arr = new Uint8Array(8);
  for (let i = 0; i < arr.length; i++) {
    arr[arr.length - 1 - i] = x & 0xff;
    // Note: we cannot use bitwise operators if either operand has more than
    // 32 bits, otherwise the upper bits get discarded. We cannot use BigInt
    // either because it is not supported on iOS Safari 12.5.
    // This will still fail if the input has more than 53 bits (as an unsigned
    // integer), since numbers are stored as 64-bit floats in Javascript. But
    // we know that the input will always be a Unix epoch timestamp, so this
    // should be fine.
    x /= 256;
  }
  return arr;
}

export class TOTPCalculator {
  private constructor(
    readonly account: TOTPAccount,
    private readonly cryptoKey: CryptoKey,
  ) {}

  static async factory(account: TOTPAccount): Promise<TOTPCalculator> {
    const { algorithm, secret } = account;
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secret,
      {
        name: "HMAC",
        // algorithm must have a hyphen, e.g. "SHA-1"
        hash: algorithm.substring(0, 3) + "-" + algorithm.substring(3),
      },
      false,
      ["sign"],
    );
    return new TOTPCalculator(account, cryptoKey);
  }

  /**
   * Calculates the TOTP value for the current account and time
   * @param unixTime time in seconds since the Unix epoch
   */
  async calculate(unixTime: number): Promise<number> {
    const { digits } = this.account;
    const interval = 30; // length of one time duration in seconds
    // Adapted from https://en.wikipedia.org/wiki/Time-based_one-time_password#Algorithm
    // and https://en.wikipedia.org/wiki/HMAC-based_one-time_password#Algorithm
    // and https://github.com/bellstrand/totp-generator/blob/master/src/index.ts
    const counter = Math.floor(unixTime / interval);
    const MAC = new Uint8Array(
      await crypto.subtle.sign("HMAC", this.cryptoKey, intToBytes(counter)),
    );
    // Take the least significant 4 bits (HOTP values are treated as big-endian)
    const i = MAC[MAC.length - 1] & 0xf;
    // Select the least signicant 31 bits from MAC[i:i+4]
    const truncated =
      ((MAC[i] & 0x7f) << 24) +
      (MAC[i + 1] << 16) +
      (MAC[i + 2] << 8) +
      MAC[i + 3];
    // Modulo 10^d
    return truncated % Math.pow(10, digits);
  }
}

type LabelInfo = {
  issuer: string | undefined;
  accountName: string;
};

function parseLabel(label: string): LabelInfo {
  label = decodeURIComponent(label);
  let accountName: string;
  let issuer: string | undefined;
  if (label.includes(":")) {
    const colonIdx = label.indexOf(":");
    issuer = label.substring(0, colonIdx);
    accountName = label.substring(colonIdx + 1);
  } else {
    accountName = label;
  }
  return { accountName, issuer };
}

// See https://github.com/google/google-authenticator/wiki/Key-Uri-Format
// TODO: accept optional decryption key
export function parseOTPAuthURL(urlStr: string): TOTPAccount | ParseError {
  const url = new URL(urlStr);
  if (url.protocol !== "otpauth:") {
    return new ParseError(
      `Expected protocol to be 'otpauth:', got '${url.protocol}'`,
    );
  }
  if (url.host !== "totp") {
    return new ParseError(`Expected type to be 'totp', got '${url.host}'`);
  }
  const secret = url.searchParams.get("secret");
  if (!secret) {
    return new ParseError("Missing parameter 'secret'");
  }
  const decodedSecret = base32decode(secret);
  if (decodedSecret instanceof ParseError) {
    return decodedSecret;
  }
  const labelInfo = parseLabel(url.pathname);
  const algorithm = url.searchParams.get("algorithm") ?? "SHA1";
  if (!hashAlgorithms.includes(algorithm as HashAlgorithm)) {
    return new ParseError(`Invalid algorithm '${algorithm}'`);
  }
  const digits = url.searchParams.has("digits")
    ? parseInt(url.searchParams.get("digits")!)
    : 6;
  if (digits !== 6 && digits !== 8) {
    return new ParseError(`Invalid digits: ${url.searchParams.get("digits")}`);
  }
  return {
    secret: decodedSecret,
    name: labelInfo.accountName,
    issuer: url.searchParams.get("issuer") ?? labelInfo.issuer,
    algorithm: algorithm as HashAlgorithm,
    digits,
  };
}

// TODO: accept optional encryption key
export function serializeTOTPAccountToURL(account: TOTPAccount): string {
  let label: string;
  if (account.issuer) {
    label =
      encodeURIComponent(account.issuer) +
      ":" +
      encodeURIComponent(account.name);
  } else {
    label = encodeURIComponent(account.name);
  }
  let url = new URL("otpauth://totp/" + label);
  // TODO: encrypt secret with password if user has one
  url.searchParams.append("secret", base32encode(account.secret));
  if (account.issuer) {
    url.searchParams.append("issuer", account.issuer);
  }
  url.searchParams.append("algorithm", account.algorithm);
  url.searchParams.append("digits", account.digits.toString());
  return url.toString().replace("+", "%20");
}
