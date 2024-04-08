<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import Button from "./Button.svelte";
  import IfSettings from "./IfSettings.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import type { TOTPAccount } from "../lib/totp";
  import { getNormalizedPath } from "../lib/routing";
  import { settings, type UserSettings } from "../lib/userSettings";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";
  import commonStyles from "./common.module.css";
  import headerStyles from "./Header.module.css";
  import styles from "./Account.module.css";

  const accountID = getNormalizedPath().substring("/#/account/".length);
  // undefined => settings are not loaded yet
  // null => settings are loaded, but account does not exist
  function getAccount(
    settings: UserSettings | null,
  ): TOTPAccount | undefined | null {
    if (!settings) return undefined;
    const filtered = settings.accounts.filter((a) => a.id === accountID);
    if (filtered.length === 0) {
      return null;
    }
    return filtered[0];
  }
  $: account = getAccount($settings);
</script>

<IfSettings>
  {#if account === null}
    <Header title="Authenticator" />
    <main class={commonStyles.mainCenter}>
      <p>That account doesn't exist.</p>
      <Link href="/" class="text-decoration-none">
        <Button class={commonStyles.largeBoldButton}>Return home</Button>
      </Link>
    </main>
  {:else if account}
    <Header title="" htmlTitle={account.issuer} backHref="/">
      <!-- FIXME: implement nested routing -->
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
        <h4>One-time password</h4>
        <!-- TODO: timer -->
        <div class={styles.otpCode}>772 544</div>
      </section>
    </main>
  {/if}
</IfSettings>
