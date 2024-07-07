<script lang="ts">
  import { ZodError } from "zod";
  import Header from "./Header.svelte";
  import FormattedZodError from "./FormattedZodError.svelte";
  import commonStyles from "./common.module.css";

  export let settingsError: Error;
</script>

<Header title="Error" />

<main class={commonStyles.mainCenter}>
  <p>Failed to load settings from localStorage. Please see errors below</p>
  {#if settingsError instanceof ZodError}
    <FormattedZodError error={settingsError} />
  {:else}
    <p>{settingsError.message}</p>
  {/if}
</main>
