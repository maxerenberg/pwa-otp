<script lang="ts">
  import Accounts from "./Accounts.svelte";
  import Welcome from "./Welcome.svelte";
  import { settings, settingsAreEncrypted } from "../lib/userSettings";
  import EnterPassword from "./EnterPassword.svelte";
</script>

{#if !$settings}
  <Welcome />
{:else if settingsAreEncrypted($settings)}
  <EnterPassword encryptedSettings={$settings} />
{:else}
  <!-- TODO: show error page if settingsError is non-null -->
  <Accounts accounts={$settings.accounts} hideCodes={$settings.hideCodes} />
{/if}
