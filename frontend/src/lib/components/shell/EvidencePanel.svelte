<script lang="ts">
  import { agentRun, toolFilePath } from '$lib/agent/run.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { droplet } from '$lib/motion/droplet';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import type { Step } from '$lib/agent/types';

  interface Artifact {
    id: string;
    name: string;
    detail: string;
    path: string | null;
  }

  function artifactsFrom(steps: Step[]): Artifact[] {
    const out: Artifact[] = [];
    for (const step of steps) {
      switch (step.kind) {
        case 'tool': {
          const path = toolFilePath(step);
          const detail = path || step.output?.slice(0, 120) || step.error || step.primaryArg;
          if (!detail) break;
          out.push({
            id: step.id,
            name: step.name,
            detail,
            path,
          });
          break;
        }
        case 'finding': {
          const evidence = step.evidence.trim();
          if (!evidence) break;
          out.push({
            id: step.id,
            name: step.title,
            detail: evidence.slice(0, 160),
            path: null,
          });
          break;
        }
        case 'message':
        case 'thought':
          break;
        default: {
          const _n: never = step;
          void _n;
        }
      }
    }
    return out;
  }

  const artifacts = $derived.by(() => {
    const fromSteps = artifactsFrom(agentRun.steps);
    const seen = new Set(fromSteps.map((a) => a.id));
    const extra: Artifact[] = [];
    for (const finding of agentRun.findings) {
      if (seen.has(finding.id)) continue;
      const evidence = finding.evidence.trim();
      if (!evidence) continue;
      extra.push({
        id: finding.id,
        name: finding.title,
        detail: evidence.slice(0, 160),
        path: null,
      });
    }
    return [...fromSteps, ...extra];
  });

  function open(item: Artifact) {
    if (item.path) workspace.openFile(item.path);
  }
</script>

<div class="pane" aria-label="Evidence">
  {#if artifacts.length === 0}
    <div class="empty-state">
      <NilIcon name="folder" size={20} />
      <p>No evidence collected</p>
      <span>Artifacts from tool runs appear here.</span>
    </div>
  {:else}
    <ul class="list">
      {#each artifacts as item (item.id)}
        <li>
          <div class="item">
            <button
              class="row nil-halo"
              type="button"
              {@attach droplet}
              disabled={!item.path}
              onclick={() => open(item)}
            >
              <span class="name">{item.name}</span>
              <span class="detail">{item.detail}</span>
            </button>
            {#if item.path}
              <span class="copy">
                <CopyAffordance value={item.path} />
              </span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .pane { min-height: 0; overflow: auto; }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    padding: var(--s-6) var(--s-3);
    text-align: center;
    color: var(--nil-ink-3);
  }
  .empty-state p {
    margin: 0;
    font: 500 var(--t-body)/1.3 var(--font-ui);
    color: var(--nil-ink-2);
  }
  .empty-state span { font: var(--t-meta)/var(--lh-body) var(--font-ui); }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
  .row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    min-height: var(--row-h);
    padding: 6px var(--s-2);
    border: 0;
    border-radius: var(--r-field);
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: inherit;
  }
  .row:disabled { cursor: default; }
  .name { font: 500 var(--t-meta)/1.3 var(--font-ui); color: var(--nil-ink); }
  .detail {
    font: var(--t-micro)/1.35 var(--font-machine);
    color: var(--nil-ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .copy { padding-inline-end: 4px; }
</style>
