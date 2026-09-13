<script lang="ts">
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import { droplet } from '$lib/motion/droplet';
  import { project, type GithubItem } from '$lib/project.svelte.ts';

  const gh = $derived(project.github);

  function openItem(item: GithubItem) {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="pane" aria-label="GitHub">
  <header class="head">
    <span class="eyebrow">GitHub</span>
    {#if gh}
      <div class="repo-row">
        <span class="repo">{gh.repo}</span>
        <CopyAffordance value={gh.repo} />
      </div>
    {/if}
  </header>

  {#if !gh}
    <p class="empty">Connect a GitHub remote to see pull requests and issues for this workspace.</p>
  {:else}
    {#if gh.pullRequests}
      <p class="g-name">Pull requests</p>
      {#if gh.pullRequests.length === 0}
        <p class="empty">No open pull requests.</p>
      {:else}
        <ul class="list">
          {#each gh.pullRequests as item (item.number)}
            <li>
              <button class="row nil-halo" type="button" {@attach droplet} onclick={() => openItem(item)}>
                <span class="num">#{item.number}</span>
                <span class="title">{item.title}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="empty">gh is not available, so pull requests were not loaded.</p>
    {/if}

    {#if gh.issues}
      <p class="g-name">Issues</p>
      {#if gh.issues.length === 0}
        <p class="empty">No open issues.</p>
      {:else}
        <ul class="list">
          {#each gh.issues as item (`i${item.number}`)}
            <li>
              <button class="row nil-halo" type="button" {@attach droplet} onclick={() => openItem(item)}>
                <span class="num">#{item.number}</span>
                <span class="title">{item.title}</span>
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
  .repo-row { display: flex; align-items: center; gap: 4px; }
  .repo { font: 500 var(--t-body)/1 var(--font-machine); color: var(--nil-ink); }
  .g-name {
    margin: 0;
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .empty { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: 0; }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .row {
    display: grid;
    grid-template-columns: 4.5ch minmax(0, 1fr);
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
  .num { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-3); }
  .title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink);
  }
</style>
