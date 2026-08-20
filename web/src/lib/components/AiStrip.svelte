<script lang="ts">
  import { tick } from 'svelte';
  import { appState, pendingId } from '$lib/stores.svelte';
  import type { TermBlock } from '$lib/types';
  import { splitFinnBlocks, renderMarkdown } from '$lib/markdown';
  import ThinkingOrbs from './ThinkingOrbs.svelte';

  let inputText = $state('');
  let threadEl = $state<HTMLDivElement | undefined>(undefined);
  let composerEl = $state<HTMLTextAreaElement | undefined>(undefined);

  const liveRuns = $derived(
    appState.blocks.filter((b) => b.status === 'pending' || b.status === 'running').slice(-6)
  );

  $effect(() => {
    appState.messages.length;
    appState.busy;
    void tick().then(() => {
      if (threadEl) threadEl.scrollTop = threadEl.scrollHeight;
    });
  });

  $effect(() => {
    const seq = appState.finnFocusSeq;
    if (seq > 0 && appState.aiStripOpen) {
      void tick().then(() => composerEl?.focus());
    }
  });

  async function submit() {
    if (!inputText.trim() || appState.busy) return;
    const text = inputText.trim();
    inputText = '';
    await appState.send(text);
  }

  function handleKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      void submit();
    }
    if (ev.key === 'Escape' && !appState.aiStripPinned) {
      appState.hideFinn();
    }
  }

  function blockFor(id: string): TermBlock | undefined {
    return appState.blocks.find((b) => b.runId === id || b.id === id);
  }
</script>

