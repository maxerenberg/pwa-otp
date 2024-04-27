import { generateSaltAndIV, deriveKey, encrypt, decrypt } from "./encryption";
import { expect, test } from "vitest";

// Generated using https://preshing.com/20110811/xkcd-password-generator/
const passwords = [
  "ever opportunity thick various",
  "loose act law chain",
  "market engine putting experiment",
];
// Generated using crypto.getRandomValues(new Uint8Array(32))
const unencryptedArrays = [
  new Uint8Array([
    147, 17, 222, 121, 42, 104, 236, 19, 50, 250, 240, 33, 146, 36, 113, 137,
    215, 238, 7, 252, 58, 1, 39, 211, 85, 100, 26, 100, 10, 239, 13, 33,
  ]),
  new Uint8Array([
    89, 119, 238, 63, 199, 213, 252, 89, 208, 229, 84, 10, 61, 112, 53, 167,
    183, 175, 198, 226, 43, 229, 105, 81, 117, 186, 33, 48, 113, 65, 18, 26,
  ]),
  new Uint8Array([
    252, 57, 193, 223, 8, 101, 136, 0, 103, 190, 204, 172, 21, 175, 189, 76, 46,
    140, 176, 29, 205, 252, 27, 72, 255, 120, 14, 48, 156, 48, 89, 39,
  ]),
];

const testCases: [string, Uint8Array][] = [];
for (const password of passwords) {
  for (const array of unencryptedArrays) {
    testCases.push([password, array]);
  }
}

test.concurrent.each(testCases)(
  "Encrypt/decrypt (%i)",
  async (password, unencryptedArray) => {
    // TODO: use deterministic salt and IV
    const { salt, iv } = generateSaltAndIV();
    const key = await deriveKey(password, salt);
    const encryptedArray = await encrypt({ key, iv, data: unencryptedArray });
    expect(unencryptedArray).to.not.equal(encryptedArray);

    const key2 = await deriveKey(password, salt);
    expect(key2).toEqual(key);
    const decryptedArray = await decrypt({
      key: key2,
      iv,
      data: encryptedArray,
    });
    expect(decryptedArray).toEqual(unencryptedArray);
  },
);
