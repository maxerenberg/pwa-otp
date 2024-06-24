<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings, settingsAreEncrypted } from "../lib/userSettings";
  import { redirectTo } from "../lib/routing";
  import commonStyles from "./common.module.css";
  import styles from "./form.module.css";

  export let backHref = "/#/setup/security";
  export let nextHref = "/";

  // The autofocus attribute doesn't work in Svelte
  let ref: HTMLInputElement | null = null;
  onMount(() => ref?.focus());

  let password = "";
  let password2 = "";
  let showErrorMessage = false;
  let inProgress = false;

  function onPasswordInput(ev: Event) {
    showErrorMessage = false;
    password = (ev.target as HTMLInputElement).value;
  }

  function onPassword2Input(ev: Event) {
    showErrorMessage = false;
    password2 = (ev.target as HTMLInputElement).value;
  }

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    if (password !== password2) {
      showErrorMessage = true;
      return;
    }
    inProgress = true;
    try {
      if ($settings) {
        if (settingsAreEncrypted($settings)) {
          // Should never get here
          throw new Error(
            "Tried to add/change password when UI should have been locked",
          );
        }
        await settings.addOrChangePassword($settings, password);
      } else {
        await settings.createWithPassword(password);
      }
      redirectTo(nextHref);
    } finally {
      inProgress = false;
    }
  }
</script>

<Header title="Create password" {backHref} />

<main class={commonStyles.mainCenter}>
  <form on:submit={onSubmit} class={styles.form}>
    <label for="new-password">Please create a new password:</label>
    <input
      class={styles.input}
      id="new-password"
      type="password"
      autocomplete="new-password"
      required
      on:input={onPasswordInput}
      bind:this={ref}
    />
    <label for="confirm-new-password">Please confirm your password:</label>
    <input
      class={styles.input}
      id="confirm-new-password"
      type="password"
      required
      on:input={onPassword2Input}
    />
    {#if showErrorMessage}
      <div class={styles.formErrorMessage}>Passwords do not match</div>
    {/if}
    <Button
      class={commonStyles.largeBoldButton}
      type="submit"
      disabled={!password || !password2 || inProgress}>Continue</Button
    >
  </form>
</main>
