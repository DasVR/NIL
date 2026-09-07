<script lang="ts">
  import { magnetic } from '$lib/motion/magnetic.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import type { FindingSeverity } from '$lib/agent/types';

  const templates = [
    { id: 'local-scan', label: 'New local scan', desc: 'Sandboxed audit against a local target.' },
    { id: 'web-audit', label: 'New web audit', desc: 'Crawl, fingerprint, and score a public web app.' },
    { id: 'import', label: 'Import engagement', desc: 'Load an existing engagement from JSON.' },
  ];

  const severityOrder: FindingSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

  let counts = $derived(
    severityOrder
      .map((sev) => ({ sev, n: agentRun.findings.filter((f) => f.severity === sev).length }))
      .filter((c) => c.n > 0)
  );

  function startEngagement() {
    tabsStore.showStream();
    appState.focusComposer();
  }
</script>

<section class="empty">
  <div class="dither" aria-hidden="true"></div>

  <div class="hero">
    <p class="kicker">nil</p>
    <h1 class="title">Where should we look first?</h1>
    <p class="lede">Pick a template, or ask the agent below to start an engagement.</p>

    {#if counts.length > 0}
      <div class="counters" role="group" aria-label="Open findings by severity">
        {#each counts as c (c.sev)}
          <span class="counter" style:--sev={`var(--sev-${c.sev})`}>
            <span class="n">{c.n}</span>
            <span class="counter-label">{c.sev}</span>
          </span>
        {/each}
      </div>
    {/if}

    <div class="actions">
      {#each templates as template (template.id)}
        <button
          class="nil-lift nil-halo nil-magnetic row"
          type="button"
          {@attach magnetic}
          onclick={() => startEngagement()}
        >
          <span class="label">{template.label}</span>
          <span class="desc">{template.desc}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .empty {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  /* Identity-moment texture, applied once here (not per panel). Ink-derived,
     not a brand accent — same discipline as --grain-opacity on the shell. */
  .dither {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(var(--nil-ink-4) 0.5px, transparent 0.5px);
    background-size: 5px 5px;
    -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 70%);
    mask-image: radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 70%);
    opacity: 0.5;
  }

  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--s-3);
    padding: var(--s-6);
    max-width: 36rem;
  }

  .kicker {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    text-transform: lowercase;
    color: var(--nil-ink-3);
  }

  .title {
    font: 500 var(--t-head)/var(--lh-tight) var(--font-ui);
    letter-spacing: var(--track-tight);
    color: var(--nil-ink);
  }

  .lede {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
    max-width: 42ch;
  }

  .counters {
    display: flex;
    gap: var(--s-2);
    margin-block-start: var(--s-2);
  }

  .counter {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 6px var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
  }

  .counter .n {
    font: 600 var(--t-lead)/1 var(--font-machine);
    color: var(--sev);
    font-variant-numeric: tabular-nums;
  }

  .counter .counter-label {
    font: 500 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    margin-block-start: var(--s-3);
  }

  .row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px var(--s-3);
    text-align: left;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    cursor: pointer;
  }

  .label {
    font: 500 var(--t-body)/1.3 var(--font-ui);
    color: var(--nil-ink);
  }

  .desc {
    font: var(--t-meta)/1.3 var(--font-ui);
    color: var(--nil-ink-3);
  }
</style>
