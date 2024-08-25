<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import { isInstalledAsPWA } from "../lib/pwa";
  import commonStyles from "./common.module.css";

  $: getStartedHref = $isInstalledAsPWA
    ? "/#/setup/import"
    : "/#/setup/install-pwa";
</script>

<Header title="Authenticator" />

<main class={commonStyles.mainCenter}>
  <h2>Welcome to Authenticator!</h2>
  <p>
    This is an offline-only web application for managing
    <a href="https://en.wikipedia.org/wiki/Time-based_one-time_password">
      TOTP
    </a>
    codes for multi-factor authentication.
  </p>
  <Link href={getStartedHref} class="text-decoration-none">
    <Button class={commonStyles.largeBoldButton}>Get started</Button>
  </Link>
</main>

<style>
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
</style>
