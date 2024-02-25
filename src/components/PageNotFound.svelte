<script lang="ts">
  import Button from "flowbite-svelte/Button.svelte";
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import commonStyles from "./common.module.css";
</script>

<Header title="Page not found" />

<main class={commonStyles.mainCenter}>
  <p>Oops! That page doesn't exist.</p>
  <Link href={import.meta.env.BASE_URL}>
    <Button color="primary" class="text-lg font-bold no-underline">
      Return home
    </Button>
  </Link>
</main>
