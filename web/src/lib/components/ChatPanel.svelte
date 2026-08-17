<script>
  import { pentestChat, streamPentestChat, approve, reject } from '$lib/api';
  import { appState } from '$lib/stores.svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  let inputText = $state('');
  let messages = $state([]);
  let isStreaming = $state(false);
  let currentStreamText = $state('');
  let currentMeta = $state(null);
  let chatContainer;
  let abortFn = $state(null);
  let stickToBottom = $state(true);

  function renderMarkdown(text) {
    const raw = marked.parse(text || '', { async: false });
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['p','a','ul','ol','li','strong','em','code','pre','blockquote','h1','h2','h3','h4','table','thead','tbody','tr','th','td','br','span'],
      ALLOWED_ATTR: ['href','target','rel','class']
    });
  }

  function scrollToBottom() {
    if (chatContainer && stickToBottom) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  $effect(() => {
    messages.length;
    currentStreamText;
    stickToBottom;
    scrollToBottom();
  });

  function onScroll() {
    if (!chatContainer) return;
    const near = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 80;
    stickToBottom = near;
  }

  async function handleSubmit() {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText.trim();
    inputText = '';
    messages = [...messages, { role: 'user', content: text }];
    isStreaming = true;
    currentStreamText = '';
    currentMeta = null;
    stickToBottom = true;

    abortFn = streamPentestChat(
      { engagement: appState.engagement, message: text, mode: appState.mode, yolo: appState.yolo },
      (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          currentStreamText += chunk.content;
        } else if (chunk.type === 'score' && chunk.score) {
          currentMeta = { ...currentMeta, score_breakdown: chunk.score };
        } else if (chunk.type === 'done') {
          finishStream();
        } else if (chunk.type === 'error') {
          isStreaming = false;
          messages = [...messages, { role: 'assistant', content: `Error: ${chunk.error || 'Unknown'}` }];
          cleanupStream();
        }
      },
      (err) => {
        isStreaming = false;
        messages = [...messages, { role: 'assistant', content: `Error: ${err.message}` }];
        cleanupStream();
      }
    );
  }

  function finishStream() {
    isStreaming = false;
    messages = [...messages, { role: 'assistant', content: currentStreamText, meta: currentMeta }];
    cleanupStream();
  }

  function cleanupStream() {
    abortFn = null;
    currentStreamText = '';
    currentMeta = null;
  }

  function cancelStream() {
    if (abortFn) abortFn();
    cleanupStream();
    isStreaming = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
  }

  function useCommand(cmd) {
    inputText = cmd;
  }

  function onDrop(ev) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      inputText = `${inputText}\n\n[uploaded ${file.name}]\n${String(reader.result).slice(0, 4000)}`;
    };
    reader.readAsText(file);
  }
</script>

