<script lang="ts">
  import Accounts from "./Accounts.svelte";
  import Header from "./Header.svelte";
  import Welcome from "./Welcome.svelte";
  import { settings } from "../lib/userSettings";
</script>

<Header title="Authenticator" />

{#if !$settings}
  <Welcome />
{:else}
  <!-- TODO: show error page if settingsError is non-null -->
  <Accounts accounts={$settings.accounts} />
{/if}
