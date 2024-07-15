import { writable } from "svelte/store";

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

/**
 * Returns the full path in the current URL, including
 * the hash, after removing BASE_URL if it is set.
 * Query parameters are removed if present.
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

export function getQueryParams(): Partial<Record<string, string>> {
  return location.search
    .slice(1)
    .split("&")
    .reduce(
      (acc, kv) => {
        const [key, val] = kv.split("=");
        acc[key] = decodeURIComponent(val);
        return acc;
      },
      {} as Partial<Record<string, string>>,
    );
}

// Needs to be writable so that we can reset it from the unit tests
export const normalizedPath = writable(
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
