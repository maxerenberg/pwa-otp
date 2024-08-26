<script lang="ts">
  import IfSettings from "./IfSettings.svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import Link from "./Link.svelte";
  import commonStyles from "./common.module.css";
  import styles from "./AddAccount.module.css";
</script>

<IfSettings>
  <Header title="Add account" backHref="/" />
  <main class={commonStyles.mainCenter}>
    <p>How would you like to enter the account information?</p>
    <Link href="/#/add-account/qr" class="text-decoration-none">
      <Button class={`${commonStyles.largeBoldButton} ${styles.button}`}>
        Scan QR code
      </Button>
    </Link>
    <Link href="/#/add-account/manual" class="text-decoration-none">
      <Button class={`${commonStyles.largeBoldButton} ${styles.button}`}>
        Enter code manually
      </Button>
    </Link>
  </main>
</IfSettings>
