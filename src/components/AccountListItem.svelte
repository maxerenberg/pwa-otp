<script lang="ts">
  import type { TOTPAccount } from "../lib/totp";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import styles from "./AccountListItem.module.css";

  export let account: TOTPAccount;
</script>

<!-- TODO: show account page when item is clicked -->
<li class={styles.item}>
  <div class={styles.itemInner}>
    <div class={styles.grid}>
      <UserCircleSolid class={styles.issuerLogo} />
      <div class={styles.issuerAndName}>
        <h4>{account.issuer}</h4>
        <h4>{account.name}</h4>
      </div>
      <!-- empty div for bottom-left corner in grid -->
      <div />
      <div class={styles.otpCode}>772 544</div>
    </div>
    <div class={styles.rightArrowContainer}>
      <AngleRight class={styles.rightArrow} />
    </div>
  </div>
</li>
