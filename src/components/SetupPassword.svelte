<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import Spinner from "./Spinner.svelte";
  import {
    settings,
    settingsAreEncrypted,
    verifyPassword,
  } from "../lib/userSettings";
  import { redirectTo } from "../lib/routing";
  import commonStyles from "./common.module.css";
  import styles from "./form.module.css";

  export let backHref = "/#/setup/security";
  export let nextHref = "/";

  let oldPasswordRef: HTMLInputElement | null = null;
  let newPasswordRef: HTMLInputElement | null = null;
  onMount(() => {
    if (oldPasswordRef) {
      oldPasswordRef.focus();
    } else if (newPasswordRef) {
      newPasswordRef.focus();
    }
  });

  const title =
    $settings && $settings.encryptionMethod === "password"
      ? "Change password"
      : "Create password";

  let oldPassword = "";
  let newPassword = "";
  let newPassword2 = "";
  let errorMessage = "";
  let inProgress = false;

  function onOldPasswordInput(ev: Event) {
    errorMessage = "";
    oldPassword = (ev.target as HTMLInputElement).value;
  }

  function onNewPasswordInput(ev: Event) {
    errorMessage = "";
    newPassword = (ev.target as HTMLInputElement).value;
  }

  function onNewPassword2Input(ev: Event) {
    errorMessage = "";
    newPassword2 = (ev.target as HTMLInputElement).value;
  }

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    if (inProgress) {
      return;
    }
    if ($settings && settingsAreEncrypted($settings)) {
      // Should never get here
      return;
    }
    if (newPassword !== newPassword2) {
      errorMessage = "Passwords do not match";
      return;
    }
    inProgress = true;
    try {
      if ($settings) {
        if ($settings.encryptionMethod === "password") {
          if (oldPassword === "") {
            errorMessage = "Must enter current password";
            return;
          }
          if (!(await verifyPassword($settings, oldPassword))) {
            errorMessage = "Current password is incorrect";
            return;
          }
        }
        await settings.addOrChangePassword($settings, newPassword);
      } else {
        await settings.createWithPassword(newPassword);
      }
      redirectTo(nextHref);
    } catch (err) {
      errorMessage = (err as Error).message;
    } finally {
      inProgress = false;
    }
  }
</script>

<Header {title} {backHref} />

<main class={commonStyles.mainCenter}>
  <form on:submit={onSubmit} class={styles.form}>
    {#if $settings && $settings.encryptionMethod === "password"}
      <label for="current-password">Please enter your current password:</label>
      <input
        class={styles.input}
        id="current-password"
        type="password"
        required
        on:input={onOldPasswordInput}
        bind:this={oldPasswordRef}
      />
    {/if}
    <label for="new-password">Please create a new password:</label>
    <input
      class={styles.input}
      id="new-password"
      type="password"
      autocomplete="new-password"
      required
      on:input={onNewPasswordInput}
      bind:this={newPasswordRef}
    />
    <label for="confirm-new-password">Please confirm your password:</label>
    <input
      class={styles.input}
      id="confirm-new-password"
      type="password"
      required
      on:input={onNewPassword2Input}
    />
    {#if errorMessage}
      <div class={styles.formErrorMessage}>{errorMessage}</div>
    {/if}
    <Button
      class={commonStyles.largeBoldButton}
      type="submit"
      disabled={!newPassword || !newPassword2 || inProgress}
    >
      Continue
      {#if inProgress}
        <Spinner stroke="#666" height="1em" class={styles.buttonSpinner} />
      {/if}
    </Button>
  </form>
</main>
