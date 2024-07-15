<script lang="ts">
  import EnterPassword from "./EnterPassword.svelte";
  import { getQueryParams, redirectTo } from "../lib/routing";
  import { settings, settingsAreEncrypted } from "../lib/userSettings";

  const queryParams = getQueryParams();
  const next = queryParams["next"] || "/";
  const prev = queryParams["prev"] || next;
  $: if (!$settings) {
    redirectTo("/");
  } else if (settingsAreEncrypted($settings)) {
    // show form
  } else {
    redirectTo(next);
  }
</script>

{#if $settings && settingsAreEncrypted($settings)}
  <EnterPassword encryptedSettings={$settings} backHref={prev} />
{/if}
