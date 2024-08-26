import { nanoid } from "nanoid";
import { z } from "zod";

export class ParseError extends Error {}

// See https://en.wikipedia.org/wiki/Base32#Base_32_Encoding_per_%C2%A76
export function base32decode(s: string): Uint8Array | ParseError {
  s = s.toUpperCase();
  s = s.replace(/[= ]/g, "");
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

export const hashAlgorithms = ["SHA1", "SHA256", "SHA512"] as const;
export type HashAlgorithm = (typeof hashAlgorithms)[number];
const Digits_schema = z.union([z.literal(6), z.literal(8)]);
export type Digits = z.infer<typeof Digits_schema>;

export const TOTPAccount_schema = z.object({
  secret: z.instanceof(Uint8Array), // unencrypted
  name: z.string(), // e.g. "jdoe@gmail.com"
  issuer: z.string(), // e.g. "Google"
  algorithm: z.enum(hashAlgorithms),
  digits: Digits_schema,
  id: z.string(),
});
export type TOTPAccount = z.infer<typeof TOTPAccount_schema>;

export function generateAccountID(): string {
  return nanoid(10);
}

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

// TODO: allow this to be configurable per account
const INTERVAL = 30; // length of one time duration in seconds

export class TOTPCalculator {
  private constructor(
    private readonly cryptoKey: CryptoKey,
    private readonly digits: Digits,
  ) {}

  static async factory({
    algorithm,
    secret,
    digits,
  }: {
    algorithm: HashAlgorithm;
    secret: Uint8Array;
    digits: Digits;
  }): Promise<TOTPCalculator> {
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
    return new TOTPCalculator(cryptoKey, digits);
  }

  /**
   * Calculates the TOTP value for the current account and time
   * @param unixTime time in seconds since the Unix epoch
   */
  async calculate(unixTime: number): Promise<number> {
    const { digits } = this;
    // Adapted from https://en.wikipedia.org/wiki/Time-based_one-time_password#Algorithm
    // and https://en.wikipedia.org/wiki/HMAC-based_one-time_password#Algorithm
    // and https://github.com/bellstrand/totp-generator/blob/master/src/index.ts
    const counter = Math.floor(unixTime / INTERVAL);
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

export class CachingTOTPCalculator {
  private prevCounter = -1;

  private constructor(private readonly calculator: TOTPCalculator) {}

  static factory(
    calculator: TOTPCalculator | undefined,
  ): CachingTOTPCalculator | undefined {
    if (!calculator) return undefined;
    return new CachingTOTPCalculator(calculator);
  }

  /**
   * @returns undefined if the counter has not changed since the previous
   *   calculation
   */
  calculate(unixTime: number): Promise<number> | undefined {
    const counter = Math.floor(unixTime / INTERVAL);
    if (counter === this.prevCounter) return undefined;
    return this.calculator.calculate(unixTime).then((value) => {
      this.prevCounter = counter;
      return value;
    });
  }
}

export function otpCodeToStr(code: number, digits: Digits): string {
  const halfLen = digits / 2;
  const s = code.toString().padStart(digits, "0");
  return s.substring(0, halfLen) + " " + s.substring(halfLen);
}

// See https://github.com/google/google-authenticator/wiki/Key-Uri-Format
export function parseOTPAuthURL(
  url: string,
): Omit<TOTPAccount, "id"> | ParseError {
  const prefix = "otpauth://totp/";
  if (!url.startsWith(prefix)) {
    return new ParseError(`URL does not begin with '${prefix}': ${url}`);
  }
  url = url.substring(prefix.length);
  const colonIdx = url.indexOf(":");
  const qmarkIdx = url.indexOf("?");
  if (colonIdx === -1 || qmarkIdx === -1 || colonIdx >= qmarkIdx) {
    return new ParseError(`URL does not follow otpauth format: ${url}`);
  }
  const issuer = decodeURIComponent(url.substring(0, colonIdx));
  const name = decodeURIComponent(url.substring(colonIdx + 1, qmarkIdx));
  const params = url
    .substring(qmarkIdx + 1)
    .split("&")
    .map((s) => decodeURIComponent(s).split("="));
  let secret: Uint8Array | null = null;
  let algorithm: HashAlgorithm = "SHA1";
  let digits: Digits = 6;
  for (const [key, val] of params) {
    if (typeof val !== "string") {
      return new ParseError(`URL parameters are ill-formed: ${url}`);
    }
    if (key === "secret") {
      const decodedSecret = base32decode(val);
      if (decodedSecret instanceof ParseError) return decodedSecret;
      secret = decodedSecret;
    } else if (key === "issuer") {
      if (val !== issuer) {
        return new ParseError(
          `The issuer parameter ${val} is not equal to the label prefix ${issuer}`,
        );
      }
    } else if (key === "algorithm") {
      if (!hashAlgorithms.includes(val as any)) {
        return new ParseError(`Invalid hash algorithm ${val}`);
      }
      algorithm = val as HashAlgorithm;
    } else if (key === "digits") {
      const parsedVal = parseInt(val);
      if (!([6, 8] as const).includes(parsedVal as any)) {
        return new ParseError(`Invalid digits ${val}`);
      }
      digits = parsedVal as Digits;
    } else if (key === "period") {
      if (val !== "30") {
        return new ParseError(`Period must be 30: ${val}`);
      }
    } else {
      return new ParseError(`Unrecognized key '${key}'`);
    }
  }
  if (!secret) {
    return new ParseError("Secret is missing from URL");
  }
  return {
    secret,
    issuer,
    name,
    algorithm,
    digits,
  };
}
