<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import * as Separator from "../../node_modules/bits-ui/dist/bits/separator";
  import {
    fade,
    fly,
    type FadeParams,
    type FlyParams,
  } from "svelte/transition";
  import Header from "./Header.svelte";
  import IfSettings from "./IfSettings.svelte";
  import NoAccount from "./NoAccount.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import { getNormalizedPath, redirectTo } from "../lib/routing";
  import { getAccountByID, settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import dialogStyles from "./Dialog.module.css";
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

  function onSubmitRenameAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!account) return;
    settings.setAccountIssuer(account.id, inputIssuer);
    displayIssuer = inputIssuer;
    renameAccountDialogOpen = false;
  }

  function onSubmitRemoveAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!account) return;
    settings.removeAccount(account.id);
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
      <Dialog.Root bind:open={renameAccountDialogOpen}>
        <Dialog.Trigger
          class={`${styles.section} ${styles.accountNameContainer}`}
        >
          <span>Account name</span>
          <div class={styles.nameAndArrow}>
            <span>{displayIssuer}</span>
            <AngleRight class={styles.arrow} />
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            transition={fade}
            transitionConfig={fadeTransitionConfig}
            class={dialogStyles.overlay}
          />
          <Dialog.Content
            transition={fly}
            transitionConfig={flyTransitionConfig}
            class={`${dialogStyles.content} ${styles.dialogContent}`}
          >
            <Dialog.Title class={styles.dialogTitle}
              >Rename account</Dialog.Title
            >
            <form on:submit={onSubmitRenameAccount}>
              <div class={styles.dialogInputContainer}>
                <!-- svelte-ignore a11y-autofocus -->
                <input
                  bind:value={inputIssuer}
                  class={styles.dialogInput}
                  autofocus
                />
              </div>
              <Separator.Root class={styles.hSeparator} />
              <div class={styles.dialogButtons}>
                <button
                  type="submit"
                  class={styles.renameAccountSubmitButton}
                  disabled={!inputIssuer}>Done</button
                >
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root>
        <Dialog.Trigger
          class={`${styles.section} ${styles.removeAccountContainer}`}
        >
          Remove account
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            transition={fade}
            transitionConfig={fadeTransitionConfig}
            class={dialogStyles.overlay}
          />
          <Dialog.Content
            transition={fly}
            transitionConfig={flyTransitionConfig}
            class={`${dialogStyles.content} ${styles.dialogContent}`}
          >
            <Dialog.Title class={styles.dialogTitle}
              >Are you sure you want to remove this account?</Dialog.Title
            >
            <form on:submit={onSubmitRemoveAccount}>
              <Dialog.Description class={styles.dialogDescription}>
                This action is irreversible.
              </Dialog.Description>
              <Separator.Root class={styles.hSeparator} />
              <div class={styles.dialogButtons}>
                <Dialog.Close
                  type="button"
                  class={styles.removeAccountCancelButton}>Cancel</Dialog.Close
                >
                <Separator.Root class={styles.vSeparator} />
                <button type="submit" class={styles.removeAccountSubmitButton}
                  >Continue</button
                >
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  {/if}
</IfSettings>
