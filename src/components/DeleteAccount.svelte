<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings } from "../lib/userSettings";
  import NoSettings from "./NoSettings.svelte";
  import commonStyles from "./common.module.css";
  import Link from "./Link.svelte";

  let deleted = false;

  function onClick() {
    settings.reset();
    deleted = true;
  }
</script>

<Header title="Delete account" backHref="/#/settings" centerTitle />

{#if $settings}
  <main class={commonStyles.mainCenter}>
    <p>
      Are you sure you want to permanently delete all of your data? This action
      is irreversible.
    </p>
    <Button
      theme="danger"
      class={commonStyles.largeBoldButton}
      onclick={onClick}>Yes, delete my data</Button
    >
  </main>
{:else if deleted}
  <main class={commonStyles.mainCenter}>
    <p>Your account was successfully deleted.</p>
    <Link href="/" class="text-decoration-none">
      <Button class={commonStyles.largeBoldButton}>Return home</Button>
    </Link>
  </main>
{:else}
  <NoSettings />
{/if}
