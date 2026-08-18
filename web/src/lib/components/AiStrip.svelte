<script>
  import { appState } from '$lib/stores.svelte';

  let inputText = $state('');
  let isStreaming = $state(false);
  let stripRef;

  async function submit() {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText.trim();
    inputText = '';
    isStreaming = true;
    try {
      await appState.send(text);
    } finally {
      isStreaming = false;
    }
  }

  function handleKeydown(ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      submit();
    }
    if (ev.key === 'Escape') {
      if (!appState.aiStripPinned) appState.aiStripOpen = false;
    }
  }
</script>

{#if appState.aiStripOpen}
  <div class="ai-strip" bind:this={stripRef}>
    <div class="ai-strip-chrome">
      <div class="ai-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="label-micro">Finn</span>
      </div>
      <div class="ai-right">
        <button
          type="button"
          class="pin-btn"
          class:pinned={appState.aiStripPinned}
          onclick={() => appState.pinAi()}
          title={appState.aiStripPinned ? 'Unpin' : 'Pin'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h8M19.07 10.93l-1.41 1.41M22 18h-8"/>
          </svg>
        </button>
        <button
          type="button"
          class="close-btn"
          onclick={() => appState.aiStripOpen = false}
          title="Close (Esc)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="ai-messages">
      {#if appState.messages.length === 0}
        <div class="ai-empty">
          <p class="mono">Ask Finn about the current engagement, scope, or findings.</p>
          <div class="quick-chips">
            <button class="chip" onclick={() => { inputText = 'Scan target and summarize'; submit(); }}>Scan target</button>
            <button class="chip" onclick={() => { inputText = 'Draft executive summary'; submit(); }}>Draft report</button>
            <button class="chip" onclick={() => { inputText = 'Explain critical findings'; submit(); }}>Explain findings</button>
            <button class="chip" onclick={() => { inputText = 'Suggest next steps'; submit(); }}>Next steps</button>
          </div>
        </div>
      {:else}
        {#each appState.messages.slice(-8) as msg}
          <div class="msg" class:user={msg.role === 'user'} class:assistant={msg.role === 'assistant'}>
            <span class="msg-role mono">{msg.role === 'user' ? 'you' : 'finn'}</span>
            <div class="msg-body mono">{msg.content}</div>
          </div>
        {/each}
        {#if isStreaming}
          <div class="msg assistant">
            <span class="msg-role mono">finn</span>
            <div class="msg-body mono thinking"><span class="cursor">_</span></div>
          </div>
        {/if}
      {/if}
    </div>

    <div class="ai-input">
      <textarea
        class="ai-textarea mono"
        placeholder="Ask Finn..."
        bind:value={inputText}
        onkeydown={handleKeydown}
        rows="1"
      ></textarea>
      <button
        type="button"
        class="send-btn"
        onclick={submit}
        disabled={!inputText.trim() || isStreaming}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .ai-strip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 280px;
    background: var(--glass-2);
    border-top: 1px solid var(--glass-border);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    display: flex;
    flex-direction: column;
    z-index: 50;
    animation: aiSlideUp 280ms var(--spring-bouncy);
  }

  @keyframes aiSlideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .ai-strip-chrome {
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--glass-border);
  }

  .ai-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pin-btn, .close-btn {
    width: 26px;
    height: 26px;
    padding: 0;
    min-height: unset;
    display: grid;
    place-items: center;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text-faint);
    transition: all 150ms var(--spring-control);
  }

  .pin-btn:hover, .close-btn:hover {
    background: var(--glass-3);
    color: var(--text);
  }

  .pin-btn.pinned {
    color: var(--green);
  }

  .ai-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ai-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    opacity: 0.6;
  }

  .ai-empty p {
    font-size: 12px;
    color: var(--text-faint);
    text-align: center;
  }

  .quick-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
  }

  .chip {
    padding: 4px 10px;
    font-size: 11px;
    font-family: var(--font-mono);
    border-radius: 6px;
    border: 1px solid var(--glass-border);
    background: var(--glass-3);
    color: var(--text-dim);
    min-height: unset;
    transition: all 150ms var(--spring-control);
  }

  .chip:hover {
    border-color: var(--green-soft);
    color: var(--text);
  }

  .msg {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 10px;
    border-radius: 8px;
    max-width: 92%;
  }

  .msg.user {
    align-self: flex-end;
    background: var(--glass-3);
  }

  .msg.assistant {
    align-self: flex-start;
    background: var(--glass-2);
    border-left: 2px solid var(--green);
  }

  .msg-role {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-faint);
  }

  .msg-body {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msg-body.thinking .cursor {
    animation: blink 1s step-end infinite;
    color: var(--green);
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .ai-input {
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px 14px;
    border-top: 1px solid var(--glass-border);
  }

  .ai-textarea {
    flex: 1;
    min-height: 36px;
    max-height: 120px;
    resize: none;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.4;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    color: var(--text);
  }

  .ai-textarea:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 2px var(--green-soft);
    outline: none;
  }

  .send-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    min-height: unset;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: var(--green);
    color: var(--abyss);
    border: none;
    flex-shrink: 0;
    transition: transform 180ms var(--spring-control), opacity 150ms ease;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    opacity: 0.9;
  }

  .send-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-strip { animation: none; }
    .send-btn { transition: none; }
    .cursor { animation: none; opacity: 0; }
  }
</style>
