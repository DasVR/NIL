<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { pinned } from '$lib/motion/pinned.svelte.ts';
  import ToolBlock from '$lib/components/ui/ToolBlock.svelte';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';
  import ClarifyCard from '$lib/components/ui/ClarifyCard.svelte';
  import ConfirmCard from '$lib/components/ui/ConfirmCard.svelte';
  import TaskList from '$lib/components/ui/TaskList.svelte';
  import AshText from '$lib/ui/AshText.svelte';
  import DitherWipe from '$lib/ui/DitherWipe.svelte';
  import NilMonogram from '$lib/components/ui/NilMonogram.svelte';
  import PentestEmpty from '$lib/components/shell/PentestEmpty.svelte';
  import BuildEmpty from '$lib/components/shell/BuildEmpty.svelte';
  import DictationWave from '$lib/components/ui/DictationWave.svelte';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import type { Snippet } from 'svelte';
  import { explainFinding, draftFinding } from '$lib/findings/actions';

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
  let handoffPlay = $state(0);

  $effect(() => {
    const n = workspace.handoff;
    if (n > 0) handoffPlay = n;
  });

  const tasks = $derived(
    agentRun.steps
      .filter((s): s is Extract<typeof s, { kind: 'tool' }> => s.kind === 'tool')
      .map((s) => ({
        id: s.id,
        label: s.name,
        detail: s.primaryArg,
        status: s.state,
      })),
  );

  function jumpToStep(id: string) {
    const node = scroller?.querySelector(`[data-step-id="${CSS.escape(id)}"]`);
    if (node instanceof HTMLElement) node.scrollIntoView({ block: 'nearest' });
  }

  // Receipt time: stamped once per step id at first render (logger time, not
  // emitter time — terminal convention). Fixed HH:MM:SS width keeps the time
  // column from ever nudging content on re-render.
  const receiptTimes = new Map<string, string>();
  function receiptTime(id: string): string {
    let t = receiptTimes.get(id);
    if (!t) {
      const d = new Date();
      t = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');
      receiptTimes.set(id, t);
    }
    return t;
  }

  // Real binding behind the jump badge's G keycap (dispatched by keymap.svelte.ts).
  $effect(() => {
    const jump = () => {
      if (scroller) jumpToLatest(scroller);
    };
    window.addEventListener('nil:jump-latest', jump);
    return () => window.removeEventListener('nil:jump-latest', jump);
  });
</script>

