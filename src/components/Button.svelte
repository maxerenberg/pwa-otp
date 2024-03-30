<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import styles from "./Button.module.css";
  let className = "";
  export { className as class };
  export let type: HTMLButtonAttributes["type"] = undefined;
</script>

<button class={`${styles.button} ${className}`} {type}>
  <slot />
</button>
