<script lang="ts">
  import { settingsError } from "../lib/userSettings";
  import LoadSettingsError from "./LoadSettingsError.svelte";
</script>

{#if $settingsError}
  <LoadSettingsError settingsError={$settingsError} />
{:else}
  <slot />
{/if}
