<script lang="ts">
  import Button from "flowbite-svelte/Button.svelte";
  import Header from "../Header.svelte";
  import commonStyles from "../common.module.css";
  import { settings, type EncryptionMethod } from "../../lib/userSettings";
  import { redirectTo } from "../../lib/routing";

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
  <form on:submit={onSubmit}>
    <fieldset>
      <legend class={commonStyles.srOnly}>Password encryption method</legend>
      <label>
        <input type="radio" value="password" bind:group={encryptionMethod} /> Password
      </label>
      <label>
        <input type="radio" value="fido2" bind:group={encryptionMethod} /> FIDO2
      </label>
      <label>
        <input type="radio" value="none" bind:group={encryptionMethod} /> No encryption
      </label>
    </fieldset>
    <Button color="primary" class="mt-8 text-lg font-bold" type="submit"
      >Continue</Button
    >
  </form>
</main>

<style>
  fieldset {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
  }
  /* Flexbox gap is not supported in Safari on iOS 12.5 */
  label:not(:nth-of-type(1)) {
    margin-top: 0.75rem;
  }
  input[type="radio"] {
    margin-right: 0.5rem;
  }
</style>
