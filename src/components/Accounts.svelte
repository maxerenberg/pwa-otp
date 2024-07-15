<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import type { TOTPAccount } from "../lib/totp";
  import UserAddOutline from "./icons/UserAddOutline.svelte";
  import AccountListItem from "./AccountListItem.svelte";
  import Link from "./Link.svelte";
  import PlusSolid from "./icons/PlusSolid.svelte";
  import { normalizedPath } from "../lib/routing";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import headerStyles from "./Header.module.css";
  import styles from "./Accounts.module.css";
  import itemStyles from "./AccountListItem.module.css";

  export let accounts: TOTPAccount[];
  export let hideCodes: boolean;

  // Keep a local copy for DnD purposes (saving the new account order is async,
  // but we need the UI to update immediately).
  $: accountsCopy = accounts;
  $: isRearranging = $normalizedPath === "/#/rearrange-accounts";
  const flipDurationMs = 200;

  function onConsider(ev: CustomEvent<DndEvent<TOTPAccount>>): void {
    accountsCopy = ev.detail.items;
  }

  // This function should NOT be async so that the UI updates immediately
  function onFinalize(ev: CustomEvent<DndEvent<TOTPAccount>>): void {
    accountsCopy = ev.detail.items;
    // No need to await this call
    settings.setAccounts(accountsCopy);
  }
</script>

{#if isRearranging}
  <Header title="Authenticator" hideMenu>
    <Link
      href="/"
      class={`${headerStyles.headingLink} ${headerStyles.text} ${headerStyles.topRightButton}`}
      slot="top-right-button"
    >
      Done
    </Link>
    <Link href="/" class="text-decoration-none" slot="right-column">
      <Button
        class={`${headerStyles.rightColumnButton} ${commonStyles.largeBoldButton}`}
      >
        Done
      </Button>
    </Link>
  </Header>
{:else}
  <Header title="Authenticator">
    <Link
      href="/#/add-account"
      class={`${headerStyles.headingLink} ${headerStyles.topRightButton}`}
      slot="top-right-button"
      ariaLabel="Add account"
    >
      <PlusSolid class={headerStyles.headingIcon} />
    </Link>
    <Link
      href="/#/add-account"
      class="text-decoration-none"
      slot="right-column"
    >
      <Button
        class={`${headerStyles.rightColumnButton} ${commonStyles.largeBoldButton}`}
        >Add account</Button
      >
    </Link>
  </Header>
{/if}

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
    {#if isRearranging}
      <ul
        use:dndzone={{ items: accountsCopy, flipDurationMs }}
        on:consider={onConsider}
        on:finalize={onFinalize}
        role="list"
      >
        <!-- An element uses the animate directive must be the immediate
             child of a keyed each block -->
        {#each accountsCopy as account (account.id)}
          <li
            class={itemStyles.item}
            animate:flip={{ duration: flipDurationMs }}
          >
            <AccountListItem {account} isRearranging />
          </li>
        {/each}
      </ul>
    {:else}
      <ul role="list">
        {#each accounts as account (account.id)}
          <li class={itemStyles.item}>
            <AccountListItem {account} hideCode={hideCodes} />
          </li>
        {/each}
      </ul>
    {/if}
  </main>
{/if}
