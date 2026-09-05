<script lang="ts">
  import type { ApprovalGrant, ToolStep } from '$lib/agent/types';
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';
  import { magnetic } from '$lib/motion/magnetic.svelte.ts';
  import { usageStore } from '$lib/usage/store.svelte.ts';

  interface Props {
    step: ToolStep;
  }

  let { step }: Props = $props();
  let sending = $state(false);

  const WRAPPERS = new Set([
    'sudo', 'doas', 'env', 'nice', 'timeout',
    'proxychains', 'proxychains4', 'proxychains-ng', 'stdbuf', 'unbuffer',
  ]);

  function commandFrom(s: ToolStep): string {
    if (s.primaryArg) return s.primaryArg;
    if (s.args && typeof s.args === 'object') {
      const rec = s.args as Record<string, unknown>;
      if (typeof rec.command === 'string') return rec.command;
    }
    return '';
  }

  function commandPrefix(command: string): string {
    const parts = command.trim().split(/\s+/);
    for (const part of parts) {
      if (part.includes('=') && !part.startsWith('-')) continue;
      const name = part.split('/').pop() || part;
      if (WRAPPERS.has(name)) continue;
      return name;
    }
    return parts[0]?.split('/').pop() || '';
  }

  function category(s: ToolStep): string {
    const name = (s.name || '').toLowerCase();
    if (name.includes('file') || name === 'write' || name === 'edit') return 'File change';
    return 'Terminal command';
  }

  function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function purpose(s: ToolStep, command: string): string {
    const raw = (s.reason || '').trim();
    if (!raw) return '';
    const nPurpose = normalize(raw);
    const nTarget = normalize(command);
    if (!nPurpose || nPurpose === nTarget) return '';
    if (nTarget && nPurpose.includes(nTarget) && nPurpose.length < nTarget.length + 24) return '';
    return raw;
  }

  const command = $derived(commandFrom(step));
  const prefix = $derived(commandPrefix(command));
  const why = $derived(purpose(step, command));
  const usage = $derived(step.usage ?? usageStore.lastTurn);
  const busy = $derived(sending || step.state === 'running');

  async function allow(grant: ApprovalGrant) {
    if (busy) return;
    sending = true;
    try {
      await agentRun.approve(step.id, grant);
    } finally {
      sending = false;
    }
  }

  function deny() {
    if (busy) return;
    agentRun.reject(step.id);
  }

  function stop() {
    if (busy) return;
    agentRun.reject(step.id);
    agentRun.stop();
  }
</script>

<div
  class="gate nil-scan"
  class:busy
  data-state={busy ? 'working' : undefined}
  role="alertdialog"
  aria-label="Pending tool approval"
  aria-busy={busy}
>
  <header class="head">
    <span class="cat">{category(step)}</span>
    <SpendMeter {usage} compact label="This turn" />
  </header>

  {#if why}
    <p class="why">{why}</p>
  {/if}

  {#if command}
    <pre class="target"><code>{command}</code></pre>
  {/if}

  {#if prefix}
    <p class="hint">Allow this engagement covers later commands using {prefix}.</p>
  {/if}

  <div class="actions">
    <button
      class="nil-lift nil-halo nil-magnetic act"
      type="button"
      disabled={busy}
      {@attach magnetic}
      onclick={() => void allow('once')}
    >
      {busy ? 'Running' : 'Allow once'}
      <kbd>⌘↵</kbd>
    </button>
    <button
      class="nil-lift nil-halo act ghost"
      type="button"
      disabled={busy || !prefix}
      onclick={() => void allow('engagement_prefix')}
    >
      Allow this engagement
    </button>
    <button
      class="nil-lift nil-halo act ghost"
      type="button"
      disabled={busy}
      onclick={deny}
    >
      Deny
      <kbd>⌘⇧↵</kbd>
    </button>
    <button
      class="nil-lift nil-halo act ghost"
      type="button"
      disabled={busy}
      onclick={stop}
    >
      Stop
    </button>
  </div>
</div>

<style>
  .gate {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    padding: var(--s-3);
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-card);
    box-shadow: var(--lift-1);
  }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-2);
    min-height: 20px;
  }

  .cat {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  .why {
    margin: 0;
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .target {
    margin: 0;
    max-block-size: 120px;
    overflow: auto;
    padding: var(--s-2);
    background: var(--nil-void);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    font: var(--t-meta)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .hint {
    margin: 0;
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-3);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  .act {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .act.ghost {
    background: transparent;
    border-color: var(--nil-line);
    color: var(--nil-ink-2);
  }

  .act:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  kbd {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
  }
</style>
