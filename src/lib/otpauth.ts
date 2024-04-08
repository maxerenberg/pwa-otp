import {
  ParseError,
  base32decode,
  base32encode,
  hashAlgorithms,
  generateAccountID,
  type TOTPAccount,
  type HashAlgorithm,
} from "./totp";

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
  if (!urlStr.startsWith("otpauth://")) {
    return new ParseError("OTP auth URL must start with otpauth://");
  }
  if (!URL.canParse(urlStr)) {
    return new ParseError("OTP auth URL is malformed");
  }
  // If the protocol is not 'http:' or 'https:', the URL is not parsed
  // correctly (only in browser Javascript, Node.js works fine)
  urlStr = urlStr.replace(/^otpauth:/, "http:");
  const url = new URL(urlStr);
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
    id: generateAccountID(),
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
