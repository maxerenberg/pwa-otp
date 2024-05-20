import { useRegisterSW } from "virtual:pwa-register/svelte";

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
