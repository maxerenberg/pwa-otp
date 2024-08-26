<script lang="ts">
  import { onMount } from "svelte";
  import type { Html5Qrcode } from "html5-qrcode";
  import Button from "./Button.svelte";
  import IfSettings from "./IfSettings.svelte";
  import Header from "./Header.svelte";
  import { redirectTo } from "../lib/routing";
  import { ParseError, parseOTPAuthURL } from "../lib/totp";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./AddAccountQR.module.css";

  // Use https://gist.github.com/kcramer/c6148fb906e116d84e4bde7b2ab56992 for testing

  let inputRef: HTMLInputElement | null = null;
  let isProcessing = false;
  let scanner: Html5Qrcode | null = null;
  let triedToStartScanner = false;
  let errorMessage = "";
  // Use a dynamic import because this is a relatively large library
  const html5QrCodePromise = import("html5-qrcode");

  async function stopAndClearScanner() {
    if (!scanner) return;
    const { Html5QrcodeScannerState } = await html5QrCodePromise;
    if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      await scanner.stop();
    }
    scanner.clear();
  }

  async function startScanner() {
    if (!scanner) return;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure,
      );
    } finally {
      triedToStartScanner = true;
    }
  }

  async function onScanSuccess(decodedText: string) {
    isProcessing = true;
    try {
      await stopAndClearScanner();
      const totpInfo = parseOTPAuthURL(decodedText);
      if (totpInfo instanceof ParseError) {
        throw totpInfo;
      }
      await settings.addAccount(totpInfo);
      redirectTo("/");
    } catch (err: unknown) {
      errorMessage = (err as any).toString();
    } finally {
      isProcessing = false;
    }
  }

  function onScanFailure(err: string) {
    // NOTE: this gets called many times when a QR code hasn't been detected yet
  }

  async function initializeScanner() {
    errorMessage = "";
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } =
        await html5QrCodePromise;
      await stopAndClearScanner();
      scanner = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      await startScanner();
    } catch (err: unknown) {
      // Note: err can be a string if camera permission was denied
      errorMessage =
        "Failed to initializer scanner: " + (err as any).toString();
    }
  }

  async function onInputChange(ev: Event) {
    if (!scanner) return;
    const fileList = (ev.target as HTMLInputElement).files;
    if (!fileList || fileList.length === 0) return;
    errorMessage = "";
    // From the docs (https://scanapp.org/html5-qrcode-docs/docs/intro):
    // Note that inline scanning and file-based scanning are mutually exclusive at the moment.
    await stopAndClearScanner();
    try {
      const decodedText = await scanner.scanFile(fileList[0], true);
      await onScanSuccess(decodedText);
    } catch (err: unknown) {
      errorMessage = "Failed to scan file: " + (err as any).toString();
    }
  }

  function selectFileSource() {
    inputRef?.click();
  }

  onMount(() => {
    initializeScanner();
    inputRef?.addEventListener("change", onInputChange);
    return async () => {
      await stopAndClearScanner();
      inputRef?.removeEventListener("change", onInputChange);
    };
  });
</script>

<IfSettings>
  <Header title="Add account" backHref="/#/add-account" />
  <main class={`${commonStyles.appMain} ${styles.main}`}>
    {#if errorMessage}
      <p class={styles.errorMessage}>{errorMessage}</p>
      <Button class={commonStyles.largeBoldButton} onclick={initializeScanner}>
        Try again
      </Button>
    {:else if !triedToStartScanner}
      <p>Initializing...</p>
    {/if}
    <div id="qr-reader" class={styles.qrReader}></div>
    {#if isProcessing}
      <p class={styles["mb-8"]}>Processing, please wait ...</p>
    {/if}
    {#if triedToStartScanner}
      <Button
        class={`${commonStyles.largeBoldButton} ${styles["mb-8"]}`}
        onclick={selectFileSource}
        disabled={isProcessing}
      >
        Scan from file instead
      </Button>
    {/if}
    <input
      type="file"
      style="display:none"
      accept="image/*"
      bind:this={inputRef}
      data-testid="scan-qrcode-input"
    />
  </main>
</IfSettings>