{#if appState.aiStripOpen}
  <aside class="agent" aria-label="Finn agent">
    <header class="chrome">
      <div class="who">
        <span class="dot" class:busy={appState.busy}></span>
        <span class="title">Finn</span>
        <span class="mode">{appState.mode}</span>
        <span class="mono model" title={appState.model}>{appState.model}</span>
      </div>
      <div class="acts">
        <button
          type="button"
          class="txt"
          class:on={appState.aiStripPinned}
          onclick={() => appState.pinAi()}
          title="Keep this thread open (⌘⇧J)"
        >{appState.aiStripPinned ? 'Pinned' : 'Pin'}</button>
        <button type="button" class="txt" onclick={() => appState.hideFinn()} title="Hide (Esc)">Hide</button>
      </div>
    </header>

    <div class="thread" bind:this={threadEl}>
      {#if appState.messages.length === 0 && !appState.busy}
        <div class="empty">
          <p>Talk to Finn here. It already sees this Space, recent runs, and findings.</p>
          <p class="hint">Shell commands run in the terminal above. Approve proposed runs on the card.</p>
        </div>
      {:else}
        {#each appState.messages as msg, i (i)}
          {#if msg.role === 'user'}
            <div class="turn user">
              <div class="body">{msg.content}</div>
              {#if msg.attachments?.length}
                <div class="chips">
                  {#each msg.attachments as att}
                    <span class="chip mono">{att.label}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <div class="turn finn">
              <div class="card">
                <header class="card-meta">
                  <span class="who">Finn</span>
                  <span class="mono model" title={appState.model}>{appState.model}</span>
                </header>
                {#each splitFinnBlocks(msg.content) as block}
                  {#if block.type === 'code'}
                    <pre class="mono code">{block.body}</pre>
                  {:else}
                    <div class="prose">{@html renderMarkdown(block.body)}</div>
                  {/if}
                {/each}
                {#each msg.runIds || [] as rid}
                  {@const run = blockFor(rid)}
                  {#if run}
                    <div class="tool" class:pending={run.status === 'pending'} class:bad={run.status === 'error'}>
                      <header>
                        <span class="mono tool-name">{run.tool}</span>
                        <span class="st mono">{run.status}</span>
                      </header>
                      <pre class="cmd-line mono">{run.command}</pre>
                      {#if run.status === 'pending'}
                        <div class="tool-acts">
                          <button type="button" class="primary" onclick={() => appState.approve(pendingId(run))}>Approve</button>
                          <button type="button" onclick={() => appState.reject(pendingId(run))}>Reject</button>
                        </div>
                      {:else if run.stdout}
                        <pre class="out mono">{run.stdout}</pre>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        {/each}
        {#if appState.busy}
          <div class="turn finn" aria-live="polite">
            <div class="card working">
              <header class="card-meta">
                <span class="who">Finn</span>
                <span class="mono model">{appState.model}</span>
              </header>
              <div class="working-row">
                <ThinkingOrbs label="Finn is working" />
                <span>Working on this Space…</span>
              </div>
            </div>
          </div>
        {/if}
        {#each liveRuns as run (run.id)}
          {#if !appState.messages.some((m) => m.runIds?.includes(run.runId || run.id))}
            <div class="tool live" class:pending={run.status === 'pending'}>
              <header>
                <span class="mono tool-name">{run.tool}</span>
                <span class="st">{run.status}</span>
              </header>
              <pre class="cmd-line mono">{run.command}</pre>
              {#if run.status === 'pending'}
                <div class="tool-acts">
                  <button type="button" class="primary" onclick={() => appState.approve(pendingId(run))}>Approve</button>
                  <button type="button" onclick={() => appState.reject(pendingId(run))}>Reject</button>
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      {/if}
    </div>

    {#if appState.agentPins.length}
      <div class="pins">
        {#each appState.agentPins as pin (pin.id)}
          <button type="button" class="chip" onclick={() => appState.unpinAgentBlock(pin.id)} title="Remove">
            @{pin.tool} {pin.command}
          </button>
        {/each}
      </div>
    {/if}

    <form class="composer" onsubmit={(e) => { e.preventDefault(); void submit(); }}>
      <textarea
        bind:this={composerEl}
        data-composer="finn"
        placeholder={appState.activeTarget
          ? `Ask Finn about ${appState.activeTarget.host}`
          : 'Ask Finn about this Space'}
        bind:value={inputText}
        onkeydown={handleKeydown}
        rows="2"
      ></textarea>
      <button type="submit" disabled={!inputText.trim() || appState.busy}>Send</button>
    </form>
  </aside>
{/if}

<style>
  .agent {
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
    border: 0;
    overflow: hidden;
  }
  .chrome {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-bottom: 1px solid var(--glass-border);
    flex-shrink: 0;
    min-width: 0;
    gap: 8px;
  }
  .who, .acts { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .acts { flex-shrink: 0; }
  .title { font-size: 13px; font-weight: 600; }
  .mode {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--green); background: var(--green-soft); padding: 1px 6px; border-radius: 4px;
  }
  .model {
    font-size: 10px;
    color: var(--text-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 28ch;
  }
  .txt {
    height: 22px; min-height: unset; padding: 0 8px; font-size: 11px;
    border: 0; background: transparent; color: var(--text-faint);
  }
  .txt.on { color: var(--green); }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 6px var(--green-glow); flex-shrink: 0;
  }
  .dot.busy { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

  .thread {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    padding: 14px 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .empty { color: var(--text-dim); font-size: 13px; line-height: 1.5; padding: 12px 4px; }
  .empty .hint { color: var(--text-faint); font-size: 12px; }
  .turn { display: flex; flex-direction: column; gap: 6px; max-width: 100%; min-width: 0; }
  .turn.user { align-items: flex-start; }
  .turn.user .body {
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-dim);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    text-align: left;
    max-width: 100%;
    font-family: var(--font-sans);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    background: var(--abyss-2);
    min-width: 0;
  }
  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .card-meta .who {
    font-size: 11px;
    font-weight: 600;
    color: var(--green);
  }
  .card-meta .model {
    font-size: 10px;
    color: var(--text-faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 24ch;
  }
  .working-row { display: flex; align-items: center; gap: 10px; color: var(--text-dim); font-size: 13px; }
  .prose { font-size: 13px; line-height: 1.55; color: var(--text); min-width: 0; overflow-wrap: anywhere; }
  .prose :global(p) { margin: 0 0 8px; }
  .prose :global(p:last-child) { margin-bottom: 0; }
  .prose :global(pre), .prose :global(code) {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .prose :global(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
  .prose :global(td), .prose :global(th) {
    padding: 4px 8px;
    white-space: normal;
    word-break: break-word;
  }
  .chips, .pins { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
  .pins { padding: 6px 12px; border-top: 1px solid var(--glass-border); }
  .chip {
    font-size: 10px; height: auto; min-height: 22px; padding: 2px 8px;
    border-radius: 999px; background: var(--abyss-3); color: var(--text-dim);
    border: 1px solid var(--glass-border);
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  pre.code, .cmd-line, .out {
    margin: 0;
    padding: 10px 12px;
    background: var(--abyss);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    font-size: 12px;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
  .tool {
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    background: var(--abyss);
    overflow: hidden;
    min-width: 0;
  }
  .tool.pending { border-color: rgba(255, 180, 84, 0.5); }
  .tool.bad { border-color: rgba(255, 92, 92, 0.4); }
  .tool header {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px; min-height: 28px;
  }
  .tool-name { color: var(--green); font-size: 11px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .st { font-size: 10px; text-transform: uppercase; color: var(--warning); flex-shrink: 0; }
  .tool-acts { display: flex; gap: 6px; padding: 0 10px 8px; flex-wrap: wrap; }
  .tool-acts button { height: 24px; min-height: unset; font-size: 11px; padding: 0 8px; }
  .cmd-line { border: 0; border-radius: 0; padding: 0 12px 8px; }
  .out { max-height: 160px; overflow: auto; border: 0; border-radius: 0; }

  .composer {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    padding: 10px 12px;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss);
    min-width: 0;
  }
  .composer textarea {
    flex: 1;
    min-width: 0;
    min-height: 36px;
    max-height: 140px;
    resize: none;
    font-size: 13px;
    border-radius: 8px;
  }
  .composer button { min-height: 32px; flex-shrink: 0; }

  @media (prefers-reduced-motion: reduce) {
    .dot.busy { animation: none; }
  }
  :global(html.reduce-motion) .dot.busy { animation: none; }
</style>
