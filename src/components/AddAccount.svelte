<script lang="ts">
  import Header from "./Header.svelte";
  import IfSettings from "./IfSettings.svelte";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./AddAccount.module.css";
  import Button from "./Button.svelte";
  import EyeSlashOutline from "./icons/EyeSlashOutline.svelte";
  import EyeOutline from "./icons/EyeOutline.svelte";
  import { base32decode, ParseError, type Digits } from "../lib/totp";
  import { redirectTo } from "../lib/routing";

  let issuer = "";
  let name = "";
  let encodedSecret = "";
  let numDigitsStr: "6" | "8" = "6";
  let showInvalidSecretError = false;
  let hideSecret = true;

  $: valid = !!(issuer && name && encodedSecret);

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    const secret = base32decode(encodedSecret);
    if (secret instanceof ParseError) {
      showInvalidSecretError = true;
      return;
    }
    settings.addAccount({
      issuer,
      name,
      algorithm: "SHA1",
      secret,
      digits: parseInt(numDigitsStr) as Digits,
    });
    redirectTo("/");
  }

  function onSecretInput(ev: Event) {
    showInvalidSecretError = false;
    encodedSecret = (ev.target as HTMLInputElement).value;
  }

  function toggleHideSecret() {
    hideSecret = !hideSecret;
  }
</script>

<IfSettings>
  <Header title="Add account" backHref="/" />
  <main class={commonStyles.appMain}>
    <form class={styles.form} on:submit={onSubmit}>
      <h3 class={styles.sectionTitle}>ACCOUNT INFO</h3>
      <div class={styles.textInputs}>
        <input
          placeholder="Issuer (e.g. Google)"
          bind:value={issuer}
          required
        />
        <input
          placeholder="Name (e.g. jdoe@gmail.com)"
          bind:value={name}
          required
        />
        <div class={styles.secretContainer}>
          <input
            placeholder="Secret"
            on:input={onSecretInput}
            type={hideSecret ? "password" : "text"}
            required
          />
          <button
            class={styles.eyeButton}
            on:click={toggleHideSecret}
            type="button"
            aria-label={hideSecret ? "Show password" : "Hide password"}
          >
            {#if hideSecret}
              <EyeSlashOutline class={styles.eyeIcon} />
            {:else}
              <EyeOutline class={styles.eyeIcon} />
            {/if}
          </button>
        </div>
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
      {#if showInvalidSecretError}
        <div class={styles.errorMessage}>
          Secret must be a valid base32-encoded string.
        </div>
      {/if}
      <Button type="submit" disabled={!valid}>Finish</Button>
    </form>
  </main>
</IfSettings>
