<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import Drawer from "./Drawer.svelte";
  import AngleLeft from "./icons/AngleLeft.svelte";
  import BarsSolid from "./icons/BarsSolid.svelte";
  import Link from "./Link.svelte";
  import NavList from "./NavList.svelte";
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

  // Called from NavList when "Rearrange accounts" is clicked
  function closeDrawer() {
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
      class={`${styles.headingButton} ${styles.toggleNavButton}`}
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
  <!-- TODO: use right column instead of button for wide screens -->
  <slot name="top-right-button">
    <!-- Keep a div on both sides so that the title is in the center -->
    <div class={styles.headingIcon} />
  </slot>
</header>

<Drawer bind:open={drawerOpen}>
  <Dialog.Title class={commonStyles.srOnly}>Navigation</Dialog.Title>
  <NavList {closeDrawer} />
</Drawer>

<NavList />
