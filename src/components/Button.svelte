<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import styles from "./Button.module.css";
  let className = "";
  export { className as class };
  export let type: HTMLButtonAttributes["type"] = undefined;
  export let theme: "primary" | "danger" = "primary";
  const primaryStyle = {
    "--bg": "var(--primary-700)",
    "--hover-bg": "var(--primary-800)",
  };
  const dangerStyle = {
    "--bg": "var(--danger)",
    "--hover-bg": "var(--danger-hover)",
  };
  const styleObj = theme === "primary" ? primaryStyle : dangerStyle;
  const style = Object.entries(styleObj)
    .map(([key, val]) => `${key}: ${val}`)
    .join("; ");
</script>

<button class={`${styles.button} ${className}`} {type} {style}>
  <slot />
</button>
