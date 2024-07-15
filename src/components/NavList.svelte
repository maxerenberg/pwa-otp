<script lang="ts">
  import NavListItem from "./NavListItem.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import EyeOutline from "./icons/EyeOutline.svelte";
  import EyeSlashOutline from "./icons/EyeSlashOutline.svelte";
  import MessagesOutline from "./icons/MessagesOutline.svelte";
  import QuestionCircleOutline from "./icons/QuestionCircleOutline.svelte";
  import UserEditOutline from "./icons/UserEditOutline.svelte";
  import { settings, settingsAreReady } from "../lib/userSettings";
  import styles from "./NavList.module.css";

  export let closeDrawer: (() => void) | null = null;
  const inDrawer = !!closeDrawer;

  export let isShowingAccounts: boolean;

  async function onClickToggleHideCodes() {
    await settings.toggleHideCodes();
    if (closeDrawer) {
      closeDrawer();
    }
  }
</script>

<nav
  class={`${styles.nav} ${inDrawer ? styles.inDrawer : ""}`}
  aria-label="Sidebar"
>
  <!-- TODO: activeUrl -->
  <!-- TODO: add real links -->
  <ul role="list" class={styles.list}>
    <!-- Note: settingsAreReady will always be true when isShowingAccounts
         is true; this extra call is just to satisfy the type checker when
         accessing hideCodes -->
    {#if isShowingAccounts && settingsAreReady($settings)}
      <NavListItem href="/#/rearrange-accounts" onClick={closeDrawer}>
        <UserEditOutline />
        <span>Rearrange accounts</span>
      </NavListItem>
      <li>
        <button on:click={onClickToggleHideCodes}>
          {#if $settings.hideCodes}
            <EyeOutline />
            <span>Show codes</span>
          {:else}
            <EyeSlashOutline />
            <span>Hide codes</span>
          {/if}
        </button>
      </li>
    {/if}
    <NavListItem href="/#/settings">
      <CogOutline />
      <span>Settings</span>
    </NavListItem>
    <NavListItem href="#">
      <QuestionCircleOutline />
      <span>Help</span>
    </NavListItem>
    <NavListItem href="#">
      <MessagesOutline />
      <span>Feedback</span>
    </NavListItem>
  </ul>
</nav>
