<script lang="ts">
  export let stroke: string;
  export let height: string;
  export let className: string | undefined = undefined;
  export { className as class };
</script>

<svg
  class={className}
  width={height}
  {height}
  viewBox="0 0 100 100"
  fill="none"
>
  <path d="M 50 5 A 45 45 0 1 0 95 50" {stroke} stroke-width={10} />
</svg>

<style>
  svg {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
