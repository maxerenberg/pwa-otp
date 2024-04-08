import { expect, test } from "vitest";
import {
  base32decode,
  base32encode,
  TOTPCalculator,
  ParseError,
  type Digits,
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
