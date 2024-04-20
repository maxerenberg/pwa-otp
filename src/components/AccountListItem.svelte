<script lang="ts">
  import type { TOTPAccount } from "../lib/totp";
  import Link from "./Link.svelte";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import styles from "./AccountListItem.module.css";
  import TimerCircle from "./TimerCircle.svelte";

  export let account: TOTPAccount;
</script>

<!-- TODO: show account page when item is clicked -->
<li class={styles.item}>
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
      <div class={styles.otpContainer}>
        <span class={styles.otpCode}>772 544</span>
        <TimerCircle class={styles.timerCircle} now={1713630201} />
      </div>
    </div>
    <div class={styles.rightArrowContainer}>
      <AngleRight class={styles.rightArrow} />
    </div>
  </Link>
</li>
