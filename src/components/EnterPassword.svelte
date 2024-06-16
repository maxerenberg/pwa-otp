<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings, type EncryptedUserSettings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./PasswordInput.module.css";

  let password = "";
  let showIncorrectPasswordError = false;
  export let backHref: string | undefined = undefined;
  export let encryptedSettings: EncryptedUserSettings;

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    try {
      // FIXME: no error will be thrown if password was incorrect but user had no accounts
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
