<script lang="ts">
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import { droplet } from '$lib/motion/droplet';
  import { project, gitCiLabel, type GitCi, type GitEntry } from '$lib/project.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';

  const git = $derived(project.git);
  const staged = $derived(git?.staged ?? []);
  const unstaged = $derived(git?.unstaged ?? []);

  function openEntry(entry: GitEntry) {
    const path = entry.path.includes(' -> ') ? entry.path.split(' -> ').at(-1) ?? entry.path : entry.path;
    workspace.openFile(path);
  }

  function statusWord(code: string): string {
    switch (code) {
      case 'M': return 'modified';
      case 'A': return 'added';
      case 'D': return 'deleted';
      case 'R': return 'renamed';
      case 'C': return 'copied';
      case 'U': return 'unmerged';
      case '?': return 'untracked';
      default: return code;
    }
  }

  function ciWord(ci: GitCi): string {
    return gitCiLabel(ci);
  }

  function openCi(ci: GitCi) {
    if (!ci.url) return;
    window.open(ci.url, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="pane" aria-label="Source control">
  <header class="head">
    <span class="eyebrow">Source control</span>
    {#if git}
      <div class="branch">
        <span class="name">{git.branch}</span>
        <CopyAffordance value={git.branch} />
      </div>
    {/if}
  </header>

  {#if !git}
    <p class="empty">
      {#if project.bridge}
        This folder is not a git work tree.
      {:else}
        No local git status yet. Open a repository in the Vite workspace to see diffs here.
      {/if}
    </p>
  {:else}
    <dl class="stats">
      <div>
        <dt>Diff</dt>
        <dd>{staged.length} staged · {unstaged.length} unstaged</dd>
      </div>
      {#if git.ahead != null || git.behind != null}
        <div>
          <dt>Sync</dt>
          <dd>{git.ahead ?? 0} ahead · {git.behind ?? 0} behind</dd>
        </div>
      {/if}
      <div class="ci-block">
        <dt>CI</dt>
        <dd>
          {#if git.ci}
            {@const run = git.ci}
            <button class="ci nil-halo" type="button" onclick={() => openCi(run)} disabled={!run.url}>
              {run.name} · {ciWord(run)}
            </button>
          {:else if git.ciLoaded}
            No workflow runs on this branch yet.
          {:else}
            gh is not available, so CI was not loaded.
          {/if}
        </dd>
      </div>
    </dl>

    {#if staged.length === 0 && unstaged.length === 0}
      <p class="empty">Working tree clean.</p>
    {:else}
      {#if staged.length}
        <p class="g-name">Staged</p>
        <ul class="list">
          {#each staged as entry (`s:${entry.path}`)}
            <li>
              <button class="row nil-halo" type="button" {@attach droplet} onclick={() => openEntry(entry)}>
                <span class="st">{statusWord(entry.status)}</span>
                <span class="path">{entry.path}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      {#if unstaged.length}
        <p class="g-name">Unstaged</p>
        <ul class="list">
          {#each unstaged as entry (`u:${entry.path}`)}
            <li>
              <button class="row nil-halo" type="button" {@attach droplet} onclick={() => openEntry(entry)}>
                <span class="st">{statusWord(entry.status)}</span>
                <span class="path">{entry.path}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  {/if}
</section>

<style>
  .pane { padding: var(--s-3); display: flex; flex-direction: column; gap: var(--s-3); min-height: 0; overflow: auto; }
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
  .ci-block { flex-direction: column; align-items: flex-start; gap: 4px; }
  dt { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
  dd { margin: 0; font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink-2); }
  .ci {
    border: 0;
    background: transparent;
    padding: 0;
    color: inherit;
    font: var(--t-meta)/1 var(--font-machine);
    cursor: pointer;
    text-align: left;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ci:disabled { cursor: default; }
  .empty { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: 0; }
  .g-name {
    margin: 0;
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .row {
    display: grid;
    grid-template-columns: 7ch minmax(0, 1fr);
    align-items: center;
    gap: var(--s-2);
    width: 100%;
    height: var(--row-h);
    padding: 0 var(--s-2);
    border: 0;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-2);
    cursor: pointer;
    text-align: left;
  }
  .st { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
  .path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--t-micro)/1 var(--font-machine);
  }
</style>
