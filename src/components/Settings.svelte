<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import IfSettings from "./IfSettings.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import {
    encodeSettings,
    settings,
    settingsAreEncrypted,
  } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./Settings.module.css";

  // TODO: disable button while waiting
  async function downloadSettings() {
    if (!$settings || settingsAreEncrypted($settings)) {
      // Should never get here
      return;
    }
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
  }
</script>

<Header title="Settings" backHref="/" />

<IfSettings allowEncrypted>
  <main class={commonStyles.appMain}>
    <section class={styles.section}>
      <h3 class={styles.sectionTitle}>ACCOUNT</h3>
      <!-- TODO: add option to add/modify password (only if already unlocked) -->
      <!-- TODO: add option to upload settings -->
      <!-- TODO: add "About" option which shows git commit hash used at build time
           (see https://stackoverflow.com/q/70436753) -->
      <!-- TODO: add option to check for updates -->
      <ul class={styles.sectionList}>
        <li>
          <Link href="/#/settings/delete-account" class="text-decoration-none">
            <span>Delete account</span>
            <AngleRight />
          </Link>
        </li>
        {#if $settings && !settingsAreEncrypted($settings)}
          <li>
            <button on:click={downloadSettings}>
              <span>Download settings</span>
              <AngleRight />
            </button>
          </li>
        {/if}
      </ul>
    </section>
  </main>
</IfSettings>
