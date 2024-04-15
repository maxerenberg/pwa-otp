<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import Header from "./Header.svelte";
  import IfSettings from "./IfSettings.svelte";
  import NoAccount from "./NoAccount.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import { getNormalizedPath } from "../lib/routing";
  import { getAccountByID, settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./AccountSettings.module.css";

  const accountID = new RegExp("^/#/account/([^/]+)/settings$").exec(
    getNormalizedPath(),
  )![1];
  $: account = getAccountByID($settings, accountID);
</script>

<IfSettings>
  {#if account === null}
    <NoAccount />
  {:else if account}
    <Header title="Account settings" backHref={`/#/account/${accountID}`} />
    <main class={commonStyles.appMain}>
      <section class={`${styles.section} ${styles.accountNameContainer}`}>
        <span>Account name</span>
        <div class={styles.nameAndArrow}>
          <span>{account.issuer}</span>
          <AngleRight class={styles.arrow} />
        </div>
      </section>
      <section class={`${styles.section} ${styles.removeAccountContainer}`}>
        Remove account
      </section>
    </main>
  {/if}
</IfSettings>
