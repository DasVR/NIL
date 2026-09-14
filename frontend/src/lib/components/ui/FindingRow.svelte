<script lang="ts">
  import type { Finding } from '$lib/agent/types';
  import { droplet } from '$lib/motion/droplet';
  import { severityShape, severityToken } from '$lib/findings/display';

  interface Props {
    finding: Finding;
    active?: boolean;
    onSelect?: () => void;
  }

  let { finding, active = false, onSelect }: Props = $props();

  const cvssLabel = $derived(finding.cvss != null ? finding.cvss.toFixed(1) : '');
</script>

<!-- Severity rides on hue, the shape glyph (same set as FindingCard), and the
     text label — never colour alone. -->
<button
  type="button"
  class="row nil-halo"
  class:active
  aria-current={active ? 'true' : undefined}
  style:--sev={severityToken(finding.severity)}
  {@attach droplet}
  onclick={() => onSelect?.()}
>
  <span class="shape" aria-hidden="true">{severityShape(finding.severity)}</span>
  <span class="title">{finding.title}</span>
  <span class="meta">
    <span class="sev">{finding.severity}<span class="visually-hidden"> severity</span></span>
    {#if cvssLabel}
      <span class="cvss"><span class="visually-hidden">CVSS </span>{cvssLabel}</span>
    {/if}
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
    background: transparent;
  }

  .row.active {
    background: var(--nil-raised);
    box-shadow: var(--lift-1);
  }

  .shape {
    inline-size: 10px;
    flex-shrink: 0;
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--sev);
    text-align: center;
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
