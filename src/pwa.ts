import { useRegisterSW } from "virtual:pwa-register/svelte";

// TODO: show prompt when $needRefresh === true
export const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swScriptUrl, registration) {
    if (registration) {
      // Optional: periodic updates
      // See https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
      // and https://vite-pwa-org.netlify.app/frameworks/svelte.html
    }
  },
});
