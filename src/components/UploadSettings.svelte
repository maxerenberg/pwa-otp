<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import IfSettings from "./IfSettings.svelte";
  import Button from "./Button.svelte";
  import Spinner from "./Spinner.svelte";
  import { GITHUB_PROJECT_URL } from "../lib/constants";
  import {
    encodeSettings,
    settings,
    settingsAreReady,
  } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./form.module.css";

  let ref: HTMLInputElement | null = null;
  onMount(() => ref?.focus());
  let uploadURL = "";
  let errorMessage = "";
  enum UploadState {
    Idle,
    Active,
    Failed,
    Succeeded,
  }
  let uploadState = UploadState.Idle;

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    if (!settingsAreReady($settings) || uploadState !== UploadState.Idle) {
      // Should never get here
      return;
    }
    uploadState = UploadState.Active;
    try {
      const encodedSettings = await encodeSettings($settings);
      const body = JSON.stringify(encodedSettings);
      const resp = await fetch(uploadURL, {
        method: "PUT",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Server responded with ${resp.status}: ${text}`);
      }
      uploadState = UploadState.Succeeded;
    } catch (err) {
      errorMessage = "Failed to upload settings: " + (err as Error).message;
      uploadState = UploadState.Failed;
    }
  }

  function onUploadURLInput(ev: Event) {
    uploadURL = (ev.target as HTMLInputElement).value;
    errorMessage = "";
    uploadState = UploadState.Idle;
  }
</script>

<IfSettings>
  <Header title="Upload settings" backHref="/#/settings" />
  <main class={commonStyles.mainCenter}>
    <p>
      Please follow
      <a href={`${GITHUB_PROJECT_URL}/scripts`}>these instructions</a> to receive
      the upload on your laptop or PC.
    </p>
    <form on:submit={onSubmit} class={styles.form}>
      <label for="upload-url">
        Please enter the URL to which your settings will be uploaded:
      </label>
      <input
        class={styles.input}
        id="upload-url"
        required
        bind:this={ref}
        on:input={onUploadURLInput}
      />
      {#if errorMessage}
        <div class={styles.formErrorMessage}>{errorMessage}</div>
      {:else if uploadState === UploadState.Succeeded}
        <div class={styles.formSuccessMessage}>
          Your settings were successfully uploaded.
        </div>
      {/if}
      <Button
        class={commonStyles.largeBoldButton}
        type="submit"
        disabled={!uploadURL || uploadState !== UploadState.Idle}
      >
        Upload
        {#if uploadState === UploadState.Active}
          <Spinner stroke="#666" height="1em" class={styles.buttonSpinner} />
        {/if}
      </Button>
    </form>
  </main>
</IfSettings>
