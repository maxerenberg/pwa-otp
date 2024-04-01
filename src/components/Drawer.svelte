<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import { fade, fly } from "svelte/transition";
  import styles from "./Drawer.module.css";
  export let contentClass = "";
  export let open: boolean | undefined = undefined;
</script>

<!-- Adapted from https://melt-ui.com/docs/builders/dialog#drawer -->

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 150 }}
      class={styles.overlay}
    />
    <Dialog.Content
      transition={fly}
      transitionConfig={{ x: -350, duration: 300, opacity: 1 }}
      class={`${styles.content} ${contentClass}`}
    >
      <slot />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
