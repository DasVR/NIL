<script lang="ts">
  import type { ToolStep } from '$lib/agent/types';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';

  interface Props {
    step: ToolStep;
  }

  let { step }: Props = $props();

  let open = $state(step.state === 'error');

  $effect(() => {
    if (step.state === 'error') open = true;
  });

  const stateLabel = $derived(
    step.state === 'pending' ? 'pending'
      : step.state === 'running' ? 'running'
      : step.state === 'ok' ? 'ok'
      : 'error'
  );

  const stateGlyph = $derived(
    step.state === 'pending' ? '·'
      : step.state === 'running' ? '›'
      : step.state === 'ok' ? 'ok'
      : 'err'
  );

  const resultText = $derived(step.error || step.output || JSON.stringify(step.args, null, 2) || '');
  const resultBytes = $derived(new TextEncoder().encode(resultText).length);
  let showAll = $state(false);
  const PREVIEW = 4000;
  const displayText = $derived(showAll || resultText.length <= PREVIEW ? resultText : resultText.slice(0, PREVIEW));

  const indexLabel = $derived(String(step.index).padStart(2, '0'));

  // Real duration metric from the approval lifecycle (startTime/endTime are set
  // when the run is dispatched and settles). Blank cell when absent — grid stays.
  const durationLabel = $derived(
    step.startTime != null && step.endTime != null
      ? formatDuration(step.endTime - step.startTime)
      : ''
  );

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}s`;
  }
</script>

<article
  class="tool-card nil-scan"
  class:pending={step.state === 'pending'}
  data-state={step.state === 'running' ? 'working' : undefined}
  role="region"
  aria-label="{step.name} {step.primaryArg}"
>
  <div class="gutter" aria-hidden="true">
    <span class="idx">{indexLabel}</span>
    <svg class="nil-trace" viewBox="0 0 8 48" preserveAspectRatio="none">
      <path d="M4 0 V48" />
    </svg>
  </div>

  <div class="body">
    <header class="head">
      <span class="name">{step.name}</span>
      <span class="arg">{step.primaryArg}</span>
      <span class="state" data-state={step.state}>
        <span class="glyph">{stateGlyph}</span>
        <span class="label">{stateLabel}</span>
      </span>
      <span class="dur">{durationLabel}</span>
      <SpendMeter usage={step.usage} compact />
    </header>

    {#if step.state === 'error' || step.output || step.state === 'ok'}
      <button
        class="toggle nil-halo"
        type="button"
        aria-expanded={open}
        onclick={() => (open = !open)}
      >
        {open ? 'Hide output' : 'Show output'}
        {#if resultBytes > 0}
          <span class="bytes">{resultBytes} B</span>
        {/if}
      </button>
      <div class="nil-reveal" data-open={open ? 'true' : 'false'}>
        <div class="result">
          {#if step.state === 'error' && step.exitCode !== undefined}
            <p class="exit">exit {step.exitCode}</p>
          {/if}
          <pre><code>{displayText}</code></pre>
          {#if resultText.length > PREVIEW && !showAll}
            <button class="nil-halo show-all" type="button" onclick={() => (showAll = true)}>Show all</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</article>

<style>
  .tool-card {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: var(--s-2);
    padding: var(--s-2) 0;
  }

  .gutter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .idx {
    width: 2ch; /* fixed gutter column: index never nudges the trace spine */
    text-align: center;
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    letter-spacing: var(--track-tick);
    color: var(--nil-ink-3);
  }

  .nil-trace {
    flex: 1;
    width: 8px;
    min-height: 24px;
  }

  .head {
    display: flex;
    align-items: baseline;
    gap: var(--s-2);
    flex-wrap: wrap;
    min-height: 28px;
  }

  .name {
    font: 500 var(--t-body)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
  }

  .arg {
    font: var(--t-meta)/var(--lh-tight) var(--font-machine);
    color: var(--nil-ink-2);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .state {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  /* Fixed event-type pill: pending/running/ok/error swap without nudging the
     duration and spend columns left of the flex-end. */
  .state .glyph { width: 3ch; text-align: center; }
  .state .label { width: 7ch; }

  /* Duration metric: fixed right-aligned cell, blank but present when the run
     has no timing data — zero horizontal shift on reveal. */
  .dur {
    width: 6ch;
    text-align: end;
    flex-shrink: 0;
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    color: var(--nil-ink-3);
  }

  .state[data-state="running"] { color: var(--nil-ink); }
  .state[data-state="ok"] { color: var(--nil-ink-2); }
  .state[data-state="error"] { color: var(--sev-critical); }

  .glyph { font-variant-numeric: tabular-nums; }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    height: 24px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--nil-ink-3);
    font: var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    cursor: pointer;
  }

  .bytes {
    font-family: var(--font-machine);
    font-variant-numeric: tabular-nums;
  }

  /* Accordion accent: explicit left hairline on the reveal region. The
     block-size animation itself stays on the sanctioned 07 REVEAL primitive;
     only the state color flips at --dur-flip. */
  .nil-reveal {
    border-inline-start: 1px solid var(--nil-line);
    padding-inline-start: var(--s-2);
    margin-inline-start: 3px;
  }
  .nil-reveal[data-open="true"] {
    border-inline-start-color: var(--nil-line-hot);
    transition: border-color var(--dur-flip) var(--ease-out),
                block-size var(--dur-panel) var(--ease-out),
                opacity var(--dur-enter) var(--ease-out);
  }

  .result {
    max-block-size: 240px;
    overflow: auto;
    padding: var(--s-2);
    background: var(--nil-void);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
  }

  .result pre {
    margin: 0;
    font: var(--t-meta)/var(--lh-body) var(--font-machine);
    font-variant-numeric: tabular-nums; /* hex offsets / addresses never shift */
    color: var(--nil-ink-2);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .exit {
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    color: var(--sev-critical);
    margin-block-end: var(--s-2);
  }

  .show-all {
    margin-block-start: var(--s-2);
    border: 0;
    background: none;
    color: var(--nil-ink-2);
    font: var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .pending .body {
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-card);
    padding: var(--s-2) var(--s-3);
  }
</style>
