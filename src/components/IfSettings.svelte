<script lang="ts">
  import NoSettings from "./NoSettings.svelte";
  import {
    settings,
    settingsAreEncrypted,
    type UserSettings,
  } from "../lib/userSettings";
  import EnterPassword from "./EnterPassword.svelte";

  // If true, the slot will be shown even if the accounts are still encrypted
  export let allowEncrypted = false;

  // Workaround for a bug in the Svelte Typescript checker which is unable
  // to tell that $settings is non-null inside the slot prop assignment
  function ident(s: UserSettings): UserSettings {
    return s;
  }
</script>

<!-- TODO: move this logic up into the App/Home component -->

{#if $settings}
  {#if settingsAreEncrypted($settings) && !allowEncrypted}
    <EnterPassword encryptedSettings={$settings} />
  {:else}
    <slot settings={ident($settings)} />
  {/if}
{:else}
  <NoSettings />
{/if}
