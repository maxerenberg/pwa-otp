<script lang="ts">
  import NoSettings from "./NoSettings.svelte";
  import { settings, type UserSettings } from "../lib/userSettings";

  // Workaround for a bug in the Svelte Typescript checker which is unable
  // to tell that $settings is non-null inside the slot prop assignment
  function ident(s: UserSettings): UserSettings {
    return s;
  }
</script>

{#if $settings}
  <slot settings={ident($settings)} />
{:else}
  <NoSettings />
{/if}
