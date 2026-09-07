<script lang="ts">
  import type { Finding, FindingSeverity } from '$lib/agent/types';

  interface Props {
    finding: Finding;
    active?: boolean;
    onSelect?: () => void;
  }

  let { finding, active = false, onSelect }: Props = $props();

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

  const cvssLabel = $derived(finding.cvss.toFixed(1));
</script>

<button
  type="button"
  class="row"
  class:active
  style:--sev={sevToken(finding.severity)}
  onclick={() => onSelect?.()}
>
  <span class="dot" aria-hidden="true"></span>
  <span class="title">{finding.title}</span>
  <span class="meta">
    <span class="sev">{finding.severity}</span>
    <span class="cvss">{cvssLabel}</span>
  </span>
</button>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    width: 100%;
    height: var(--row-h);
    padding: 0 var(--s-2);
    border: none;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink);
    cursor: pointer;
    text-align: left;
    transition: background var(--dur-flip) var(--ease-out);
  }

  .row:hover {
    background: var(--nil-raised);
  }

  .row.active {
    background: var(--nil-raised);
    box-shadow: var(--lift-1);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sev);
    flex-shrink: 0;
  }

  .title {
    flex: 1;
    min-width: 0;
    font: var(--t-body)/1.3 var(--font-ui);
    color: var(--nil-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-shrink: 0;
  }

  .sev {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--sev);
  }

  .cvss {
    font: var(--t-meta)/1 var(--font-machine);
    color: var(--nil-ink-3);
    font-variant-numeric: tabular-nums;
  }
</style>
