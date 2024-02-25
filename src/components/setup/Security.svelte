<script lang="ts">
  import Button from "flowbite-svelte/Button.svelte";
  import Header from "../Header.svelte";
  import commonStyles from "../common.module.css";

  let encryptionMethod: "password" | "fido2" | "none" = "password";

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    console.log(ev);
  }
</script>

<Header title="Setup security" />

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
  label:not(:nth-child(1)) {
    margin-top: 4px;
  }
  input[type="radio"] {
    margin-right: 0.5rem;
  }
</style>
