<script lang="ts">
  import { getQueryParams, redirectTo } from "../lib/routing";
  import { settings, settingsAreEncrypted } from "../lib/userSettings";
  import EnterPassword from "./EnterPassword.svelte";

  const queryParams = getQueryParams();
  const next = queryParams["next"] || "/";
  const prev = queryParams["prev"] || next;
  $: if ($settings) {
    if (settingsAreEncrypted($settings)) {
      // show the form
    } else {
      redirectTo(next);
    }
  } else {
    redirectTo("/");
  }
</script>

{#if $settings && settingsAreEncrypted($settings)}
  <EnterPassword encryptedSettings={$settings} backHref={prev} />
{/if}
