import { expect, test } from "vitest";
import {
  base32decode,
  base32encode,
  TOTPCalculator,
  ParseError,
  parseOTPAuthURL,
  type Digits,
  type TOTPAccount,
} from "./totp";

// Test cases can be generated using Python, e.g.
// list(b"foo")
// base64.b32encode(b"foo")
const base32TestCases: [Uint8Array, string][] = [
  [new Uint8Array([]), ""],
  [new Uint8Array([102]), "MY"],
  [new Uint8Array([102, 111]), "MZXQ"],
  [new Uint8Array([102, 111]), "MZXQ"],
  [new Uint8Array([102, 111, 111]), "MZXW6"],
  [new Uint8Array([102, 111, 111, 98]), "MZXW6YQ"],
  [new Uint8Array([102, 111, 111, 98, 97]), "MZXW6YTB"],
  [new Uint8Array([102, 111, 111, 98, 97, 114]), "MZXW6YTBOI"],
];

test.each(base32TestCases)("encode(%o) -> %s", (decoded, encoded) => {
  expect(base32encode(decoded)).toBe(encoded);
});

test.each(base32TestCases)("%o = decode(%s)", (decoded, encoded) => {
  expect(base32decode(encoded)).toEqual(decoded);
});

// Test cases can be generated using oathtool, e.g.
// oathtool --totp --base32 --digits=6 --now="$(date -d @1712431528)" ABCDEFGHIJKLMNOPQRSTUVWXYZ

const totpTestCases: [Digits, number, string, number][] = [
  [6, 1712431528, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 604256],
  [6, 1712431558, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 609020],
  [6, 1712431558, "ABCDEFGHIJKLMNOPQRSTUVWX", 437820],
  [6, 1712431559, "ABCDEFGHIJKLMNOPQRSTUVWX", 437820],
  [6, 1712431560, "ABCDEFGHIJKLMNOPQRSTUVWX", 991150],
];

test.each(totpTestCases)(
  "TOTP(digits=%i, now=%i, secret=%s) -> %i",
  async (digits, now, encodedSecret, expected) => {
    const secret = base32decode(encodedSecret);
    if (secret instanceof ParseError) throw secret;
    const account = {
      secret,
      algorithm: "SHA1",
      digits,
    } as const;
    const calculator = await TOTPCalculator.factory(account);
    const code = await calculator.calculate(now);
    expect(code).toBe(expected);
  },
);

// Extracted from https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992
// Use `list(base64.b32decode("..."))` in Python to decode the secret
const otpauthTestCases: [string, Omit<TOTPAccount, "id">][] = [
  [
    "otpauth://totp/ACME%20Co:jdoe@example.com?secret=AUSJD7LZ5H27TAC7NW2IJMATDMVDUPUG&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30",
    {
      issuer: "ACME Co",
      name: "jdoe@example.com",
      secret: new Uint8Array([
        5, 36, 145, 253, 121, 233, 245, 249, 128, 95, 109, 180, 132, 176, 19,
        27, 42, 58, 62, 134,
      ]),
      algorithm: "SHA1",
      digits: 6,
    },
  ],
];
test.each(otpauthTestCases)("parseOTPAuthURL(url: %s)", (url, expected) => {
  const totpInfo = parseOTPAuthURL(url);
  expect(totpInfo).toEqual(expected);
});
