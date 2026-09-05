<script lang="ts">
  import type { TokenUsage } from '$lib/agent/types';
  import { formatSpend, formatSpendCompact, hasSpend, spendWeight } from '$lib/usage/format';

  interface Props {
    usage?: TokenUsage | null;
    compact?: boolean;
    label?: string;
  }

  let { usage = null, compact = false, label }: Props = $props();

  const text = $derived(compact ? formatSpendCompact(usage) : formatSpend(usage));
  const weight = $derived(spendWeight(usage));
</script>

{#if hasSpend(usage) && text}
  <span class="spend" data-weight={weight}>
    {#if label}
      <span class="lbl">{label}</span>
    {/if}
    <span class="fig">{text}</span>
  </span>
{/if}

<style>
  .spend {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    color: var(--nil-ink-3);
    font: var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-mono);
    text-transform: none;
  }
  .spend[data-weight="mid"] { color: var(--nil-ink-2); }
  .spend[data-weight="high"] { color: var(--nil-ink); }
  .lbl {
    font-family: var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .fig { font-variant-numeric: tabular-nums; }
</style>
