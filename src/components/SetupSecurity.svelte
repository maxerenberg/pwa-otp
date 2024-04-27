<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import { settings, type EncryptionMethod } from "../lib/userSettings";
  import { redirectTo } from "../lib/routing";
  import commonStyles from "./common.module.css";
  import styles from "./SetupSecurity.module.css";

  let encryptionMethod: EncryptionMethod = "password";

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    if (encryptionMethod === "none") {
      // TODO: disable button while waiting
      await settings.createWithoutEncyprtion();
      redirectTo("/");
    } else {
      redirectTo("/#/setup/security/password");
    }
  }
</script>

<Header title="Setup security" backHref="/" />

<main class={commonStyles.mainCenter}>
  <p>
    This application stores TOTP secrets in
    <a
      href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
      >localStorage</a
    >. How would you like to encrypt these secrets?
  </p>
  <form on:submit={onSubmit} class={styles.form}>
    <fieldset>
      <legend class={commonStyles.srOnly}>Password encryption method</legend>
      <label>
        <input type="radio" value="password" bind:group={encryptionMethod} /> Password
      </label>
      <label>
        <input type="radio" value="none" bind:group={encryptionMethod} /> No encryption
      </label>
    </fieldset>
    <Button class={commonStyles.largeBoldButton} type="submit">Continue</Button>
  </form>
</main>
