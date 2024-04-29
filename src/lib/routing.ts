import { readable } from "svelte/store";

/**
 * The path of BASE_URL, without the trailing slash
 */
export const base = (() => {
  let base = import.meta.env.BASE_URL;
  if (base.startsWith("http://") || base.startsWith("https://")) {
    base = new URL(base).pathname;
  }
  if (base.charAt(base.length - 1) === "/") {
    base = base.substring(0, base.length - 1);
  }
  return base;
})();

// TODO: expose this as a store
/**
 * Returns the full path in the current URL, including
 * the hash, after removing BASE_URL if it is set.
 */
export function getNormalizedPath(): string {
  let path = location.pathname;
  if (location.hash) {
    path += location.hash;
  }
  if (base !== "" && path.startsWith(base)) {
    path = path.substring(base.length);
    if (path === "") {
      path = "/";
    }
  }
  return path;
}

export function redirectTo(href: string) {
  if (href.charAt(0) === "/") {
    href = base + href;
  }
  history.pushState(null, "", href);
}

export const normalizedPath = readable(
  getNormalizedPath(),
  function start(set) {
    // Make sure we get the latest value when a component mounts
    set(getNormalizedPath());
    const onLocationChange = () => set(getNormalizedPath());
    // This event is emitted from Router.svelte
    window.addEventListener("locationchange", onLocationChange);
    return function stop() {
      window.removeEventListener("locationchange", onLocationChange);
    };
  },
);
