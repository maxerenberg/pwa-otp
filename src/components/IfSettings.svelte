<script lang="ts">
  import NoSettings from "./NoSettings.svelte";
  import {
    settings,
    settingsAreEncrypted,
    type UserSettings,
  } from "../lib/userSettings";
  import EnterPassword from "./EnterPassword.svelte";

  // Workaround for a bug in the Svelte Typescript checker which is unable
  // to tell that $settings is non-null inside the slot prop assignment
  function ident(s: UserSettings): UserSettings {
    return s;
  }
</script>

{#if $settings}
  {#if settingsAreEncrypted($settings)}
    <EnterPassword encryptedSettings={$settings} />
  {:else}
    <slot settings={ident($settings)} />
  {/if}
{:else}
  <NoSettings />
{/if}
