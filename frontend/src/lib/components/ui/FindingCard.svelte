<script lang="ts">
  import type { Finding, FindingSeverity, FindingStatus } from '$lib/agent/types';
  import { formatCvss, findingConfirmed } from '$lib/findings/display';
  import { scramble } from '$lib/motion/scramble.svelte.ts';

  interface Props {
    finding: Finding;
    onExplain?: () => void;
    onDraft?: () => void;
  }

  let { finding, onExplain, onDraft }: Props = $props();

  function sevToken(s: FindingSeverity): string {
    switch (s) {
      case 'critical': return 'var(--sev-critical)';
      case 'high': return 'var(--sev-high)';
      case 'medium': return 'var(--sev-medium)';
      case 'low': return 'var(--sev-low)';
      case 'info': return 'var(--sev-info)';
      default: {
        const _n: never = s;
        return _n;
      }
    }
  }

  function sevShape(s: FindingSeverity): string {
    switch (s) {
      case 'critical': return '■';
      case 'high': return '▲';
      case 'medium': return '●';
      case 'low': return '◆';
      case 'info': return '○';
      default: {
        const _n: never = s;
        return _n;
      }
    }
  }

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
  const tone = $derived(confirmed ? sevToken(finding.severity) : 'var(--nil-ink-3)');
</script>

<article class="finding" class:confirmed data-status={status} data-cvss={cvssLabel} style:--sev={tone}>
  <header class="lead">
    <span class="chip" title={chipText}>
      {#if confirmed}
        <span class="shape" aria-hidden="true">{sevShape(finding.severity)}</span>
      {/if}
      <span class="sev-label">{chipText}</span>
    </span>
    <span class="cvss nil-scramble" {@attach scramble(() => cvssLabel)}>
      {cvssLabel}
    </span>
    {#if finding.vector}
      <span class="vector">{finding.vector}</span>
    {/if}
  </header>

  <h3 class="title">{finding.title}</h3>

  <section class="block">
    <h4 class="eyebrow">Evidence</h4>
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

  .title {
    font: 500 var(--t-lead)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
  }

  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin-block-end: var(--s-1);
  }

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
