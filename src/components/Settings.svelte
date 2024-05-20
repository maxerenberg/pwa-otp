<script lang="ts">
  import Header from "./Header.svelte";
  import Link from "./Link.svelte";
  import IfSettings from "./IfSettings.svelte";
  import AngleRight from "./icons/AngleRight.svelte";
  import commonStyles from "./common.module.css";
  import styles from "./Settings.module.css";
</script>

<Header title="Settings" backHref="/" />

<IfSettings allowEncrypted>
  <main class={commonStyles.appMain}>
    <section class={styles.section}>
      <h3 class={styles.sectionTitle}>ACCOUNT</h3>
      <!-- TODO: add option to modify password (only if already unlocked) -->
      <!-- TODO: add option to export/upload secrets -->
      <!-- TODO: add "About" option which shows git commit hash used at build time
           (see https://stackoverflow.com/q/70436753) -->
      <!-- TODO: add option to check for updates -->
      <ul class={styles.sectionList}>
        <li>
          <Link href="/#/settings/delete-account" class="text-decoration-none">
            <span>Delete account</span>
            <AngleRight />
          </Link>
        </li>
      </ul>
    </section>
  </main>
</IfSettings>
