<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import AgentStatus from '$lib/components/ui/AgentStatus.svelte';
  import AgentGlyph from '$lib/components/ui/AgentGlyph.svelte';
  import { agentPhase } from '$lib/agent/phase';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { usageStore } from '$lib/usage/store.svelte.ts';

  let statusOpen = $state(false);
  let now = $state(Date.now());

  // thinking / editing / running / needs-you while the bar is up. SCANLINE
  // stays the "working" loop; it yields only to needs-you so there is never
  // more than one attention object in the bar.
  const phase = $derived(agentPhase());

  $effect(() => {
    if (!agentRun.running) return;
    now = Date.now();
    const id = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(id);
  });

  const runningSummary = $derived.by(() => {
    const tools = agentRun.steps.filter((s) => s.kind === 'tool');
    const reads = tools.filter((s) => s.kind === 'tool' && /read|search|grep|glob/i.test(s.name)).length;
    const cmds = tools.filter((s) => s.kind === 'tool' && s.state !== 'pending').length;
    if (cmds === 0 && reads === 0) return 'Working';
    const bits: string[] = [];
    if (reads) bits.push(`Searched code, read ${reads} file${reads === 1 ? '' : 's'}`);
    else if (cmds) bits.push('Ran a command');
    if (reads && cmds) bits.push('ran a command');
    return bits.join(', ').replace(/^./, (c) => c.toUpperCase());
  });

  const statusItems = $derived(
    agentRun.steps
      .filter((s): s is Extract<typeof s, { kind: 'tool' }> => s.kind === 'tool')
      .map((s) => [s.name, s.primaryArg].filter(Boolean).join(' · ')),
  );

  const runDuration = $derived.by(() => {
    now;
    const start = agentRun.startedAt;
    if (!start) return '0s';
    const ms = Math.max(0, now - start);
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  });

  const runTokens = $derived.by(() => {
    const fromSteps = agentRun.steps.reduce((n, s) => n + (('usage' in s && s.usage?.totalTokens) ? s.usage.totalTokens : 0), 0);
    if (fromSteps > 0) return fromSteps;
    return usageStore.lastTurn?.totalTokens ?? 0;
  });

  const runHint = $derived.by(() => {
    if (agentRun.huntLoop) return 'Assessment running';
    const tool = agentRun.steps.find((s) => s.kind === 'tool' && s.state === 'running');
    if (tool && tool.kind === 'tool') return tool.name;
    if (agentRun.queued.length) return 'Follow-up queued';
    if (agentRun.thinking) return 'Almost done thinking…';
    return 'Waiting on the model';
  });

  $effect(() => {
    if (!statusOpen) return;
    workspace.showStream();
  });
</script>

{#if agentRun.running}
  <div class="runbar nil-scan" data-state={phase === 'needs-you' ? undefined : 'working'}>
    <AgentGlyph label />
    <AgentStatus
      bind:open={statusOpen}
      summary={runningSummary}
      duration={runDuration}
      tokens={runTokens}
      hint={runHint}
      items={statusItems}
    />
    <button class="nil-lift nil-halo stop" type="button" onclick={() => agentRun.stop()}>Stop</button>
  </div>
{/if}

<style>
  .runbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    min-height: 48px;
    padding: var(--s-2) var(--s-3);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-1);
    color: var(--nil-ink-2);
    flex-shrink: 0;
  }
  .runbar :global(.status) { flex: 1; min-width: 0; }

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
