<script lang="ts">
  import Accounts from "./Accounts.svelte";
  import Welcome from "./Welcome.svelte";
  import { settings } from "../lib/userSettings";
</script>

{#if !$settings}
  <Welcome />
{:else}
  <!-- TODO: show error page if settingsError is non-null -->
  <Accounts accounts={$settings.accounts} />
{/if}
