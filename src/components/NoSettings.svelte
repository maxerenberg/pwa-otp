<script lang="ts">
  import Button from "./Button.svelte";
  import commonStyles from "./common.module.css";
  import Link from "./Link.svelte";
</script>

<main class={commonStyles.mainCenter}>
  <p>You need to setup an account to access this page.</p>
  <Link href="/" class="text-decoration-none">
    <Button class={`${commonStyles.largeBoldButton}`}>Return home</Button>
  </Link>
</main>
