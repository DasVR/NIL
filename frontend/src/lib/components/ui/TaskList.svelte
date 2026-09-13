<script lang="ts">
  import { droplet } from '$lib/motion/droplet';
  import type { ToolState } from '$lib/agent/types';

  export interface TaskItem {
    id: string;
    label: string;
    detail: string;
    status: ToolState;
  }

  interface Props {
    tasks: TaskItem[];
    onPick?: (id: string) => void;
  }

  let { tasks, onPick }: Props = $props();

  function glyph(status: ToolState): string {
    switch (status) {
      case 'ok': return 'ok';
      case 'running': return '›';
      case 'error': return 'err';
      case 'pending': return '·';
      default: {
        const _n: never = status;
        return _n;
      }
    }
  }
</script>

<section class="plan" aria-label="Task list">
  <p class="eyebrow">Plan</p>
  <ol>
    {#each tasks as task, i (task.id)}
      <li>
        <button
          class="row nil-halo"
          type="button"
          data-state={task.status === 'running' ? 'working' : undefined}
          class:nil-scan={task.status === 'running'}
          {@attach droplet}
          onclick={() => onPick?.(task.id)}
        >
          <span class="n">{String(i + 1).padStart(2, '0')}</span>
          <span class="glyph" data-state={task.status}>{glyph(task.status)}</span>
          <span class="label">{task.label}</span>
          {#if task.detail}
            <span class="detail">{task.detail}</span>
          {/if}
        </button>
      </li>
    {/each}
  </ol>
</section>

<style>
  .plan { display: flex; flex-direction: column; gap: var(--s-2); padding-block: var(--s-2); }
  .eyebrow {
    margin: 0;
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .row {
    display: grid;
    grid-template-columns: 2ch 2ch minmax(0, 1fr) auto;
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
  .n, .glyph { font: 500 var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-3); }
  .glyph[data-state='ok'] { color: var(--nil-ink-2); }
  .glyph[data-state='error'] { color: var(--nil-ink); }
  .label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink);
  }
  .detail {
    min-width: 0;
    max-width: 28ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
  }
</style>
