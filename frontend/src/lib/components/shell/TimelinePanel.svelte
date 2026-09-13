<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { droplet } from '$lib/motion/droplet';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import type { Step } from '$lib/agent/types';

  interface EventRow {
    id: string;
    kind: 'you' | 'nil' | 'tool' | 'finding' | 'thought';
    label: string;
  }

  function rowFromStep(step: Step): EventRow {
    switch (step.kind) {
      case 'message':
        return {
          id: step.id,
          kind: step.role === 'user' ? 'you' : 'nil',
          label: step.text.replace(/\s+/g, ' ').slice(0, 96),
        };
      case 'tool':
        return {
          id: step.id,
          kind: 'tool',
          label: [step.name, step.primaryArg].filter(Boolean).join(' · '),
        };
      case 'finding':
        return {
          id: step.id,
          kind: 'finding',
          label: step.title,
        };
      case 'thought':
        return {
          id: step.id,
          kind: 'thought',
          label: step.text.replace(/\s+/g, ' ').slice(0, 96),
        };
      default: {
        const _n: never = step;
        return _n;
      }
    }
  }

  const events = $derived(agentRun.steps.map(rowFromStep));

  function kindLabel(kind: EventRow['kind']): string {
    switch (kind) {
      case 'you': return 'you';
      case 'nil': return 'nil';
      case 'tool': return 'tool';
      case 'finding': return 'find';
      case 'thought': return 'tick';
      default: {
        const _n: never = kind;
        return _n;
      }
    }
  }
</script>

<div class="pane" aria-label="Timeline">
  {#if events.length === 0}
    <div class="empty-state">
      <NilIcon name="clock" size={20} />
      <p>No timeline events</p>
      <span>Hunt activity lands here as the agent works.</span>
    </div>
  {:else}
    <ol class="list">
      {#each events as ev (ev.id)}
        <li>
          <div class="row nil-row-host" {@attach droplet}>
            <span class="kind">{kindLabel(ev.kind)}</span>
            <span class="label" class:machine={ev.kind === 'tool'}>{ev.label}</span>
          </div>
        </li>
      {/each}
    </ol>
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
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .row {
    display: grid;
    grid-template-columns: 4.5ch minmax(0, 1fr);
    align-items: baseline;
    gap: var(--s-2);
    min-height: var(--row-h);
    padding: 6px var(--s-2);
  }
  .kind {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-4);
  }
  .label {
    min-width: 0;
    font: var(--t-meta)/1.35 var(--font-ui);
    color: var(--nil-ink-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label.machine { font-family: var(--font-machine); letter-spacing: var(--track-mono); }
</style>
