import { useRegisterSW } from "virtual:pwa-register/svelte";
import { onMount } from "svelte";
import { redirectTo } from "./routing";

export const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swScriptUrl, registration) {
    if (registration) {
      // Optional: periodic updates
      // See https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
      // and https://vite-pwa-org.netlify.app/frameworks/svelte.html.
      // Note that browsers check for updates automatically when the user
      // navigates to the page (see https://web.dev/articles/service-worker-lifecycle).
    }
  },
});

export function redirectToSetupAfterPWAInstallation() {
  // See https://web.dev/learn/pwa/detection
  // Note: this does not work on iOS due to storage isolation (user will be
  // redirected to app home page)
  onMount(() => {
    const listener = (ev: MediaQueryListEvent) => {
      if (ev.matches) {
        redirectTo("/#/setup/security");
      }
    };
    const match = window.matchMedia("(display-mode: standalone)");
    match.addEventListener("change", listener);
    return () => match.removeEventListener("change", listener);
  });
}
