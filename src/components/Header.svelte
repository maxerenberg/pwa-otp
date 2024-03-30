<script lang="ts">
  import { Dialog } from "bits-ui";
  import Drawer from "./Drawer.svelte";
  import AngleLeft from "./icons/AngleLeft.svelte";
  import BarsSolid from "./icons/BarsSolid.svelte";
  import CogOutline from "./icons/CogOutline.svelte";
  import EyeSlashOutline from "./icons/EyeSlashOutline.svelte";
  import MessagesOutline from "./icons/MessagesOutline.svelte";
  import PlusSolid from "./icons/PlusSolid.svelte";
  import QuestionCircleOutline from "./icons/QuestionCircleOutline.svelte";
  import UserEditOutline from "./icons/UserEditOutline.svelte";
  import Link from "./Link.svelte";
  import NavListItem from "./NavListItem.svelte";
  import commonStyles from "./common.module.css";
  import styles from "./Header.module.css";

  export let title: string;
  export let backHref: string | undefined = undefined;

  // TODO: use a non-drawer sidebar on desktop
  let drawerOpen = false;
  function onClickMenuButton() {
    drawerOpen = true;
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<header class={styles.header}>
  {#if backHref}
    <Link href={backHref}>
      <button class={styles.headingButton} aria-label="Back">
        <AngleLeft class={styles.headingIcon} />
      </button>
    </Link>
  {:else}
    <button
      class={styles.headingButton}
      aria-label="Toggle navigation"
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      on:click={onClickMenuButton}
    >
      <BarsSolid class={styles.headingIcon} />
    </button>
  {/if}
  <h1 class={styles.heading}>
    {title}
  </h1>
  <!-- TODO: only show if on 'Accounts' page and setup was completed -->
  <button class={styles.headingButton} aria-label="Add account">
    <PlusSolid class={styles.headingIcon} />
  </button>
</header>

<Drawer bind:open={drawerOpen}>
  <Dialog.Title class={commonStyles.srOnly}>Navigation</Dialog.Title>
  <aside aria-label="Sidebar">
    <!-- TODO: activeUrl -->
    <!-- TODO: add real links -->
    <ul role="list" class={styles.navList}>
      <NavListItem href="#">
        <UserEditOutline />
        <span>Rearrange accounts</span>
      </NavListItem>
      <NavListItem href="#">
        <EyeSlashOutline />
        <span>Hide codes</span>
      </NavListItem>
      <NavListItem href="#">
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
