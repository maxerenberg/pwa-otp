<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import commonStyles from "./common.module.css";
  import { settings, type EncryptionMethod } from "../lib/userSettings";
  import { redirectTo } from "../lib/routing";
  import styles from "./SetupSecurity.module.css";

  let encryptionMethod: EncryptionMethod = "password";

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    // TODO: support password encryption
    // TODO: support FIDO2 encryption
    if (encryptionMethod === "none") {
      settings.create(encryptionMethod);
      redirectTo("/");
    } else {
      console.error(`${encryptionMethod} is not supported yet`);
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
        <input
          type="radio"
          value="webauthn-prf"
          bind:group={encryptionMethod}
        /> WebAuthn PRF
      </label>
      <label>
        <input type="radio" value="none" bind:group={encryptionMethod} /> No encryption
      </label>
    </fieldset>
    <Button class={commonStyles.largeBoldButton} type="submit">Continue</Button>
  </form>
</main>
