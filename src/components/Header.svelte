<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import Drawer from "./Drawer.svelte";
  import AngleLeft from "./icons/AngleLeft.svelte";
  import BarsSolid from "./icons/BarsSolid.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import EyeOutline from "./icons/EyeOutline.svelte";
  import EyeSlashOutline from "./icons/EyeSlashOutline.svelte";
  import MessagesOutline from "./icons/MessagesOutline.svelte";
  import QuestionCircleOutline from "./icons/QuestionCircleOutline.svelte";
  import UserEditOutline from "./icons/UserEditOutline.svelte";
  import Link from "./Link.svelte";
  import NavListItem from "./NavListItem.svelte";
  import { settings } from "../lib/userSettings";
  import commonStyles from "./common.module.css";
  import styles from "./Header.module.css";

  export let title: string;
  export let htmlTitle: string | undefined = undefined;
  export let backHref: string | undefined = undefined;
  export let hideMenu: boolean = false;

  // TODO: use a non-drawer sidebar on desktop
  let drawerOpen = false;
  function onClickMenuButton() {
    drawerOpen = true;
  }

  // This is necessary to trigger :active on iOS Safari.
  // See https://stackoverflow.com/a/33681490.
  function onTouchStart() {}

  async function onClickToggleHideCodes() {
    await settings.toggleHideCodes();
    drawerOpen = false;
  }

  function onClickRearrangeAccounts() {
    // The drawer won't close on its own because the same component (Home)
    // will get rendered
    drawerOpen = false;
  }
</script>

<svelte:head>
  <title>{htmlTitle ?? title}</title>
</svelte:head>

<header class={`${styles.header} ${backHref ? styles.centerTitle : ""}`}>
  {#if backHref}
    <Link href={backHref}>
      <!-- TODO: move this up a bit (looks off-center on desktop) -->
      <button
        class={styles.headingButton}
        aria-label="Back"
        on:touchstart={onTouchStart}
      >
        <AngleLeft class={styles.headingIcon} />
      </button>
    </Link>
  {:else if !hideMenu}
    <button
      class={styles.headingButton}
      aria-label="Toggle navigation"
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      on:click={onClickMenuButton}
      on:touchstart={onTouchStart}
    >
      <BarsSolid class={styles.headingIcon} />
    </button>
  {/if}
  <h1 class={styles.heading}>
    {title}
  </h1>
  <slot name="top-right-button">
    <!-- Keep a div on both sides so that the title is in the center -->
    <div class={styles.headingIcon} />
  </slot>
</header>

<Drawer bind:open={drawerOpen}>
  <Dialog.Title class={commonStyles.srOnly}>Navigation</Dialog.Title>
  <aside aria-label="Sidebar">
    <!-- TODO: activeUrl -->
    <!-- TODO: add real links -->
    <!-- TODO: hide first three links if account is not setup -->
    <ul role="list" class={styles.navList}>
      <NavListItem
        href="/#/rearrange-accounts"
        onClick={onClickRearrangeAccounts}
      >
        <UserEditOutline />
        <span>Rearrange accounts</span>
      </NavListItem>
      <li>
        <button on:click={onClickToggleHideCodes}>
          {#if $settings?.hideCodes}
            <EyeOutline />
            <span>Show codes</span>
          {:else}
            <EyeSlashOutline />
            <span>Hide codes</span>
          {/if}
        </button>
      </li>
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
  </aside>
</Drawer>
