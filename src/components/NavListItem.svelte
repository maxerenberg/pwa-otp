<script lang="ts">
  import Link from "./Link.svelte";
  export let href: string;
  export let onClick: ((e: MouseEvent) => void) | null = null;
</script>

<li>
  <Link {href} {onClick}>
    <slot />
  </Link>
</li>
