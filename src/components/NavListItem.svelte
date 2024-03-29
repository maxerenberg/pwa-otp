<script lang="ts">
  import Link from "./Link.svelte";
  export let href: string;
</script>

<li>
  <Link {href}>
    <slot />
  </Link>
</li>
