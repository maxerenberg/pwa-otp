<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { tick } from "svelte";
  import { sineIn } from "svelte/easing";
  import Drawer from "flowbite-svelte/Drawer.svelte";
  import Heading from "flowbite-svelte/Heading.svelte";
  import Sidebar from "flowbite-svelte/Sidebar.svelte";
  import SidebarGroup from "flowbite-svelte/SidebarGroup.svelte";
  import SidebarItem from "flowbite-svelte/SidebarItem.svelte";
  import SidebarWrapper from "flowbite-svelte/SidebarWrapper.svelte";
  import BarsSolid from "flowbite-svelte-icons/BarsSolid.svelte";
  import CogOutline from "flowbite-svelte-icons/CogOutline.svelte";
  import EyeSlashOutline from "flowbite-svelte-icons/EyeSlashOutline.svelte";
  import MessagesOutline from "flowbite-svelte-icons/MessagesOutline.svelte";
  import PlusSolid from "flowbite-svelte-icons/PlusSolid.svelte";
  import QuestionCircleOutline from "flowbite-svelte-icons/QuestionCircleOutline.svelte";
  import UserEditOutline from "flowbite-svelte-icons/UserEditOutline.svelte";
  import styles from "./Header.module.css";

  export let title: string;

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

<header class="flex items-center bg-primary-700 px-3 py-2 md:px-4">
  <button
    class="rounded-lg p-1 hover:bg-primary-600"
    aria-label="Toggle navigation"
    aria-controls="navDrawer"
    on:click={onClickMenuButton}
  >
    <BarsSolid class="h-6 w-6 text-white md:h-8 md:w-8" />
  </button>
  <Heading
    tag="h1"
    color="text-white"
    class="relative top-[-1px] ml-2 text-xl font-bold md:ml-4 md:text-3xl"
  >
    {title}
  </Heading>
  <!-- TODO: only show if on 'Accounts' page and setup was completed -->
  <button class="rounded-lg p-1 hover:bg-primary-600" aria-label="Add account">
    <PlusSolid class="h-6 w-6 text-white md:h-8 md:w-8" />
  </button>
</header>
<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hideDrawer}
  id="navDrawer"
  width="w-max"
  divClass="overflow-y-auto z-50 p-4 pe-6 bg-white"
  aria-label="Navigation"
  aria-modal="true"
  role="dialog"
>
  <!-- TODO: activeUrl -->
  <Sidebar asideClass={styles.sidebar}>
    <SidebarWrapper divClass="">
      <SidebarGroup>
        <SidebarItem label="Rearrange accounts">
          <svelte:fragment slot="icon">
            <UserEditOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Hide codes">
          <svelte:fragment slot="icon">
            <EyeSlashOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Settings">
          <svelte:fragment slot="icon">
            <CogOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Help">
          <svelte:fragment slot="icon">
            <QuestionCircleOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Feedback">
          <svelte:fragment slot="icon">
            <MessagesOutline />
          </svelte:fragment>
        </SidebarItem>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
