<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings } from "../lib/userSettings";
  import { redirectTo } from "../lib/routing";
  import commonStyles from "./common.module.css";
  import styles from "./PaswordInput.module.css";

  // The autofocus attribute doesn't work in Svelte
  let ref: HTMLInputElement | null = null;
  onMount(() => ref?.focus());

  let password = "";

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    // TODO: disable button while waiting
    await settings.createWithPassword(password);
    redirectTo("/");
  }
</script>

<Header title="Choose password" backHref="/#/setup/security" />

<main class={commonStyles.mainCenter}>
  <form on:submit={onSubmit}>
    <label for="new-password">Please choose a password:</label>
    <input
      class={styles.input}
      id="new-password"
      type="password"
      autocomplete="new-password"
      required
      bind:value={password}
      bind:this={ref}
    />
    <Button
      class={commonStyles.largeBoldButton}
      type="submit"
      disabled={!password}>Continue</Button
    >
  </form>
</main>