<section class="chat-panel" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
  <div class="messages" bind:this={chatContainer} onscroll={onScroll} ondragover={(e) => e.preventDefault()} ondrop={onDrop}>
    {#each messages as msg, i (i)}
      <article class="message {msg.role}" aria-label="{msg.role} message">
        <div class="bubble">
          {#if msg.role === 'assistant'}
            {@html renderMarkdown(msg.content)}
          {:else}
            <p>{msg.content}</p>
          {/if}
        </div>
        {#if msg.meta}
          <div class="meta">
            {#if msg.meta.score}
              <span class="score">Score {msg.meta.score}/100</span>
            {/if}
            {#if msg.meta.score_breakdown}
              <span class="breakdown">
                Q{msg.meta.score_breakdown.quality} F{msg.meta.score_breakdown.filteredness} S{msg.meta.score_breakdown.speed}
              </span>
            {/if}
            {#if msg.meta.is_refusal}
              <span class="badge refusal">⚠ REFUSAL</span>
            {:else}
              <span class="badge compliant">✓ COMPLIANT</span>
            {/if}
            {#if msg.meta.template_used}
              <span class="template">T:{msg.meta.template_used}</span>
            {/if}
            <button class="copy" onclick={() => copy(msg.content)} aria-label="Copy message">Copy</button>
          </div>
          {#if msg.meta.commands?.length}
            <div class="commands">
              {#each msg.meta.commands as cmd}
                <button class="cmd" onclick={() => useCommand(cmd)} aria-label="Use command">$ {cmd}</button>
              {/each}
            </div>
          {/if}
        {/if}
      </article>
    {/each}

    {#if isStreaming}
      <article class="message assistant streaming" aria-busy="true">
        <div class="bubble">
          {#if currentStreamText}
            {@html renderMarkdown(currentStreamText)}
          {:else}
            <div class="thinking" aria-label="Thinking">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          {/if}
        </div>
        {#if currentMeta?.score_breakdown}
          <div class="meta">
            <span class="score">Score {currentMeta.score_breakdown.total}/100</span>
          </div>
        {/if}
      </article>
    {/if}
  </div>

  <div class="input-area">
    <textarea
      bind:value={inputText}
      onkeydown={handleKeydown}
      placeholder="Enter pentest query… Shift+Enter newline, Ctrl/Cmd+Enter send."
      rows={3}
      disabled={isStreaming}
      aria-label="Chat input"
    ></textarea>
    <div class="input-actions">
      {#if isStreaming}
        <button class="danger" onclick={cancelStream}>⏹ Stop</button>
      {:else}
        <button class="primary" onclick={handleSubmit} disabled={!inputText.trim()}>➤ Send</button>
      {/if}
      <span class="mode">{appState.mode.toUpperCase()}</span>
      {#if appState.yolo}
        <span class="yolo">YOLO</span>
      {:else}
        <span class="safe">SAFE</span>
      {/if}
    </div>
  </div>
</section>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--abyss);
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    scroll-behavior: smooth;
  }
  .message {
    display: flex;
    flex-direction: column;
    max-width: 88%;
    animation: finn-fade-in 280ms var(--spring-panel) both;
  }
  .message.user {
    align-self: flex-end;
  }
  .message.assistant {
    align-self: flex-start;
  }
  .bubble {
    padding: 0.8rem 1rem;
    border-radius: var(--radius-panel);
    font-size: 13px;
    line-height: 1.55;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
    word-break: break-word;
  }
  .message.user .bubble {
    background: var(--accent-12);
    border-color: var(--accent-20);
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: var(--radius-panel);
  }
  .bubble :global(p) { margin: 0 0 0.5rem 0; }
  .bubble :global(p:last-child) { margin-bottom: 0; }
  .bubble :global(pre) {
    position: relative;
    background: var(--abyss-1);
    padding: 0.75rem;
    border-radius: var(--radius-control);
    overflow-x: auto;
    border: 1px solid var(--glass-border);
    margin: 0.5rem 0;
  }
  .bubble :global(code) {
    font-family: var(--font-mono);
    font-size: 12px;
    background: rgba(255,255,255,0.06);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
  }
  .bubble :global(pre code) {
    background: transparent;
    padding: 0;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
    margin-top: 0.35rem;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
  }
  .score { color: var(--accent); }
  .badge { padding: 1px 5px; border-radius: 4px; font-weight: 600; }
  .badge.refusal { background: var(--danger-20); color: var(--danger); }
  .badge.compliant { background: var(--accent-12); color: var(--accent); }
  .copy {
    margin-left: auto;
    padding: 1px 6px;
    font-size: 10px;
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-secondary);
  }
  .commands {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.4rem;
  }
  .cmd {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--accent-20);
    background: var(--accent-8);
    color: var(--accent);
  }
  .input-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss-1);
  }
  .input-area textarea {
    flex: 1;
    resize: none;
    min-height: 64px;
  }
  .input-actions {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }
  .mode, .yolo, .safe {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--glass-border);
  }
  .yolo { border-color: var(--danger); color: var(--danger); background: var(--danger-20); }
  .safe { color: var(--accent); }
  .thinking { display: flex; gap: 0.35rem; }
  .thinking .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 1s ease-in-out infinite;
  }
  .thinking .dot:nth-child(2) { animation-delay: 0.15s; }
  .thinking .dot:nth-child(3) { animation-delay: 0.3s; }

  @keyframes finn-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.15); }
  }

  @media (prefers-reduced-motion: reduce) {
    .message { animation: none; }
    .thinking .dot { animation: none; }
  }
</style>