<section id="agent-stream" class="stream" aria-label="Agent stream">
  {#if handoffPlay > 0}
    {#key handoffPlay}
      <div class="handoff" aria-hidden="true">
        <DitherWipe mode="wipe" tone="ember" onDone={() => (handoffPlay = 0)} />
        <div class="handoff-mark">
          <NilMonogram state="active" size={32} />
        </div>
      </div>
    {/key}
  {/if}
  <div
    class="log"
    bind:this={scroller}
    {@attach (n) => pinned(n, onPinChange)}
    role="log"
    aria-live="polite"
    aria-relevant="additions"
  >
    {#if agentRun.steps.length === 0 && !workspace.clarify && !workspace.pendingMode}
      <div class="idle">
        {#if emptyState && !workspace.sessionStarted}
          {@render emptyState()}
        {:else if workspace.workstationMode === 'pentest' && agentRun.findings.length === 0}
          <PentestEmpty />
        {:else if workspace.workstationMode === 'build'}
          <BuildEmpty />
        {:else if agentRun.findings.length === 0}
          <p class="idle-title">/Stream(01)</p>
          <p class="idle-copy">No findings yet. Describe what to review to start collecting evidence.</p>
        {/if}
      </div>
    {/if}

    {#if tasks.length > 0}
      <div class="plan-host">
        <TaskList {tasks} onPick={jumpToStep} />
      </div>
    {/if}

    {#each agentRun.steps as step (step.id)}
      <!-- Row shell: fixed 8ch time column + isolated content cell.
           contain: content keeps an append from relayouting the document. -->
      <div class="row" class:tick={step.kind === 'thought'} data-step-id={step.id}>
        <span class="time">{receiptTime(step.id)}</span>
        <div class="cell">
          {#if step.kind === 'tool'}
            <ToolBlock {step} />
          {:else if step.kind === 'finding'}
            {@const finding = {
              id: step.id,
              title: step.title,
              severity: step.severity,
              status: step.status,
              cvss: step.cvss,
              vector: step.vector,
              evidence: step.evidence,
              assessment: step.assessment,
              remediation: step.remediation,
            }}
            <FindingCard {finding} onExplain={() => explainFinding(finding)} onDraft={() => draftFinding(finding)} />
          {:else if step.kind === 'message'}
            <div class="msg" data-role={step.role}>
              {#if step.role === 'user'}
                <span class="prompt">&gt;</span>
              {/if}
              <div class="msg-body">
                {#if step.role === 'assistant' && step.streaming && !step.text}
                  <p class="thought nil-think" data-thinking="true">Waiting on the model</p>
                {:else if step.role === 'assistant' && !step.failed && !step.interrupted}
                  <p class="msg-text"><AshText text={step.text} /></p>
                {:else}
                  <p class="msg-text" class:interrupted={step.interrupted} class:failed={step.failed}>{step.text}</p>
                {/if}
                {#if step.streaming && step.text}
                  <span class="flag">streaming</span>
                {:else if step.interrupted}
                  <span class="flag">interrupted</span>
                {:else if step.failed}
                  <span class="flag">failed</span>
                {/if}
              </div>
            </div>
          {:else if step.kind === 'thought'}
            <p class="thought">{step.text}</p>
          {/if}
        </div>
      </div>
    {/each}

    {#if agentRun.queued.length}
      {#each agentRun.queued as item (item.id)}
        <div class="queued">
          <span class="flag">queued</span>
          <p class="queued-text">{item.text}</p>
          <button class="nil-halo drop" type="button" onclick={() => agentRun.dropFollowup(item.id)}>Remove</button>
        </div>
      {/each}
    {/if}

    {#if workspace.dictationActive && workspace.sessionStarted}
      <div class="row tick" data-step-id="dictation">
        <span class="time">{receiptTime('dictation')}</span>
        <div class="cell listen">
          <DictationWave active={!workspace.dictationPaused} level={workspace.dictationLevel} />
          <span class="flag">{workspace.dictationPaused ? 'paused' : 'listening'}</span>
          <button
            class="nil-halo listen-btn"
            type="button"
            onclick={() => (workspace.dictationPaused = !workspace.dictationPaused)}
          >{workspace.dictationPaused ? 'Resume' : 'Pause'}</button>
        </div>
      </div>
    {/if}

    {#if agentRun.clarify || (workspace.clarify && agentRun.steps.length === 0)}
      {@const card = agentRun.clarify ?? workspace.clarify}
      {#if card}
      <div class="prompt-card">
        <ClarifyCard
          title={card.title}
          index={card.index}
          total={card.total}
          options={card.options}
          onSelect={(id, other) => {
            if (agentRun.clarify) {
              const picked = agentRun.clarify.options.find((o) => o.id === id)?.label ?? '';
              const text = (id === 'reply' || id === 'other') ? (other?.trim() || '') : picked;
              agentRun.dismissClarify();
              if (!text) {
                appState.focusComposer();
                return;
              }
              const mode = workspace.workstationMode === 'build' ? 'code' : appState.composerMode;
              const engagement = appState.activeEngagementId || 'default';
              void agentRun.sendMessage(text, engagement, mode, {
                model: workspace.modelId,
                effort: workspace.effort,
              });
              return;
            }
            workspace.answerClarify(id, other);
          }}
          onPrev={agentRun.clarify ? undefined : () => workspace.prevClarify()}
          onNext={agentRun.clarify ? undefined : () => workspace.nextClarify()}
        />
      </div>
      {/if}
    {/if}

    {#if workspace.pendingMode}
      <div class="prompt-card">
        <ConfirmCard
          title="Leave this run?"
          body="The agent is still working. Switching modes stops the current task."
          confirmLabel="Continue"
          onConfirm={() => {
            agentRun.stop();
            workspace.commitPendingMode();
          }}
          onCancel={() => workspace.cancelPendingMode()}
        />
      </div>
    {:else if agentRun.interrupted && !agentRun.running}
      <div class="prompt-card">
        <ConfirmCard
          title="Continue this run?"
          body="The last turn was interrupted. Send another message to pick up from here."
          confirmLabel="Continue"
          cancelLabel="Dismiss"
          onConfirm={() => {
            agentRun.resume();
            appState.focusComposer();
          }}
          onCancel={() => agentRun.resume()}
        />
      </div>
    {/if}
  </div>

  {#if !isPinned}
    <button
      class="jump nil-lift nil-halo"
      type="button"
      onclick={() => { if (scroller) jumpToLatest(scroller); }}
    >
      Jump to latest <kbd aria-hidden="true">G</kbd>
    </button>
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

  .handoff {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
  }
  .handoff-mark {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .log {
    flex: 1;
    min-height: 0;
    overflow: auto;
    overflow-anchor: none; /* no browser scroll-anchoring rubber-banding; pinned.svelte.ts owns position */
    padding: var(--s-4);
    display: flex;
    flex-direction: column;
    /* No gap: row dividers own the vertical rhythm. */
  }

  /* Telemetry grid: fixed-width time column + content cell. */
  .row {
    display: grid;
    grid-template-columns: 8ch minmax(0, 1fr);
    column-gap: var(--s-3);
    align-items: baseline;
    padding-block: var(--s-2);
    border-block-start: 1px solid var(--nil-line);
    contain: content; /* append isolation: no document relayout */
  }

  /* TRACE weight — primary rows. */
  .time {
    font: var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    color: var(--nil-ink-3);
  }

  .cell { min-width: 0; }

  /* TICK weight — cadence rows sit low: ink-3, compact, subdued rule. */
  .row.tick {
    padding-block: 2px;
  }

  .row.tick .time {
    color: var(--nil-ink-4);
  }

  .idle {
    margin: 0;
    width: 100%;
    min-height: 100%;
  }

  .prompt-card {
    padding: var(--s-3) 0;
    max-width: 36rem;
  }

  .plan-host { max-width: 40rem; }

  .queued {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--s-2);
    padding-block: var(--s-2);
    border-block-start: 1px solid var(--nil-line);
    max-width: 40rem;
  }
  .queued-text {
    margin: 0;
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .drop {
    height: 22px;
    padding: 0 var(--s-2);
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
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

  .listen {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }
  .listen-btn {
    height: 22px;
    padding: 0 var(--s-2);
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
  }

  .msg {
    display: flex;
    align-items: flex-start;
    gap: var(--s-2);
    min-width: 0;
  }

  .msg-body {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .msg-text {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .msg[data-role="user"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink);
  }

  .msg[data-role="assistant"] .msg-text {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
  }

  .msg[data-role="assistant"] .msg-text.failed,
  .msg-text.interrupted {
    color: var(--nil-ink-3);
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

  .jump kbd {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-2); /* keycap standard: AA on --nil-raised */
  }
</style>
