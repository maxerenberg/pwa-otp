<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import IfSettings from "./IfSettings.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import NoAccount from "./NoAccount.svelte";
  import TimerCircle from "./TimerCircle.svelte";
  import { getNormalizedPath } from "../lib/routing";
  import { getAccountByID, settings } from "../lib/userSettings";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";
  import commonStyles from "./common.module.css";
  import headerStyles from "./Header.module.css";
  import styles from "./Account.module.css";

  const accountID = getNormalizedPath().substring("/#/account/".length);
  $: account = getAccountByID($settings, accountID);
</script>

<IfSettings>
  {#if account === null}
    <NoAccount />
  {:else if account}
    <Header title="" htmlTitle={account.issuer} backHref="/">
      <Link
        href={`/#/account/${accountID}/settings`}
        class={`${headerStyles.topRightButton} text-decoration-none`}
        slot="top-right-button"
      >
        <button
          class={headerStyles.headingButton}
          aria-label="Settings for this account"
        >
          <CogOutline class={headerStyles.headingIcon} />
        </button>
      </Link>
    </Header>
    <main class={commonStyles.appMain}>
      <div class={styles.banner}>
        <!-- TODO: issuer logo -->
        <UserCircleSolid class={styles.issuerLogo} />
        <div class={styles.issuerAndName}>
          <h4 class={styles.issuer}>{account.issuer}</h4>
          <h4 class={styles.name}>{account.name}</h4>
        </div>
      </div>
      <section class={styles.otpArea}>
        <TimerCircle class={styles.timerCircle} now={1713630201} />
        <div>
          <h4>One-time password</h4>
          <div class={styles.otpCode}>772 544</div>
        </div>
      </section>
    </main>
  {/if}
</IfSettings>
