<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import type { TOTPAccount } from "../lib/totp";
  import UserAddOutline from "./icons/UserAddOutline.svelte";
  import AccountListItem from "./AccountListItem.svelte";
  import Link from "./Link.svelte";
  import PlusSolid from "./icons/PlusSolid.svelte";
  import commonStyles from "./common.module.css";
  import headerStyles from "./Header.module.css";
  import styles from "./Accounts.module.css";

  export let accounts: TOTPAccount[];
  export let hideCodes: boolean;
</script>

<Header title="Authenticator">
  <Link
    href="/#/add-account"
    class="text-decoration-none"
    slot="top-right-button"
  >
    <button class={headerStyles.headingButton} aria-label="Add account">
      <PlusSolid class={headerStyles.headingIcon} />
    </button>
  </Link>
</Header>

{#if accounts.length === 0}
  <main class={commonStyles.mainCenter}>
    <p>You don't have any accounts yet.</p>
    <UserAddOutline class={styles.addUserIcon} />
    <Link href="/#/add-account" class="text-decoration-none">
      <Button class={`${commonStyles.largeBoldButton} ${styles.addUserButton}`}>
        Add account
      </Button>
    </Link>
  </main>
{:else}
  <main class={commonStyles.appMain}>
    <ul>
      {#each accounts as account}
        <AccountListItem {account} hideCode={hideCodes} />
      {/each}
    </ul>
  </main>
{/if}
