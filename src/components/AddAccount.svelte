<script lang="ts">
  import Header from "./Header.svelte";
  import NoSettings from "./NoSettings.svelte";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./AddAccount.module.css";
  import Button from "./Button.svelte";

  let issuer = "";
  let name = "";
  let secret = "";
  let numDigitsStr: "6" | "8" = "6";

  $: valid = !!(issuer && name && secret);

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    // TODO: add account
  }
</script>

<Header title="Add account" backHref="/" />

{#if $settings}
  <main class={commonStyles.appMain}>
    <form class={styles.form} on:submit={onSubmit}>
      <h3 class={styles.sectionTitle}>ACCOUNT INFO</h3>
      <div class={styles.textInputs}>
        <input
          placeholder="Issuer (e.g. Google)"
          bind:value={issuer}
          type="text"
          required
        />
        <input
          placeholder="Name (e.g. jdoe@gmail.com)"
          bind:value={name}
          type="text"
          required
        />
        <input
          placeholder="Secret (base32-encoded)"
          bind:value={secret}
          type="text"
          required
        />
      </div>
      <fieldset class={styles.digitsFieldset}>
        <!-- I don't want to use a <legend> here because float:left doesn't
             seem to work on it in iOS Safari -->
        <div class={styles.legend}>Digits:</div>
        <label>
          <input type="radio" value="6" bind:group={numDigitsStr} /> 6
        </label>
        <label>
          <input type="radio" value="8" bind:group={numDigitsStr} /> 8
        </label>
      </fieldset>
      <Button type="submit" disabled={!valid}>Finish</Button>
    </form>
  </main>
{:else}
  <NoSettings />
{/if}
