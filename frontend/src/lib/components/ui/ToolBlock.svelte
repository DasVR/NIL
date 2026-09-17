<script lang="ts">
  import { untrack } from 'svelte';
  import type { ToolStep } from '$lib/agent/types';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';
  import InlineDiff from '$lib/ui/InlineDiff.svelte';
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { toolFilePath } from '$lib/agent/run.svelte.ts';

  interface Props {
    step: ToolStep;
  }

  let { step }: Props = $props();

  // Initial open state only — later error transitions are handled by the $effect
  // below, not by re-reading step here (untrack makes that intent explicit).
  let open = $state(untrack(() => step.state === 'error'));

  $effect(() => {
    if (step.state === 'error') open = true;
  });

  // Wireframe callout 06: hovering the header of an already-open row lights up
  // the changed line in the diff below it. Hover never opens the row — click
  // does that — so this is purely additive and only meaningful while open.
  // Keyboard focus inside the header gets the same affordance.
  let headHot = $state(false);
  const focusDiffLine = $derived(open && headHot);

  // CHECK-DRAW (motion.css #21): a CSS transition can't animate a value it
  // was already created with — if the SVG is first inserted with
  // data-drawn="true" the moment step.state flips to 'ok', there's no
  // "before" for stroke-dashoffset to transition FROM, so it would just
  // appear fully drawn instantly. Mount at data-drawn="false" and flip it
  // one frame later so there's an actual paint in between for the
  // transition to animate across.
  let checkDrawn = $state(false);
  $effect(() => {
    if (step.state !== 'ok') { checkDrawn = false; return; }
    checkDrawn = false;
    const raf = requestAnimationFrame(() => { checkDrawn = true; });
    return () => cancelAnimationFrame(raf);
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
      : step.state === 'error' ? 'err'
      : ''
  );

  const resultText = $derived(step.error || step.output || JSON.stringify(step.args, null, 2) || '');
  const resultBytes = $derived(new TextEncoder().encode(resultText).length);
  let showAll = $state(false);
  const PREVIEW = 4000;
  const displayText = $derived(showAll || resultText.length <= PREVIEW ? resultText : resultText.slice(0, PREVIEW));
  const isDiff = $derived(/^(diff --git |@@ |\+\+\+ |--- )/m.test(resultText));
  const touchedFile = $derived(toolFilePath(step));
  const copyValue = $derived(touchedFile || step.primaryArg);

  $effect(() => {
    if (isDiff && resultText) workspace.setDiff(resultText);
  });

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

  function openTouched() {
    const path = touchedFile;
    if (!path) return;
    workspace.openFile(path);
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
    <!-- Hover here is a purely additive highlight of a line that is already
         visible in the diff below; keyboard users get the identical affordance
         through focusin/focusout on the buttons inside. Nothing is gated
         behind the hover, so the header stays a plain header. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <header
      class="head"
      onmouseenter={() => (headHot = true)}
      onmouseleave={() => (headHot = false)}
      onfocusin={() => (headHot = true)}
      onfocusout={() => (headHot = false)}
    >
      <button
        class="toggle nil-halo"
        type="button"
        aria-expanded={open}
        onclick={() => (open = !open)}
      >
        <span class="chev" class:open><NilIcon name="chevron-right" size={16} /></span>
        <span class="name">{step.name}</span>
      </button>
      <span class="arg-row">
        {#if touchedFile}
          <button class="arg link nil-halo" type="button" onclick={openTouched}>{touchedFile}</button>
        {:else}
          <span class="arg">{step.primaryArg}</span>
        {/if}
        {#if copyValue}
          <CopyAffordance value={copyValue} />
        {/if}
      </span>
      <span class="state" data-state={step.state}>
        {#if step.state === 'ok'}
          <svg class="glyph nil-check-draw" data-drawn={checkDrawn} width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="4,13 9,18 20,6" pathLength="1" />
          </svg>
        {:else}
          <span class="glyph">{stateGlyph}</span>
        {/if}
        <span class="label">{stateLabel}</span>
      </span>
      <span class="dur">{durationLabel}</span>
      <SpendMeter usage={step.usage} compact />
    </header>

    <div class="nil-reveal" data-open={open ? 'true' : 'false'}>
      {#if step.state === 'error' || step.output || step.state === 'ok'}
        <div class="result">
          {#if step.state === 'error' && step.exitCode !== undefined}
            <p class="exit">exit {step.exitCode}</p>
          {/if}
          {#if isDiff}
            <InlineDiff diff={displayText} focused={focusDiffLine} />
          {:else}
            <pre><code>{displayText}</code></pre>
          {/if}
          {#if resultText.length > PREVIEW && !showAll}
            <button class="nil-halo show-all" type="button" onclick={() => (showAll = true)}>Show all</button>
          {/if}
          {#if resultBytes > 0}
            <span class="bytes">{resultBytes} B</span>
          {/if}
        </div>
      {/if}
    </div>
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

  .arg-row {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    max-width: 100%;
  }
  .arg {
    font: var(--t-meta)/var(--lh-tight) var(--font-machine);
    color: var(--nil-ink-2);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .arg.link {
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }
  .arg.link:hover { color: var(--nil-ink); }

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
    /* pending -> running -> ok is a state change; the ink steps, it doesn't
       flicker. Color only, so it survives reduced motion. */
    transition: color var(--dur-enter) var(--ease-out);
  }

  /* Fixed event-type pill: pending/running/ok/error swap without nudging the
     duration and spend columns left of the flex-end. */
  .state .glyph { width: 3ch; text-align: center; }
  .state .label { width: 7ch; }
  .state svg.glyph {
    display: inline-block;
    width: 3ch;
    height: 12px;
    vertical-align: middle;
    flex-shrink: 0;
  }

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
    align-items: baseline;
    gap: var(--s-2);
    min-width: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .chev {
    display: grid;
    place-items: center;
    color: var(--nil-ink-3);
    /* A quarter turn is a real move — the one spring, at --dur-enter, so it
       lands with the REVEAL below instead of snapping ahead of it. */
    transition: transform var(--dur-enter) var(--ease-spring);
    flex-shrink: 0;
  }
  .chev.open { transform: rotate(90deg); }

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
    background: var(--nil-raised);
    box-shadow: var(--lift-1);
  }
</style>
