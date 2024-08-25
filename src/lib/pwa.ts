import { useRegisterSW } from "virtual:pwa-register/svelte";
import { readable } from "svelte/store";
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

export async function updateServiceWorkerWithoutReload() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error("Service worker is not registered");
  }
  await registration.update();
}

export const isInstalledAsPWA = readable(false, (set) => {
  // See https://web.dev/learn/pwa/detection
  const match = window.matchMedia("(display-mode: standalone)");
  set(match.matches);
  const listener = (ev: MediaQueryListEvent) => set(ev.matches);
  match.addEventListener("change", listener);
  return () => match.removeEventListener("change", listener);
});

// Note: this does not work on iOS due to storage isolation (user will be
// redirected to app home page)
export function redirectAfterPWAInstallation() {
  redirectTo("/#/setup/import");
}
