<script lang="ts">
  import { onMount, type ComponentType } from "svelte";
  import { getNormalizedPath } from "../lib/routing";
  import Home from "./Home.svelte";
  import SetupSecurity from "./SetupSecurity.svelte";
  import SetupPassword from "./SetupPassword.svelte";
  import PageNotFound from "./PageNotFound.svelte";
  import Settings from "./Settings.svelte";
  import DeleteAccount from "./DeleteAccount.svelte";
  import AddAccount from "./AddAccount.svelte";
  import Account from "./Account.svelte";
  import AccountSettings from "./AccountSettings.svelte";
  import InstallPwaPrompt from "./InstallPWAPrompt.svelte";

  const routes: Record<string, ComponentType> = {
    "/": Home,
    "/#/rearrange-accounts": Home,
    "/#/setup/install-pwa": InstallPwaPrompt,
    "/#/setup/security": SetupSecurity,
    "/#/setup/security/password": SetupPassword,
    "/#/settings": Settings,
    "/#/settings/delete-account": DeleteAccount,
    "/#/add-account": AddAccount,
  };
  const regexRoutes: [RegExp, ComponentType][] = [
    [new RegExp("^/#/account/[^/]+$"), Account],
    [new RegExp("^/#/account/[^/]+/settings$"), AccountSettings],
  ];

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

  function getCurrentComponent(): ComponentType {
    const path = getNormalizedPath();
    const component = routes[path];
    if (component) return component;
    for (const [pattern, component] of regexRoutes) {
      if (pattern.test(path)) return component;
    }
    // TODO: after build step, create symlink from 404.html to index.html
    // (for GitHub pages)
    return PageNotFound;
  }

  let currentComponent = getCurrentComponent();

  function onLocationChange() {
    currentComponent = getCurrentComponent();
  }
</script>

<svelte:component this={currentComponent} />
