<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import { settings, type EncryptedUserSettings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./PaswordInput.module.css";

  let password = "";
  let showIncorrectPasswordError = false;
  export let encryptedSettings: EncryptedUserSettings;

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    // TODO: disable button while waiting
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

<Header title="Enter password" />

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
      <div class="errorMessage">Incorrect password</div>
    {/if}
    <Button
      class={commonStyles.largeBoldButton}
      type="submit"
      disabled={!password}>Continue</Button
    >
  </form>
</main>

<style>
  .errorMessage {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--form-error-msg-color);
  }
</style>
