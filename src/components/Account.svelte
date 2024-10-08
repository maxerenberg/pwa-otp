<script lang="ts">
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import Link from "./Link.svelte";
  import IfSettings from "./IfSettings.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import NoAccount from "./NoAccount.svelte";
  import TimerCircle from "./TimerCircle.svelte";
  import { getNormalizedPath } from "../lib/routing";
  import { now } from "../lib/timer";
  import { CachingTOTPCalculator, otpCodeToStr } from "../lib/totp";
  import {
    getAccountByID,
    settings,
    totpCalculators,
  } from "../lib/userSettings";
  import IssuerLogo from "./IssuerLogo.svelte";
  import commonStyles from "./common.module.css";
  import headerStyles from "./Header.module.css";
  import styles from "./Account.module.css";

  const accountID = getNormalizedPath().substring("/#/account/".length);
  let otpCodeStr = "";
  $: account = getAccountByID($settings, accountID);
  $: calculator = CachingTOTPCalculator.factory(
    account ? $totpCalculators[account.id] : undefined,
  );
  $: calculator?.calculate($now)?.then((code) => {
    // TODO: fade animation when code changes
    otpCodeStr = otpCodeToStr(code, account!.digits);
  });
</script>

<IfSettings>
  {#if account === null}
    <NoAccount />
  {:else if account}
    <Header title="" htmlTitle={account.issuer} backHref="/">
      <Link
        href={`/#/account/${accountID}/settings`}
        class={`${headerStyles.headingLink} ${headerStyles.topRightButton}`}
        slot="top-right-button"
        ariaLabel="Account settings"
      >
        <CogOutline class={headerStyles.headingIcon} />
      </Link>
      <Link
        href={`/#/account/${accountID}/settings`}
        class="text-decoration-none"
        slot="right-column"
      >
        <Button
          class={`${headerStyles.rightColumnButton} ${commonStyles.largeBoldButton}`}
          >Account settings</Button
        >
      </Link>
    </Header>
    <main class={commonStyles.appMain}>
      <div class={styles.banner}>
        <IssuerLogo
          issuer={account.issuer}
          name={account.name}
          class={styles.issuerLogo}
        />
        <div class={styles.issuerAndName}>
          <h4 class={styles.issuer}>{account.issuer}</h4>
          <h4 class={styles.name}>{account.name}</h4>
        </div>
      </div>
      <section class={styles.otpArea}>
        <TimerCircle class={styles.timerCircle} now={$now} />
        <div>
          <h4>One-time password</h4>
          <div class={styles.otpCode}>{otpCodeStr}</div>
        </div>
      </section>
    </main>
  {/if}
</IfSettings>
