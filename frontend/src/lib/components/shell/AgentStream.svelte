<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { pinned } from '$lib/motion/pinned.svelte.ts';
  import ToolBlock from '$lib/components/ui/ToolBlock.svelte';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';
  import type { Snippet } from 'svelte';

  let { emptyState }: { emptyState?: Snippet } = $props();

  let isPinned = $state(true);

  function onPinChange(next: boolean) {
    isPinned = next;
  }

  function jumpToLatest(node: HTMLElement) {
    node.scrollTo({ top: node.scrollHeight, behavior: 'instant' });
    isPinned = true;
  }

  let scroller: HTMLElement | undefined = $state();

  // Receipt time: stamped once per step id at first render (logger time, not
  // emitter time — terminal convention). Fixed HH:MM:SS width keeps the time
  // column from ever nudging content on re-render.
  const receiptTimes = new Map<string, string>();
  function receiptTime(id: string): string {
    let t = receiptTimes.get(id);
    if (!t) {
      const d = new Date();
      t = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');
      receiptTimes.set(id, t);
    }
    return t;
  }

  // Real binding behind the jump badge's G keycap (dispatched by keymap.svelte.ts).
  $effect(() => {
    const jump = () => {
      if (scroller) jumpToLatest(scroller);
    };
    window.addEventListener('nil:jump-latest', jump);
    return () => window.removeEventListener('nil:jump-latest', jump);
  });
</script>

<section class="stream" aria-label="Agent stream">
  <div
    class="log"
    bind:this={scroller}
    {@attach (n) => pinned(n, onPinChange)}
    role="log"
    aria-live="polite"
    aria-relevant="additions"
  >
    {#if agentRun.steps.length === 0}
      <div class="idle">
        {#if emptyState}
          {@render emptyState()}
        {:else}
          <p class="idle-title">/Stream(01)</p>
          <p class="idle-copy">No findings yet. Run a hunt to start collecting evidence.</p>
        {/if}
      </div>
    {/if}

    {#each agentRun.steps as step (step.id)}
      <!-- Row shell: fixed 8ch time column + isolated content cell.
           contain: content keeps an append from relayouting the document. -->
      <div class="row" class:tick={step.kind === 'thought'}>
        <span class="time">{receiptTime(step.id)}</span>
        <div class="cell">
          {#if step.kind === 'tool'}
            <ToolBlock {step} />
          {:else if step.kind === 'finding'}
            <FindingCard finding={{
              id: step.id,
              title: step.title,
              severity: step.severity,
              status: step.status,
              cvss: step.cvss,
              vector: step.vector,
              evidence: step.evidence,
              assessment: step.assessment,
              remediation: step.remediation,
            }} />
          {:else if step.kind === 'message'}
            <div class="msg" data-role={step.role}>
              {#if step.role === 'user'}
                <span class="prompt">&gt;</span>
              {/if}
              <p class="msg-text" class:interrupted={step.interrupted}>{step.text}</p>
              {#if step.interrupted}
                <span class="flag">interrupted</span>
              {/if}
            </div>
          {:else if step.kind === 'thought'}
            <p class="thought">{step.text}</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if !isPinned}
    <button
      class="jump nil-lift nil-halo"
      type="button"
      onclick={() => { if (scroller) jumpToLatest(scroller); }}
    >
      Jump to latest <kbd aria-hidden="true">G</kbd>
    </button>
  {/if}

  {#if agentRun.running}
    <div class="runbar">
      <span class="nil-scan" data-state="working">Streaming</span>
      <button class="nil-halo stop" type="button" onclick={() => agentRun.stop()}>Stop</button>
    </div>
  {/if}
</section>

<style>
  .stream {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
    overflow: hidden;
  }

  .log {
    flex: 1;
    min-height: 0;
    overflow: auto;
    overflow-anchor: none; /* no browser scroll-anchoring rubber-banding; pinned.svelte.ts owns position */
    padding: var(--s-4);
    display: flex;
    flex-direction: column;
    /* No gap: row dividers own the vertical rhythm. */
  }

  /* Telemetry grid: fixed-width time column + content cell. */
  .row {
    display: grid;
    grid-template-columns: 8ch minmax(0, 1fr);
    column-gap: var(--s-3);
    align-items: baseline;
    padding-block: var(--s-2);
    border-block-start: 1px solid var(--nil-line);
    contain: content; /* append isolation: no document relayout */
  }

  /* TRACE weight — primary rows. */
  .time {
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    color: var(--nil-ink-3);
  }

  .cell { min-width: 0; }

  /* TICK weight — cadence rows sit low: ink-3, compact, subdued rule. */
  .row.tick {
    padding-block: 2px;
  }

  .row.tick .time {
    color: var(--nil-ink-4);
  }

  .idle {
    margin: 0;
    width: 100%;
    min-height: 100%;
  }

  .idle-title {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    color: var(--nil-ink-3);
    margin-block-end: var(--s-2);
  }

  .idle-copy {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .msg {
    display: flex;
    align-items: flex-start;
    gap: var(--s-2);
  }

  .msg[data-role="user"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink);
  }

  .msg[data-role="assistant"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .prompt {
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-3);
  }

  .flag {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  .thought {
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-3);
  }

  .jump {
    position: absolute;
    inset-block-end: var(--s-5);
    inset-inline-start: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .jump kbd {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-2); /* keycap standard: AA on --nil-raised */
  }

  .runbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    padding: 0 var(--s-3);
    border-top: 1px solid var(--nil-line);
    font: var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-2);
  }

  .stop {
    height: 24px;
    padding: 0 var(--s-2);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
</style>
