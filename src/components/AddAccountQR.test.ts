import { readFile } from "node:fs/promises";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  afterAll,
  beforeAll,
  expect,
  test,
} from "vitest";

import App from "../App.svelte";
import {
  commonBeforeEach,
  commonAfterEach,
  encodedUnencryptedSettings,
  saveEncodedSettings,
} from "../test/utils";

beforeAll(() => {
  // See https://github.com/mebjas/html5-qrcode/blob/91a7d639512305cffc887a2f348209be97698635/src/html5-qrcode.ts#L654
  URL.createObjectURL = () => "";
  // See https://github.com/mebjas/html5-qrcode/blob/91a7d639512305cffc887a2f348209be97698635/src/html5-qrcode.ts#L657
  Object.defineProperty(Image.prototype, "onload", {
    set: function onload(callback: () => void) {
      setTimeout(callback);
    },
    configurable: true, // allows us to delete it later
  });
});
afterAll(() => {
  delete (URL as any).createObjectURL;
  delete Image.prototype.onload;
});

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);

// Skipping for now because this requires canvas
// TODO: use Playwright instead
test.skip("Add account from QR code picture", async () => {
  // Downloaded from https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992
  const pictureBytes = await readFile(
    "./src/test/TOTP-AcmeCo-jdoe@example.com.png",
  );
  const pictureFile = new File([pictureBytes], "qrcode.png", {
    type: "image/png",
  });
  const user = userEvent.setup();
  saveEncodedSettings(encodedUnencryptedSettings);
  render(App);
  let button = (
    await screen.findAllByRole("button", { name: "Add account" })
  )[0];
  expect(button).toBeDefined();
  await user.click(button);
  await user.click(await screen.findByRole("button", { name: "Scan QR code" }));
  await screen.findByRole("button", { name: "Scan from file instead" });
  const input = await screen.findByTestId("scan-qrcode-input");
  await user.upload(input, pictureFile);
  // Use a higher timeout because we need to do image processing
  await screen.findByRole("heading", { name: "Authenticator" });
  await screen.findByText("ACME Co");
  await screen.findByText("jdoe@example.com");
});
