<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import commonStyles from "./common.module.css";
</script>

<Header title="Page not found" />

<main class={commonStyles.mainCenter}>
  <p>Oops! That page doesn't exist.</p>
  <Link href={import.meta.env.BASE_URL}>
    <Button class={commonStyles.largeBoldButton}>Return home</Button>
  </Link>
</main>
