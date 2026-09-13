<script lang="ts">
  const repo = 'DasVR/NIL';
  const prs = 0;
  const issues = 0;
</script>

<section class="pane" aria-label="GitHub">
  <header class="head">
    <span class="eyebrow">GitHub</span>
    <span class="repo">{repo}</span>
  </header>
  <dl class="stats">
    <div><dt>Pull requests</dt><dd>{prs}</dd></div>
    <div><dt>Issues</dt><dd>{issues}</dd></div>
  </dl>
  <p class="empty">Connect a repository to see pull requests and issues for this workspace.</p>
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
  .repo { font: 500 var(--t-body)/1 var(--font-machine); color: var(--nil-ink); }
  .stats { display: flex; flex-direction: column; gap: var(--s-2); margin: 0; }
  .stats div { display: flex; justify-content: space-between; }
  dt { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
  dd { margin: 0; font: var(--t-meta)/1 var(--font-machine); color: var(--nil-ink-2); }
  .empty { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: 0; }
</style>
