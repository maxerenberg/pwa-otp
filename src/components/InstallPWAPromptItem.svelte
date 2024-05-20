<script lang="ts">
  import * as Accordion from "../../node_modules/bits-ui/dist/bits/accordion";
  import { slide } from "svelte/transition";
  import AngleDown from "./icons/AngleDown.svelte";
  import styles from "./InstallPWAPrompt.module.css";

  export let name: string;
</script>

<Accordion.Item value={name} class={styles.item}>
  <Accordion.Header>
    <Accordion.Trigger class={styles.trigger}>
      {name}
      <AngleDown class={styles.arrow} />
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content transition={slide} transitionConfig={{ duration: 200 }}>
    <slot />
  </Accordion.Content>
</Accordion.Item>
