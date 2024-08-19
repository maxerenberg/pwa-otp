<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import IfSettings from "./IfSettings.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import Spinner from "./Spinner.svelte";
  import {
    isInstalledAsPWA,
    updateServiceWorkerWithoutReload,
  } from "../lib/pwa";
  import {
    encodeSettings,
    settings,
    settingsAreEncrypted,
    settingsAreReady,
  } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./Settings.module.css";

  let isDownloading = false;
  async function downloadSettings() {
    if (!settingsAreReady($settings) || isDownloading) {
      // Should never get here
      return;
    }
    isDownloading = true;
    try {
      const encodedSettings = await encodeSettings($settings);
      const payload = JSON.stringify(encodedSettings);
      // The 'download' attribute does not work on iOS Safari 12.5
      if ("download" in HTMLAnchorElement.prototype) {
        const blob = new Blob([payload], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "settings.json";
        link.click();
      } else {
        // This won't actually download the file, it'll just open it a new tab
        // ... but I don't think there's anything else we can do here
        const url = "data:application/json;base64," + btoa(payload);
        window.open(url);
      }
    } finally {
      isDownloading = false;
    }
  }

  const canCheckForUpdates = isInstalledAsPWA();
  let isCheckingForUpdates = false;
  async function checkForUpdates() {
    isCheckingForUpdates = true;
    try {
      await updateServiceWorkerWithoutReload();
    } finally {
      isCheckingForUpdates = false;
    }
  }

  // Disable this feature for now because the app is installed from
  // an HTTPS site but running a local server on a laptop will be
  // running over plain HTTP, preventing the upload
  const enableUploadSettings = false;
</script>

<Header title="Settings" backHref="/" />

<IfSettings allowEncrypted>
  <main class={commonStyles.appMain}>
    {#if $settings && settingsAreEncrypted($settings)}
      <div class={styles.lockedWarning}>
        NOTE: your account is currently locked, so some options are not shown.
        Click
        <Link
          href={`/?next=${encodeURIComponent("/#/settings")}#/enter-password`}
        >
          here
        </Link> to unlock it.
      </div>
    {/if}
    <section class={styles.section}>
      <h3 class={styles.sectionTitle}>ACCOUNT</h3>
      <ul class={styles.sectionList}>
        <li>
          <Link href="/#/settings/delete-account" class="text-decoration-none">
            <span>Delete account</span>
            <AngleRight />
          </Link>
        </li>
        {#if settingsAreReady($settings)}
          <li>
            <button on:click={downloadSettings} disabled={isDownloading}>
              <span>Download settings</span>
              {#if isDownloading}
                <Spinner
                  stroke="var(--app-section-icon-color)"
                  height="1.25em"
                  class={styles.spinner}
                />
              {:else}
                <AngleRight />
              {/if}
            </button>
          </li>
          {#if enableUploadSettings}
            <li>
              <Link href="/#/settings/upload" class="text-decoration-none">
                <span>Upload settings</span>
                <AngleRight />
              </Link>
            </li>
          {/if}
          <li>
            <Link href="/#/settings/password" class="text-decoration-none">
              <span
                >{$settings.encryptionMethod === "none" ? "Add" : "Change"} password</span
              >
              <AngleRight />
            </Link>
          </li>
        {/if}
      </ul>
    </section>
    <section class={styles.section}>
      <h3 class={styles.sectionTitle}>SYSTEM</h3>
      <ul class={styles.sectionList}>
        {#if canCheckForUpdates}
          <li>
            <button on:click={checkForUpdates} disabled={isCheckingForUpdates}>
              <span>Check for updates</span>
              {#if isCheckingForUpdates}
                <Spinner
                  stroke="var(--app-section-icon-color)"
                  height="1.25em"
                  class={styles.spinner}
                />
              {:else}
                <AngleRight />
              {/if}
            </button>
          </li>
        {/if}
        <li>
          <div>
            <span>Commit hash</span>
            <span>{import.meta.env.VITE_APP_COMMIT_HASH || "unknown"}</span>
          </div>
        </li>
      </ul>
    </section>
  </main>
</IfSettings>
