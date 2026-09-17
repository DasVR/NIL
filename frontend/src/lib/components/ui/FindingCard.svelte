<script lang="ts">
  import type { Finding, FindingStatus } from '$lib/agent/types';
  import { formatCvss, findingConfirmed, severityShape, severityToken } from '$lib/findings/display';
  import { scramble } from '$lib/motion/scramble.svelte.ts';
  import { settle } from '$lib/motion/settle';
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';

  interface Props {
    finding: Finding;
    onExplain?: () => void;
    onDraft?: () => void;
  }

  let { finding, onExplain, onDraft }: Props = $props();

  const uid = $props.id();
  const titleId = `${uid}-title`;

  function statusLabel(s: FindingStatus): string {
    switch (s) {
      case 'lead': return 'lead';
      case 'confirmed': return 'confirmed';
      case 'ruled_out': return 'ruled out';
      default: {
        const _n: never = s;
        return _n;
      }
    }
  }

  const status = $derived(finding.status ?? 'lead');
  const confirmed = $derived(findingConfirmed(status));
  const cvssLabel = $derived(formatCvss(finding.cvss));
  const chipText = $derived(confirmed ? finding.severity : statusLabel(status));
  const tone = $derived(confirmed ? severityToken(finding.severity) : 'var(--nil-ink-3)');
</script>

<!-- Severity is carried three ways: hue (--sev), shape glyph, and the chip's
     text label. Unconfirmed leads deliberately drop hue and shape — the chip
     then reads the status word instead, so nothing is ranked before evidence. -->
<!-- SETTLE once on entry. `|global` because the card arrives inside a freshly
     created stream row ({#each} item + {#if} chain); a local intro on a node
     born with its own block never plays. `in:` only — it never re-runs. -->
<article
  class="finding"
  class:confirmed
  data-status={status}
  data-cvss={cvssLabel}
  style:--sev={tone}
  aria-labelledby={titleId}
  in:settle|global
>
  <header class="lead">
    <span class="chip">
      {#if confirmed}
        <span class="shape" aria-hidden="true">{severityShape(finding.severity)}</span>
      {/if}
      <span class="sev-label">{chipText}</span>
      {#if confirmed}<span class="visually-hidden"> severity</span>{/if}
    </span>
    <span class="cvss">
      <span class="visually-hidden">CVSS </span><span class="nil-scramble" {@attach scramble(() => cvssLabel)}>{cvssLabel}</span>
    </span>
    {#if finding.vector}
      <span class="vector">{finding.vector}</span>
      <CopyAffordance value={finding.vector} />
    {/if}
  </header>

  <div class="title-row">
    <h3 class="title" id={titleId}>{finding.title}</h3>
    <CopyAffordance value={finding.title} />
  </div>

  <section class="block">
    <div class="eyebrow-row">
      <h4 class="eyebrow">Evidence</h4>
      <CopyAffordance value={finding.evidence} />
    </div>
    <pre class="evidence"><code>{finding.evidence}</code></pre>
  </section>

  {#if finding.assessment}
    <section class="block">
      <h4 class="eyebrow">Assessment</h4>
      <p class="prose">{finding.assessment}</p>
    </section>
  {/if}

  {#if finding.remediation}
    <section class="block">
      <h4 class="eyebrow">Remediation</h4>
      <p class="prose">{finding.remediation}</p>
    </section>
  {/if}

  <div class="actions">
    <button class="nil-lift nil-halo btn" type="button" onclick={() => onExplain?.()} disabled={!onExplain}>
      Explain
    </button>
    <button class="nil-lift nil-halo btn" type="button" onclick={() => onDraft?.()} disabled={!onDraft}>
      Draft
    </button>
  </div>
</article>

<style>
  .finding {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-3);
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-card);
    /* Same resting lift as the other stream cards (approval, clarify, confirm). */
    box-shadow: var(--lift-1);
  }

  .lead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 8px;
    border-radius: var(--r-chip);
    background: color-mix(in oklab, var(--sev) 14%, transparent);
    color: var(--sev);
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
  }

  .cvss {
    font: 600 var(--t-lead)/1 var(--font-machine);
    color: var(--sev);
    font-variant-numeric: tabular-nums;
  }

  .vector {
    font: var(--t-micro)/1.4 var(--font-machine);
    color: var(--nil-ink-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: var(--s-2);
    min-width: 0;
  }

  .title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font: 500 var(--t-lead)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
  }

  .eyebrow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-2);
    margin-block-end: var(--s-1);
  }

  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin: 0;
  }
  .block > .eyebrow { margin-block-end: var(--s-1); }

  .evidence {
    margin: 0;
    padding: var(--s-2);
    background: var(--nil-void);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    overflow: auto;
    max-block-size: 160px;
  }

  .evidence code {
    font: var(--t-meta)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-2);
  }

  .prose {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .actions {
    display: flex;
    gap: var(--s-2);
  }

  .btn {
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
