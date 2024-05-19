<script lang="ts">
  // See https://vitejs.dev/guide/performance#avoid-barrel-files
  //import { Dialog } from "bits-ui";
  import * as Dialog from "../../node_modules/bits-ui/dist/bits/dialog";
  import * as Separator from "../../node_modules/bits-ui/dist/bits/separator";
  import {
    fade,
    fly,
    type FadeParams,
    type FlyParams,
  } from "svelte/transition";
  import styles from "./Dialog.module.css";

  export let open = false;
  export let onSubmit: (ev: SubmitEvent) => void;
  export let submitButtonText: string;
  export let disabled = false;
  export let hasCancel = false;

  const fadeTransitionConfig: FadeParams = { duration: 150 };
  const flyTransitionConfig: FlyParams = { duration: 150, y: 350 };
</script>

<Dialog.Root bind:open>
  <slot name="trigger" />
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={fadeTransitionConfig}
      class={styles.overlay}
    />
    <Dialog.Content
      transition={fly}
      transitionConfig={flyTransitionConfig}
      class={`${styles.content} ${styles.centerContent}`}
    >
      <form on:submit={onSubmit}>
        <slot name="above-buttons" />
        <Separator.Root class={styles.hSeparator} />
        <div class={styles.buttons}>
          {#if hasCancel}
            <Dialog.Close type="button" class={styles.primaryButton}
              >Cancel</Dialog.Close
            >
            <Separator.Root class={styles.vSeparator} />
          {/if}
          <button
            type="submit"
            class={hasCancel ? styles.dangerButton : styles.primaryButton}
            {disabled}>{submitButtonText}</button
          >
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
