<script lang="ts">
  import { needRefresh, updateServiceWorker } from "../lib/pwa";

  let cancelled = false;

  function onClose() {
    cancelled = true;
  }

  async function onReload() {
    await updateServiceWorker();
  }
</script>

<!-- Adapted from https://vite-pwa-org.netlify.app/frameworks/svelte.html -->

{#if $needRefresh && !cancelled}
  <div class="toast" role="alert">
    <p>An update is available.</p>
    <div class="buttons">
      <button class="close" on:click={onClose}>Close</button>
      <button class="reload" on:click={onReload}>Reload</button>
    </div>
  </div>
{/if}

<style lang="postcss">
  .toast {
    position: fixed;
    width: 300px;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    border: 2px solid var(--app-section-title-color);
    border-radius: 0.25rem;
    box-shadow: 3px 4px 5px 0 #8885;
    padding: 0.75rem 1rem;
    z-index: 1;
    background-color: white;

    @media (min-width: 768px) {
      width: 500px;
      bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    @media (prefers-color-scheme: dark) {
      background-color: #1b1b1b;
    }
  }

  p {
    text-align: center;
  }

  .buttons {
    margin-top: 1rem;
    display: flex;
    justify-content: center;

    @media (min-width: 768px) {
      margin-top: 0;
      margin-left: 1rem;
    }
  }

  button {
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    font-weight: bold;
    width: 6em;

    &.close {
      border: 1px solid var(--app-section-title-color);
      &:hover {
        background-color: #ddd;
      }
      @media (prefers-color-scheme: dark) {
        &:hover {
          background-color: #555;
        }
      }
    }

    &.reload {
      margin-left: 1rem;
      color: white;
      background-color: var(--primary-700);
      &:hover {
        background-color: var(--primary-800);
      }
    }
  }
</style>
