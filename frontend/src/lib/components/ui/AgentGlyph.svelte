<script lang="ts">
  import { agentPhase, phaseLabel, type AgentPhase } from '$lib/agent/phase';

  interface Props {
    /** Render the phase name beside the glyph. Off = icon-only with an aria-label. */
    label?: boolean;
  }

  let { label = false }: Props = $props();

  const phase = $derived(agentPhase());
  const text = $derived(phaseLabel(phase));

  // Wireframe section 3. `running` is intentionally absent: it is the
  // wireframe's open question, and the chrome around this component already
  // carries SCANLINE for it.
  function mark(p: Exclude<AgentPhase, 'running' | 'needs-you'>): string {
    switch (p) {
      case 'idle':
        return '·';
      case 'thinking':
        return '⋯';
      case 'editing':
        return '±';
      default: {
        const never: never = p;
        return never;
      }
    }
  }
</script>

{#if phase !== 'running'}
  <span
    class="agent-glyph"
    data-phase={phase}
    role={label ? undefined : 'img'}
    aria-label={label ? undefined : text}
  >
    {#if phase === 'needs-you'}
      <span class="nil-ring" aria-hidden="true"></span>
    {:else}
      <span class="mark" aria-hidden="true">{mark(phase)}</span>
    {/if}
    {#if label}
      <span class="txt">{text}</span>
    {/if}
  </span>
{/if}

<style>
  /* The mark-to-label gap must stay tighter than the gap around the whole
     glyph (the status bar clusters at --s-2), or the `·` sits equidistant
     between the hairline divider and its own word and reads as a separator. */
  .agent-glyph {
    display: inline-flex;
    align-items: center;
    gap: var(--s-1);
    flex-shrink: 0;
  }

  /* Fixed-width slot so ·/⋯/± swap without nudging neighbours. Sized to the
     needs-you ring (12px) so that swap doesn't nudge either. Mono here is
     for the tabular cell, the same reason ToolBlock's state glyph uses it. */
  .mark {
    inline-size: 12px;
    text-align: center;
    font: var(--t-body)/1 var(--font-machine);
    color: var(--nil-ink-2);
  }
  /* Editing is a machine state, not a Zone A identity moment — ink, not ember. */
  .agent-glyph[data-phase="editing"] .mark { color: var(--nil-ink); }

  .txt {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink);
  }
  .agent-glyph[data-phase="idle"] .txt { color: var(--nil-ink-3); font-weight: 500; }
</style>
