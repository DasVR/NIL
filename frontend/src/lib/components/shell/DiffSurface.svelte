<script lang="ts">
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import InlineDiff from '$lib/ui/InlineDiff.svelte';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { project } from '$lib/project.svelte.ts';

  const branch = $derived(project.git?.branch ?? '');
  const diff = $derived(workspace.diffText || project.git?.diff || '');
</script>

<section class="diffs" aria-label="Diffs">
  <header class="head">
    {#if branch}
      <div class="branch">
        <span class="name">{branch}</span>
        <CopyAffordance value={branch} />
      </div>
    {/if}
  </header>
  {#if diff}
    <InlineDiff {diff} variant="page" />
  {:else}
    <p class="empty">No diffs yet. Changes the agent makes to files, or uncommitted git changes, will land here.</p>
  {/if}
</section>

<style>
  .diffs {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-4);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
    overflow: auto;
  }
  .head { display: flex; flex-direction: column; gap: 6px; }
  .branch { display: flex; align-items: center; gap: 4px; }
  .name { font: 500 var(--t-body)/1 var(--font-machine); color: var(--nil-ink); }
  .empty { margin: 0; font: var(--t-body)/var(--lh-body) var(--font-ui); color: var(--nil-ink-2); }
</style>
