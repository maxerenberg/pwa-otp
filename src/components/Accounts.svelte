<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import type { TOTPAccount } from "../lib/totp";
  import commonStyles from "./common.module.css";
  import UserAddOutline from "./icons/UserAddOutline.svelte";
  import styles from "./Accounts.module.css";
  import AccountListItem from "./AccountListItem.svelte";
  import Link from "./Link.svelte";

  export let accounts: TOTPAccount[];

  accounts = [
    {
      secret: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      name: "jdoe@gmail.com",
      issuer: "Google",
      algorithm: "SHA1",
      digits: 6,
    },
    {
      secret: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      name: "jdoe@outlook.com",
      issuer: "Microsoft",
      algorithm: "SHA1",
      digits: 6,
    },
  ];
</script>

<Header title="Authenticator" isAccountsPage />

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
        <AccountListItem {account} />
      {/each}
    </ul>
  </main>
{/if}
