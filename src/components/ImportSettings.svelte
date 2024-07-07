<script lang="ts">
  import { onMount } from "svelte";
  import { ZodError } from "zod";
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import Spinner from "./Spinner.svelte";
  import FormattedZodError from "./FormattedZodError.svelte";
  import { isInstalledAsPWA } from "../lib/pwa";
  import { redirectTo } from "../lib/routing";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import formStyles from "./form.module.css";
  import styles from "./ImportSettings.module.css";

  let inputRef: HTMLInputElement | null = null;
  let error: Error | null = null;
  let isProcessing = false;

  // Blob.text() is not available in iOS Safari 12.5
  function readTextFromFile(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async function onInputChange(ev: Event) {
    const fileList = (ev.target as HTMLInputElement).files;
    if (!fileList || fileList.length === 0) return;
    error = null;
    isProcessing = true;
    try {
      const text = await readTextFromFile(fileList[0]);
      const imported = JSON.parse(text);
      settings.importSettings(imported);
      redirectTo("/");
    } catch (err) {
      error = err as Error;
    } finally {
      isProcessing = false;
    }
  }
  onMount(() => {
    if (!inputRef) return;
    inputRef.addEventListener("change", onInputChange);
    return () => {
      inputRef!.removeEventListener("change", onInputChange);
    };
  });

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    redirectTo("/#/setup/security");
  }

  function onClickYes() {
    inputRef?.click();
  }

  const backHref = isInstalledAsPWA() ? "/" : "/#/setup/confirm-skip-pwa";
</script>

<Header title="Import settings" {backHref} />

<main class={commonStyles.mainCenter}>
  <p>Would you like to import existing settings?</p>
  {#if error}
    {#if error instanceof ZodError}
      <p class={styles.errorMessage}>
        Settings are invalid, please see errors below
      </p>
      <FormattedZodError {error} />
    {:else}
      <p class={styles.errorMessage}>{error.message}</p>
    {/if}
  {/if}
  <form on:submit={onSubmit}>
    <Button
      type="button"
      onclick={onClickYes}
      class={`${commonStyles.largeBoldButton} ${styles.button}`}
      disabled={isProcessing}
    >
      Yes
      {#if isProcessing}
        <Spinner stroke="#666" height="1em" class={formStyles.buttonSpinner} />
      {/if}
    </Button>
    <Button
      type="submit"
      class={`${commonStyles.largeBoldButton} ${styles.button}`}
      disabled={isProcessing}
    >
      No
    </Button>
    <input
      type="file"
      style="display:none"
      accept=".json,application/json"
      bind:this={inputRef}
    />
  </form>
</main>
