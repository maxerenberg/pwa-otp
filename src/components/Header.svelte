<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { tick } from "svelte";
  import { sineIn } from "svelte/easing";
  import Drawer from "flowbite-svelte/Drawer.svelte";

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
  import styles from "./Header.module.css";

  export let title: string;
  export let backHref: string | undefined = undefined;

  // TODO: use a non-drawer sidebar on desktop
  let hideDrawer = true;
  const transitionParams: ComponentProps<Drawer>["transitionParams"] = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };

  // Adapted from https://learn.svelte.dev/tutorial/actions
  function getFocusable(node: HTMLElement) {
    return node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
  }

  function menuOnKeydown(ev: KeyboardEvent) {
    if (ev.key === "Escape") {
      // Close menu if user presses Esc
      hideDrawer = true;
    } else if (ev.key == "Tab" && drawer) {
      // Only allow elements in drawer to be focused
      const focusables = getFocusable(drawer);
      if (focusables.length === 0) return;
      const first = focusables.item(0);
      const last = focusables.item(focusables.length - 1);
      const current = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && current === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && current === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  }
  // The Drawer component doesn't allow us to pass on:keydown
  // (it does pass {...$$restProps} to the div, but that doesn't seem to work
  // for event handlers). As a workaround, we call getElementById after the
  // div has mounted, then attach an event handler to it.
  let drawer: HTMLElement | null = null;
  let prevFocusedElem: HTMLElement | null = null;
  async function onClickMenuButton() {
    hideDrawer = false;
    await tick();
    prevFocusedElem = document.activeElement as HTMLElement | null;
    drawer = document.getElementById("navDrawer");
    if (drawer) {
      drawer.addEventListener("keydown", menuOnKeydown);
      getFocusable(drawer)[0]?.focus();
    }
  }
  $: if (hideDrawer && drawer) {
    drawer.removeEventListener("keydown", menuOnKeydown);
    drawer = null;
    if (prevFocusedElem) {
      prevFocusedElem.focus();
      prevFocusedElem = null;
    }
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
      aria-controls="navDrawer"
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

<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hideDrawer}
  id="navDrawer"
  width=""
  divClass={styles.drawer}
  aria-label="Navigation"
  aria-modal="true"
  role="dialog"
>
  <!-- TODO: activeUrl -->
  <!-- TODO: add real links -->
  <aside aria-label="Sidebar">
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
