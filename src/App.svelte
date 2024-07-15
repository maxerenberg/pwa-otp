<script lang="ts">
  import Router from "./components/Router.svelte";
  import ReloadPrompt from "./components/ReloadPrompt.svelte";
  import ErrorFilter from "./components/ErrorFilter.svelte";
  import { initializeSettingsStore } from "./lib/userSettings";

  initializeSettingsStore();
</script>

<Router let:component>
  <ErrorFilter>
    <svelte:component this={component} />
  </ErrorFilter>
</Router>
<ReloadPrompt />
