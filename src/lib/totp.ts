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
  if (numBits > 0) {
    arr.push(value);
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
    chars.push(base32EncodeLookup[value]);
  }
  return chars.join("");
}

const hashAlgorithms = ["SHA1", "SHA256", "SHA512"] as const;
type HashAlgorithm = (typeof hashAlgorithms)[number];

export type TOTPAccount = {
  // will be encrypted unless encryptionMethod === 'none'
  secret: Uint8Array;
  name: string;
  issuer: string | undefined;
  algorithm: HashAlgorithm;
  digits: 6 | 8;
};

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
export function parseOTPAuthURL(urlStr: string): TOTPAccount | ParseError {
  // Safari on iOS 12.5 does not support the URL constructor, so we need
  // the 'window' prefix
  const url = new window.URL(urlStr);
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
  let url = new window.URL("otpauth://totp/" + label);
  // TODO: encrypt secret with password if user has one
  url.searchParams.append("secret", base32encode(account.secret));
  if (account.issuer) {
    url.searchParams.append("issuer", account.issuer);
  }
  url.searchParams.append("algorithm", account.algorithm);
  url.searchParams.append("digits", account.digits.toString());
  return url.toString().replace("+", "%20");
}
