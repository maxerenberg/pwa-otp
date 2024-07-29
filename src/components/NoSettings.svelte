<script lang="ts">
  import Button from "./Button.svelte";
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import commonStyles from "./common.module.css";

  export let noHeader = false;
</script>

{#if !noHeader}
  <Header title="Authenticator" />
{/if}

<main class={commonStyles.mainCenter}>
  <p>You need to setup an account to access this page.</p>
  <Link href="/" class="text-decoration-none">
    <Button class={commonStyles.largeBoldButton}>Return home</Button>
  </Link>
</main>
