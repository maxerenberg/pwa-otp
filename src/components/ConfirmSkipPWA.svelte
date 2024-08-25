<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import Link from "./Link.svelte";
  import { isInstalledAsPWA, redirectAfterPWAInstallation } from "../lib/pwa";
  import commonStyles from "./common.module.css";
  import styles from "./ConfirmSkipPWA.module.css";

  $: if ($isInstalledAsPWA) {
    redirectAfterPWAInstallation();
  }
</script>

<Header title="Install PWA" backHref="/#/setup/install-pwa" />
<main class={commonStyles.mainCenter}>
  <p>
    Some browsers discard localStorage after a period of idle activity for sites
    which are not installed to the home screen. Since this app stores TOTP
    secrets in localStorage, this means that you could permamently lose your
    data. Are you absolutely sure that you do not want to install this app to
    your home screen?
  </p>
  <div class={styles.buttons}>
    <Link href="/#/setup/install-pwa" class="text-decoration-none">
      <Button class={`${commonStyles.largeBoldButton} ${styles.button}`}
        >Back</Button
      >
    </Link>
    <Link href="/#/setup/import" class="text-decoration-none">
      <Button
        class={`${commonStyles.largeBoldButton} ${styles.button}`}
        theme="danger">Yes</Button
      >
    </Link>
  </div>
</main>
