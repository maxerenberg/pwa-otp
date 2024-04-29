<script lang="ts">
  import { CachingTOTPCalculator, type TOTPAccount } from "../lib/totp";
  import Link from "./Link.svelte";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import TimerCircle from "./TimerCircle.svelte";
  import { now } from "../lib/timer";
  import { otpCodeToStr } from "../lib/totp";
  import { totpCalculators } from "../lib/userSettings";
  import styles from "./AccountListItem.module.css";

  export let account: TOTPAccount;
  export let hideCode: boolean = false;
  export let isRearranging: boolean = false;

  let otpCodeStr = "";
  $: calculator = CachingTOTPCalculator.factory($totpCalculators[account.id]);
  $: {
    calculator?.calculate($now)?.then((code) => {
      // TODO: fade animation when code changes
      otpCodeStr = otpCodeToStr(code, account.digits);
    });
  }
  $: otpCodeStrWidth = account.digits === 6 ? "4.25em" : "5.375em";
</script>

{#if isRearranging}
  <div class={styles.itemInner}>
    <div class={styles.grid}>
      <!-- TODO: issuer logo -->
      <UserCircleSolid class={styles.issuerLogo} />
      <div class={styles.issuerAndName}>
        <h4>{account.issuer}</h4>
        <h4>{account.name}</h4>
      </div>
      <!-- empty div for bottom-left corner in grid -->
      <div />
    </div>
    <div class={styles.dragHandleContainer}>
      <div class={styles.dragHandle} />
      <div class={styles.dragHandle} />
      <div class={styles.dragHandle} />
    </div>
  </div>
{:else}
  <Link class={styles.itemInner} href={`/#/account/${account.id}`}>
    <div class={styles.grid}>
      <!-- TODO: issuer logo -->
      <UserCircleSolid class={styles.issuerLogo} />
      <div class={styles.issuerAndName}>
        <h4>{account.issuer}</h4>
        <h4>{account.name}</h4>
      </div>
      <!-- empty div for bottom-left corner in grid -->
      <div />
      {#if !hideCode}
        <div class={styles.otpContainer}>
          <span class={styles.otpCode} style={`--width: ${otpCodeStrWidth}`}
            >{otpCodeStr}</span
          >
          <TimerCircle class={styles.timerCircle} now={$now} />
        </div>
      {/if}
    </div>
    <div class={styles.rightArrowContainer}>
      <AngleRight class={styles.rightArrow} />
    </div>
  </Link>
{/if}
