<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings, type EncryptedUserSettings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./form.module.css";

  let password = "";
  let showIncorrectPasswordError = false;
  export let backHref: string | undefined = undefined;
  export let encryptedSettings: EncryptedUserSettings;

  // The autofocus attribute doesn't work in Svelte
  let ref: HTMLInputElement | null = null;
  onMount(() => ref?.focus());

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    try {
      await settings.decrypt(encryptedSettings, password);
    } catch (_err) {
      showIncorrectPasswordError = true;
    }
  }

  function onPasswordInput(ev: Event) {
    showIncorrectPasswordError = false;
    password = (ev.target as HTMLInputElement).value;
  }
</script>

<Header title="Enter password" {backHref} />

<main class={commonStyles.mainCenter}>
  <form on:submit={onSubmit}>
    <label for="current-password">Please enter your password:</label>
    <input
      class={styles.input}
      id="current-password"
      type="password"
      autocomplete="current-password"
      required
      on:input={onPasswordInput}
      bind:this={ref}
    />
    {#if showIncorrectPasswordError}
      <div class={styles.formErrorMessage}>Incorrect password</div>
    {/if}
    <Button
      class={commonStyles.largeBoldButton}
      type="submit"
      disabled={!password}>Continue</Button
    >
  </form>
</main>
