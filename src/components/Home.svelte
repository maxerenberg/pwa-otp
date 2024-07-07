<script lang="ts">
  import Accounts from "./Accounts.svelte";
  import Welcome from "./Welcome.svelte";
  import LoadSettingsError from "./LoadSettingsError.svelte";
  import {
    settings,
    settingsAreEncrypted,
    settingsError,
  } from "../lib/userSettings";
  import EnterPassword from "./EnterPassword.svelte";
</script>

{#if settingsError}
  <LoadSettingsError {settingsError} />
{:else if !$settings}
  <Welcome />
{:else if settingsAreEncrypted($settings)}
  <EnterPassword encryptedSettings={$settings} />
{:else}
  <Accounts accounts={$settings.accounts} hideCodes={$settings.hideCodes} />
{/if}
