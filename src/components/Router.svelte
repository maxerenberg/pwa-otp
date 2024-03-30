<script lang="ts">
  import { onMount, type ComponentType } from "svelte";
  import { getNormalizedPath } from "../lib/routing";
  import Home from "./Home.svelte";
  import SetupSecurity from "./SetupSecurity.svelte";
  import PageNotFound from "./PageNotFound.svelte";

  const routes: Record<string, ComponentType> = {
    "/": Home,
    "/#/setup/security": SetupSecurity,
  };

  onMount(() => {
    // Adapted from https://stackoverflow.com/a/52809105
    const oldPushState = history.pushState.bind(history);
    const pushState: typeof history.pushState = (...args) => {
      oldPushState(...args);
      window.dispatchEvent(new Event("locationchange"));
    };
    history.pushState = pushState;

    const oldReplaceState = history.replaceState.bind(history);
    const replaceState: typeof history.replaceState = (...args) => {
      oldReplaceState(...args);
      window.dispatchEvent(new Event("locationchange"));
    };
    history.replaceState = replaceState;

    const onPopState = () => {
      window.dispatchEvent(new Event("locationchange"));
    };
    window.addEventListener("popstate", onPopState);

    window.addEventListener("locationchange", onLocationChange);

    return () => {
      history.pushState = oldPushState;
      history.replaceState = oldReplaceState;
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("locationchange", onLocationChange);
    };
  });

  function getCurrentComponent() {
    const path = getNormalizedPath();
    // TODO: after build step, create symlink from 404.html to index.html
    // (for GitHub pages)
    return routes[path] ?? PageNotFound;
  }

  let currentComponent = getCurrentComponent();

  function onLocationChange() {
    currentComponent = getCurrentComponent();
  }
</script>

<svelte:component this={currentComponent} />
