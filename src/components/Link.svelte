<script lang="ts">
  import { base } from "../lib/routing";

  export let href = "#";
  let className: string | undefined = undefined;
  export { className as class };

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
  }
</script>

<a href={hrefWithBase} class={className} on:click={onClick}>
  <slot />
</a>
