<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import { type FadeParams, type FlyParams } from "svelte/transition";
  import Header from "./Header.svelte";
  import FormDialog from "./FormDialog.svelte";
  import IfSettings from "./IfSettings.svelte";
  import NoAccount from "./NoAccount.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import { getNormalizedPath, redirectTo } from "../lib/routing";
  import { getAccountByID, settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./AccountSettings.module.css";

  const accountID = new RegExp("^/#/account/([^/]+)/settings$").exec(
    getNormalizedPath(),
  )![1];
  // If we make this reactive, then the displayIssuer gets updated too late,
  // and we don't want the displayIssuer to be reactive, because it needs to
  // bind to the input
  const account = getAccountByID($settings, accountID);
  let displayIssuer = account?.issuer ?? "";
  let inputIssuer = displayIssuer;
  let renameAccountDialogOpen = false;
  const fadeTransitionConfig: FadeParams = { duration: 150 };
  const flyTransitionConfig: FlyParams = { duration: 150, y: 350 };

  async function onSubmitRenameAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!account) return;
    await settings.setAccountIssuer(account.id, inputIssuer);
    displayIssuer = inputIssuer;
    renameAccountDialogOpen = false;
  }

  async function onSubmitRemoveAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!account) return;
    await settings.removeAccount(account.id);
    redirectTo("/");
  }
</script>

<IfSettings>
  {#if account === null}
    <NoAccount />
  {:else if account}
    <Header title="Account settings" backHref={`/#/account/${accountID}`} />
    <!-- TODO: set max-width on inner content for desktop -->
    <main class={commonStyles.appMain}>
      <FormDialog
        bind:open={renameAccountDialogOpen}
        onSubmit={onSubmitRenameAccount}
        submitButtonText="Done"
        disabled={!inputIssuer}
      >
        <Dialog.Trigger
          slot="trigger"
          class={`${styles.section} ${styles.accountNameContainer}`}
        >
          <span>Account name</span>
          <div class={styles.nameAndArrow}>
            <span>{displayIssuer}</span>
            <AngleRight class={styles.arrow} />
          </div>
        </Dialog.Trigger>
        <svelte:fragment slot="above-buttons">
          <Dialog.Title class={styles.dialogTitle}>Rename account</Dialog.Title>
          <div class={styles.dialogInputContainer}>
            <!-- svelte-ignore a11y-autofocus -->
            <input
              bind:value={inputIssuer}
              class={styles.dialogInput}
              required
              autofocus
            />
          </div>
        </svelte:fragment>
      </FormDialog>
      <FormDialog
        onSubmit={onSubmitRemoveAccount}
        submitButtonText="Continue"
        hasCancel
      >
        <Dialog.Trigger
          slot="trigger"
          class={`${styles.section} ${styles.removeAccountContainer}`}
        >
          Remove account
        </Dialog.Trigger>
        <svelte:fragment slot="above-buttons">
          <Dialog.Title class={styles.dialogTitle}
            >Are you sure you want to remove this account?</Dialog.Title
          >
          <Dialog.Description class={styles.dialogDescription}>
            This action is irreversible.
          </Dialog.Description>
        </svelte:fragment>
      </FormDialog>
    </main>
  {/if}
</IfSettings>
