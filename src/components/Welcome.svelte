<script lang="ts">
  import Button from "flowbite-svelte/Button.svelte";
  import Link from "./Link.svelte";
  import commonStyles from "./common.module.css";
</script>

<main class={commonStyles.mainCenter}>
  <h2>Welcome to Authenticator!</h2>
  <p>
    This is an offline-only web application for managing
    <a href="https://en.wikipedia.org/wiki/Time-based_one-time_password">
      TOTP
    </a>
    codes for multi-factor authentication.
  </p>
  <!-- TODO: recommend user to install PWA. On iOS, make this mandatory. -->
  <!-- TODO: prompt user to import settings JSON file -->
  <Link href="/#/setup/security">
    <Button color="primary" class="text-lg font-bold">Get started</Button>
  </Link>
</main>

<style>
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
</style>
