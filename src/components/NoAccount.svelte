<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import Button from "./Button.svelte";
  import commonStyles from "./common.module.css";
</script>

<Header title="Authenticator" />
<main class={commonStyles.mainCenter}>
  <p>That account doesn't exist.</p>
  <Link href="/" class="text-decoration-none">
    <Button class={commonStyles.largeBoldButton}>Return home</Button>
  </Link>
</main>
