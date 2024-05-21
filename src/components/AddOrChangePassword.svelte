<script lang="ts">
  import IfSettings from "./IfSettings.svelte";
  import SetupPassword from "./SetupPassword.svelte";
</script>

<IfSettings>
  <SetupPassword backHref="/#/settings" nextHref="/#/settings" />
</IfSettings>
