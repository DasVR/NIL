<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { pinned } from '$lib/motion/pinned.svelte.ts';
  import ToolBlock from '$lib/components/ui/ToolBlock.svelte';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';
  import type { Snippet } from 'svelte';

  let { emptyState }: { emptyState?: Snippet } = $props();

  let isPinned = $state(true);

  function onPinChange(next: boolean) {
    isPinned = next;
  }

  function jumpToLatest(node: HTMLElement) {
    node.scrollTo({ top: node.scrollHeight, behavior: 'instant' });
    isPinned = true;
  }

  let scroller: HTMLElement | undefined = $state();
</script>

<section class="stream" aria-label="Agent stream">
  <div
    class="log"
    bind:this={scroller}
    {@attach (n) => pinned(n, onPinChange)}
    role="log"
    aria-live="polite"
    aria-relevant="additions"
  >
    {#if agentRun.steps.length === 0}
      <div class="idle">
        {#if emptyState}
          {@render emptyState()}
        {:else}
          <p class="idle-title">/Stream(01)</p>
          <p class="idle-copy">No findings yet. Run a hunt to start collecting evidence.</p>
        {/if}
      </div>
    {/if}

    {#each agentRun.steps as step (step.id)}
      {#if step.kind === 'tool'}
        <ToolBlock {step} />
      {:else if step.kind === 'finding'}
        <FindingCard finding={{
          id: step.id,
          title: step.title,
          severity: step.severity,
          cvss: step.cvss,
          vector: step.vector,
          evidence: step.evidence,
          assessment: step.assessment,
          remediation: step.remediation,
        }} />
      {:else if step.kind === 'message'}
        <div class="msg" data-role={step.role}>
          {#if step.role === 'user'}
            <span class="prompt">&gt;</span>
          {/if}
          <p class="msg-text" class:interrupted={step.interrupted}>{step.text}</p>
          {#if step.interrupted}
            <span class="flag">interrupted</span>
          {/if}
        </div>
      {:else if step.kind === 'thought'}
        <p class="thought">{step.text}</p>
      {/if}
    {/each}
  </div>

  {#if !isPinned}
    <button
      class="jump nil-lift nil-halo"
      type="button"
      onclick={() => { if (scroller) jumpToLatest(scroller); }}
    >
      Jump to latest
    </button>
  {/if}

  {#if agentRun.running}
    <div class="runbar">
      <span class="nil-scan" data-state="working">Streaming</span>
      <button class="nil-halo stop" type="button" onclick={() => agentRun.stop()}>Stop</button>
    </div>
  {/if}
</section>

<style>
  .stream {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
    overflow: hidden;
  }

  .log {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--s-4);
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
  }

  .idle {
    margin: 0;
    width: 100%;
    min-height: 100%;
  }

  .idle-title {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    color: var(--nil-ink-3);
    margin-block-end: var(--s-2);
  }

  .idle-copy {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .msg {
    display: flex;
    align-items: flex-start;
    gap: var(--s-2);
  }

  .msg[data-role="user"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink);
  }

  .msg[data-role="assistant"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .prompt {
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-3);
  }

  .flag {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  .thought {
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-3);
  }

  .jump {
    position: absolute;
    inset-block-end: var(--s-5);
    inset-inline-start: 50%;
    transform: translateX(-50%);
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .runbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    padding: 0 var(--s-3);
    border-top: 1px solid var(--nil-line);
    font: var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-2);
  }

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
