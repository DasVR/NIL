<script lang="ts">
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';

  const branch = 'main';
  const ahead = 0;
  const behind = 0;
  const staged = 0;
  const unstaged = 0;
  const ci = 'idle';
</script>

<section class="pane" aria-label="Source control">
  <header class="head">
    <span class="eyebrow">Source control</span>
    <div class="branch">
      <span class="name">{branch}</span>
      <CopyAffordance value={branch} />
    </div>
  </header>
  <dl class="stats">
    <div><dt>Diff</dt><dd>{staged} staged · {unstaged} unstaged</dd></div>
    <div><dt>Sync</dt><dd>{ahead} ahead · {behind} behind</dd></div>
    <div><dt>CI</dt><dd class="mono">{ci}</dd></div>
  </dl>
  <p class="empty">No local git status yet. Open a repository to see diffs here.</p>
</section>

<style>
  .pane { padding: var(--s-3); display: flex; flex-direction: column; gap: var(--s-3); }
  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .head { display: flex; flex-direction: column; gap: 6px; }
  .branch { display: flex; align-items: center; gap: 4px; }
  .name { font: 500 var(--t-body)/1 var(--font-machine); color: var(--nil-ink); }
  .stats { display: flex; flex-direction: column; gap: var(--s-2); margin: 0; }
  .stats div { display: flex; justify-content: space-between; gap: var(--s-3); }
  dt { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
  dd { margin: 0; font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink-2); }
  .mono { font-family: var(--font-machine); }
  .empty { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: 0; }
</style>
