<script lang="ts">
  import Button from "flowbite-svelte/Button.svelte";
  import type { TOTPAccount } from "../lib/totp";
  import commonStyles from "./common.module.css";
  import UserAddOutline from "./icons/UserAddOutline.svelte";
  import styles from "./Accounts.module.css";

  export let accounts: TOTPAccount[];
</script>

<main class={commonStyles.mainCenter}>
  <p>You don't have any accounts yet.</p>
  <UserAddOutline class={styles.addUserIcon} />
  <Button
    color="primary"
    class={`text-lg font-bold no-underline ${styles.addUserButton}`}
  >
    Add account
  </Button>
</main>
