<script lang="ts">
  import { base } from "../lib/routing";

  export let href = "#";
  let className = "";
  export { className as class };
  let postOnClick: ((e: MouseEvent) => void) | null = null;
  export { postOnClick as onClick };
  export let ariaLabel: string | null = null;

  function calculateHrefWithBase(href: string): string {
    if (href.charAt(0) === "/") {
      return base + href;
    }
    return href;
  }
  $: hrefWithBase = calculateHrefWithBase(href);

  // shallow routing
  function onClick(ev: MouseEvent) {
    ev.preventDefault();
    history.pushState(null, "", hrefWithBase);
    if (postOnClick) postOnClick(ev);
  }
</script>

<a
  href={hrefWithBase}
  class={className}
  on:click={onClick}
  aria-label={ariaLabel}
>
  <slot />
</a>
