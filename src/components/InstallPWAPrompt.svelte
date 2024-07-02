<script lang="ts">
  import * as Accordion from "../../node_modules/bits-ui/dist/bits/accordion";
  import Header from "./Header.svelte";
  import Item from "./InstallPWAPromptItem.svelte";
  import Button from "./Button.svelte";
  import Link from "./Link.svelte";
  import { redirectToSetupAfterPWAInstallation } from "../lib/pwa";
  import commonStyles from "./common.module.css";
  import styles from "./InstallPWAPrompt.module.css";

  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
  const value: string | undefined = (() => {
    const matches = /iPhone|Chrome|Firefox/.exec(navigator.userAgent);
    if (!matches || matches.length === 0) return undefined;
    if (matches[0] === "iPhone") return "Safari (iOS)";
    if (matches[0] === "Chrome") {
      if (navigator.maxTouchPoints > 0) return "Chrome (Android)";
      return "Chrome/Edge (desktop)";
    }
    if (matches[0] === "Firefox") return "Firefox";
    return undefined;
  })();
  redirectToSetupAfterPWAInstallation();
</script>

<Header title="Authenticator" />
<main class={commonStyles.mainCenter}>
  <p>
    This website is a Progressive Web App (PWA) and is best experienced when
    installed to the home screen. Please follow the instructions below for your
    browser:
  </p>
  <!-- TODO: include screenshots -->
  <Accordion.Root class={styles.root} {value}>
    <Item name="Safari (iOS)">
      <ol class={styles.content}>
        <li>Open the Share menu at the bottom of the browser</li>
        <li>Click "Add to Home Screen"</li>
      </ol>
    </Item>
    <Item name="Chrome/Edge (desktop)">
      <ol class={styles.content}>
        <li>Click the install icon in the URL bar</li>
        <li>Click the install button</li>
      </ol>
    </Item>
    <Item name="Chrome (Android)">
      <ol class={styles.content}>
        <li>Click the three-dots button in the top right corner</li>
        <li>Click "Add to Home screen"</li>
      </ol>
    </Item>
    <Item name="Firefox">
      <p class={styles.content}>
        Unfortunately Firefox does not support installing PWAs to the home
        screen at this time. Please use one of the other browsers above.
      </p>
    </Item>
  </Accordion.Root>
  <Link href="/#/setup/confirm-skip-pwa" class="text-decoration-none">
    <Button class={`${commonStyles.largeBoldButton} ${styles.skipButton}`}
      >Skip</Button
    >
  </Link>
</main>
