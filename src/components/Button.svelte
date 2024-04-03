<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import styles from "./Button.module.css";
  let className = "";
  export { className as class };
  export let type: HTMLButtonAttributes["type"] = undefined;
  export let onclick: HTMLButtonAttributes["on:click"] = undefined;
  export let disabled: HTMLButtonAttributes["disabled"] = undefined;
  export let theme: "primary" | "danger" = "primary";
</script>

<button
  class={`${styles.button} ${styles[theme]} ${className}`}
  {type}
  {disabled}
  on:click={onclick}
>
  <slot />
</button>
