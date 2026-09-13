<script lang="ts">
  import { droplet } from '$lib/motion/droplet';
  import { engagementFiles, workspace, type ContextFile } from '$lib/stores/workspace.svelte.ts';
  import { project } from '$lib/project.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';

  let filter = $state('');
  let pin = $state('');

  const files = $derived(engagementFiles());
  const attached = $derived(new Set(workspace.attached.map((f) => f.path)));
  const q = $derived(filter.trim().toLowerCase());

  type Group = { name: string; files: ContextFile[] };

  const groups = $derived.by(() => {
    const filtered = q
      ? files.filter((f) => f.path.toLowerCase().includes(q) || f.label.toLowerCase().includes(q))
      : files;
    const map = new Map<string, ContextFile[]>();
    for (const file of filtered) {
      const top = file.path.split('/')[0] || file.path;
      const arr = map.get(top) ?? [];
      arr.push(file);
      map.set(top, arr);
    }
    const result: Group[] = [];
    for (const [name, list] of map) {
      result.push({ name, files: list.slice(0, q ? 80 : 24) });
    }
    return result;
  });

  const shown = $derived(groups.reduce((n, g) => n + g.files.length, 0));

  function pick(file: ContextFile) {
    workspace.attachFile(file);
    workspace.openFile(file.path);
  }

  function submitPin() {
    const value = pin.trim();
    if (!value) return;
    workspace.pinPath(value);
    pin = '';
  }
</script>

<section class="pane" aria-label="Files">
  <header class="head">
    <span class="eyebrow">Files</span>
    {#if project.loading}
      <span class="meta">loading</span>
    {:else if project.bridge}
      <span class="meta">{files.length}</span>
    {/if}
  </header>

  <input
    class="find nil-halo"
    type="search"
    placeholder="Filter paths"
    aria-label="Filter files"
    bind:value={filter}
  />

  <form class="pin-row" onsubmit={(e) => { e.preventDefault(); submitPin(); }}>
    <input
      class="find nil-halo"
      type="text"
      placeholder="Pin a path"
      aria-label="Pin a path"
      bind:value={pin}
    />
    <button class="nil-lift nil-halo go" type="submit" disabled={!pin.trim()}>Pin</button>
  </form>

  {#if files.length === 0}
    <p class="empty">
      {#if project.bridge}
        No files matched. Pin a path to attach it as context.
      {:else}
        No files in this session. Pin a path, or start the Vite workspace bridge to browse the repo.
      {/if}
    </p>
  {:else}
    {#each groups as group (group.name)}
      <div class="group">
        <p class="g-name">{group.name}</p>
        <ul class="list">
          {#each group.files as file (file.id)}
            <li>
              <button
                class="row nil-halo"
                class:on={attached.has(file.path)}
                type="button"
                {@attach droplet}
                onclick={() => pick(file)}
              >
                <NilIcon name="file" size={16} />
                <span class="name">{file.label}</span>
                <span class="path">{file.path}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
    {#if !q && files.length > shown}
      <p class="empty">Showing {shown} of {files.length}. Filter to narrow the list.</p>
    {/if}
  {/if}
</section>

<style>
  .pane {
    padding: var(--s-3);
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    min-height: 0;
    flex: 1;
    overflow: auto;
  }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-2); }
  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .meta { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-4); }
  .find {
    width: 100%;
    height: var(--row-h);
    padding: 0 var(--s-2);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-void);
    color: var(--nil-ink);
    font: var(--t-meta)/1 var(--font-machine);
  }
  .pin-row { display: flex; gap: 6px; }
  .go {
    height: var(--row-h);
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
    flex-shrink: 0;
  }
  .go:disabled { opacity: 0.4; cursor: not-allowed; }
  .empty {
    margin: 0;
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-3);
  }
  .group { display: flex; flex-direction: column; gap: 2px; }
  .g-name {
    margin: var(--s-2) 0 2px;
    font: 600 var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
  }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .row {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr) auto;
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
  .row.on { color: var(--nil-ink); }
  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 500 var(--t-meta)/1 var(--font-ui);
  }
  .path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
  }
</style>
