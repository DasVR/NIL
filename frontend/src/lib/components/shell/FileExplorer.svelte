<script lang="ts">
  import { droplet } from '$lib/motion/droplet';
  import { engagementFiles, workspace, type ContextFile } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';

  const files = $derived(engagementFiles());
  const attached = $derived(new Set(workspace.attached.map((f) => f.id)));

  function toggle(file: ContextFile) {
    if (attached.has(file.id)) workspace.detachFile(file.id);
    else workspace.attachFile(file);
  }
</script>

<section class="pane" aria-label="Files">
  <header class="head">
    <span class="eyebrow">Files</span>
  </header>
  {#if files.length === 0}
    <p class="empty">No files in this session. Pin a path with @ in the composer, or open a project from the rail.</p>
  {:else}
    <ul class="list">
      {#each files as file (file.id)}
        <li>
          <button
            class="row nil-halo"
            class:on={attached.has(file.id)}
            type="button"
            {@attach droplet}
            onclick={() => toggle(file)}
          >
            <NilIcon name="file" size={16} />
            <span class="name">{file.label}</span>
            <span class="path">{file.path}</span>
          </button>
        </li>
      {/each}
    </ul>
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
  }
  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .empty {
    margin: 0;
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
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
