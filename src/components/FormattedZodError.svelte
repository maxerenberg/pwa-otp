<script lang="ts">
  import { ZodError } from "zod";

  export let error: ZodError;
</script>

<ul>
  {#each error.errors as issue}
    {#if issue.path.length > 0}
      <li>
        {issue.path[0] + ": "}{issue.message}
      </li>
    {:else if issue.code === "invalid_union"}
      <li>
        union:
        <ul>
          {#each issue.unionErrors as childError}
            <li>
              <svelte:self error={childError} />
            </li>
          {/each}
        </ul>
      </li>
    {/if}
  {/each}
</ul>

<style>
  ul {
    padding-left: 1em;
    list-style-type: revert;
    text-align: left;
  }
  li {
    line-height: 1.25;
  }
</style>
