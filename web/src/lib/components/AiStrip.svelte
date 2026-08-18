<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { splitFinnBlocks, extractCommands, renderMarkdown } from '$lib/markdown';

  let inputText = $state('');

  const lastStatus = $derived.by(() => {
    const msgs = appState.messages;
    for (let i = msgs.length - 1; i >= 0; i -= 1) {
      if (msgs[i].role === 'assistant') {
        const first = msgs[i].content.split('\n').find((l) => l.trim());
        return first ? first.trim().slice(0, 80) : 'Finn ready';
      }
    }
    return appState.busy ? 'Finn is working…' : 'Finn ready';
  });

  const showThin = $derived(!appState.aiStripOpen && (appState.messages.length > 0 || appState.busy));

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
      appState.aiStripOpen = false;
    }
  }

  function propose(cmd: string) {
    void appState.proposeShell(cmd);
  }
</script>

{#if showThin}
  <button
    type="button"
    class="ai-thin-bar"
    onclick={() => (appState.aiStripOpen = true)}
    title="Expand Finn (⌘J)"
    aria-label="Expand Finn"
  >
    <span class="thin-dot" class:busy={appState.busy}></span>
    <span class="thin-label">{appState.busy ? 'Finn is working' : 'Finn'}</span>
    <span class="thin-status">{lastStatus}</span>
    <span class="thin-hint">⌘J</span>
  </button>
{/if}

{#if appState.aiStripOpen}
  <div class="ai-strip" role="complementary" aria-label="Finn">
    <div class="ai-strip-chrome">
      <div class="ai-left">
        <span class="ai-title">Finn</span>
        <span class="mode-chip">{appState.mode}</span>
        <span class="mono model">{appState.model}</span>
      </div>
      <div class="ai-right">
        <button
          type="button"
          class="pin-btn"
          class:pinned={appState.aiStripPinned}
          onclick={() => appState.pinAi()}
          title={appState.aiStripPinned ? 'Unpin' : 'Pin (⌘⇧J)'}
        >Pin</button>
        <button type="button" class="close-btn" onclick={() => (appState.aiStripOpen = false)} title="Close (Esc)">Close</button>
      </div>
    </div>

    <div class="ai-messages">
      {#if appState.messages.length === 0}
        <div class="ai-empty">
          <p>Ask Finn about this Space — findings, next scans, or a report section.</p>
        </div>
      {:else}
        {#each appState.messages.slice(-12) as msg, i (i)}
          {#if msg.role === 'user'}
            <div class="turn user">{msg.content}</div>
          {:else}
            <div class="turn finn">
              {#each splitFinnBlocks(msg.content) as block}
                {#if block.type === 'code'}
                  <div class="code-wrap">
                    <pre class="mono">{block.body}</pre>
                    {#each extractCommands('```\n' + block.body + '\n```') as cmd}
                      <button type="button" class="propose" onclick={() => propose(cmd)}>Propose `{cmd.slice(0, 60)}`</button>
                    {/each}
                  </div>
                {:else}
                  <div class="prose">{@html renderMarkdown(block.body)}</div>
                {/if}
              {/each}
              {#if msg.commands?.length}
                <div class="cmds">
                  {#each msg.commands as cmd}
                    <button type="button" class="propose" onclick={() => propose(cmd)}>{cmd}</button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {/each}
        {#if appState.busy}
          <div class="turn finn thinking" aria-live="polite">
            <span class="orb"></span> thinking
          </div>
        {/if}
      {/if}
    </div>

    <div class="ai-input">
      <textarea
        class="ai-textarea"
        placeholder="Ask Finn about this Space"
        bind:value={inputText}
        onkeydown={handleKeydown}
        rows="1"
      ></textarea>
      <button type="button" class="send-btn" onclick={submit} disabled={!inputText.trim() || appState.busy}>Send</button>
    </div>
  </div>
{/if}

<style>
  .ai-strip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--ai-strip-height);
    background: var(--glass-2);
    border-top: 1px solid var(--glass-border);
    backdrop-filter: blur(24px) saturate(1.5);
    display: flex;
    flex-direction: column;
    z-index: 50;
    animation: aiSlideUp 280ms var(--spring-bouncy);
  }
  .ai-thin-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 26px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    background: var(--glass-2);
    border: none;
    border-top: 1px solid var(--glass-border);
    color: var(--text-dim);
    z-index: 50;
    min-height: unset;
  }
  .thin-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 6px var(--green-glow);
  }
  .thin-dot.busy { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .thin-label { font-size: 11px; font-weight: 500; color: var(--green); }
  .thin-status { font-size: 11px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .thin-hint { font-size: 10px; color: var(--text-faint); }
  @keyframes aiSlideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .ai-strip-chrome {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--glass-border);
  }
  .ai-left, .ai-right { display: flex; align-items: center; gap: 8px; }
  .ai-title { font-size: 13px; font-weight: 600; }
  .mode-chip {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--green); background: var(--green-soft); padding: 1px 6px; border-radius: 4px;
  }
  .model { font-size: 10px; color: var(--text-faint); }
  .pin-btn, .close-btn {
    height: 24px; min-height: unset; padding: 0 8px; font-size: 11px;
    border: 0; background: transparent; color: var(--text-faint);
  }
  .pin-btn.pinned { color: var(--green); }
  .ai-messages {
    flex: 1; min-height: 0; overflow-y: auto;
    padding: 12px 14px; display: flex; flex-direction: column; gap: 12px;
  }
  .ai-empty { display: grid; place-items: center; height: 100%; }
  .ai-empty p { font-size: 12px; color: var(--text-faint); text-align: center; max-width: 360px; }
  .turn.user {
    align-self: flex-end;
    max-width: 520px;
    font-size: 13px;
    color: var(--text);
    text-align: right;
    white-space: pre-wrap;
  }
  .turn.finn {
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .prose { font-size: 13px; line-height: 1.5; color: var(--text); }
  .prose :global(p) { margin: 0 0 8px; }
  .code-wrap, .cmds { display: flex; flex-direction: column; gap: 6px; }
  pre {
    margin: 0;
    padding: 10px 12px;
    background: var(--abyss-3);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    font-size: 12px;
    color: var(--text-dim);
    overflow-x: auto;
    white-space: pre-wrap;
  }
  .propose {
    align-self: flex-start;
    min-height: unset;
    height: 26px;
    font-size: 11px;
    font-family: var(--font-mono);
    background: var(--green-soft);
    color: var(--green);
    border-color: transparent;
  }
  .thinking { color: var(--green); font-size: 12px; display: flex; align-items: center; gap: 8px; }
  .orb {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    animation: pulse 1.2s ease-in-out infinite;
  }
  .ai-input {
    display: flex; align-items: flex-end; gap: 8px;
    padding: 8px 14px; border-top: 1px solid var(--glass-border);
  }
  .ai-textarea {
    flex: 1; min-height: 36px; max-height: 120px; resize: none;
    padding: 8px 12px; font-size: 13px;
    background: var(--abyss-2); border-radius: 10px;
  }
  .send-btn { min-height: 36px; }
  @media (prefers-reduced-motion: reduce) {
    .ai-strip { animation: none; }
    .thin-dot.busy, .orb { animation: none; }
  }
</style>
