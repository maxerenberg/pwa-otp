<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings } from "../lib/userSettings";
  import NoSettings from "./NoSettings.svelte";
  import commonStyles from "./common.module.css";
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
      class={`${commonStyles.largeBoldButton} ${commonStyles.onlyButton}`}
      >Yes, delete my data</Button
    >
  </main>
{:else}
  <NoSettings />
{/if}
