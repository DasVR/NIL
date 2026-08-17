<script lang="ts">
  import { pentestChat, streamPentestChat, type StreamChunk, type PentestChatResponse } from '$lib/api';
  import { appState } from '$lib/stores.svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  // Props
  export let engagement: string = 'default';

  // Local state
  let inputText = $state('');
  let messages = $state<Array<{ role: 'user' | 'assistant'; content: string; meta?: PentestChatResponse }>>([]);
  let isStreaming = $state(false);
  let currentStreamText = $state('');
  let currentMeta = $state<Partial<PentestChatResponse> | null>(null);
  let chatContainer: HTMLDivElement;
  let abortFn: (() => void) | null = null;

  // Auto-scroll
  $effect(() => {
    if (chatContainer && (messages.length || currentStreamText)) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  function renderMarkdown(text: string): string {
    const raw = marked.parse(text, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }

  function handleSubmit() {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText.trim();
    inputText = '';

    messages = [...messages, { role: 'user', content: text }];
    isStreaming = true;
    currentStreamText = '';
    currentMeta = null;

    // Use streaming if available, fallback to regular
    abortFn = streamPentestChat(
      {
        engagement,
        message: text,
        mode: appState.mode,
        yolo: appState.yolo,
      },
      (chunk: StreamChunk) => {
        if (chunk.type === 'text' && chunk.content) {
          currentStreamText += chunk.content;
        } else if (chunk.type === 'score' && chunk.score) {
          currentMeta = { ...currentMeta, score_breakdown: chunk.score };
        } else if (chunk.type === 'done') {
          isStreaming = false;
          messages = [...messages, {
            role: 'assistant',
            content: currentStreamText,
            meta: currentMeta as PentestChatResponse | undefined,
          }];
          currentStreamText = '';
          currentMeta = null;
          abortFn = null;
        } else if (chunk.type === 'error') {
          isStreaming = false;
          messages = [...messages, {
            role: 'assistant',
            content: `Error: ${chunk.error || 'Unknown error'}`,
          }];
          currentStreamText = '';
          currentMeta = null;
          abortFn = null;
        }
      },
      (err) => {
        isStreaming = false;
        messages = [...messages, {
          role: 'assistant',
          content: `Error: ${err.message}`,
        }];
        currentStreamText = '';
        currentMeta = null;
        abortFn = null;
      }
    );
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function cancelStream() {
    if (abortFn) {
      abortFn();
      abortFn = null;
    }
    isStreaming = false;
    currentStreamText = '';
    currentMeta = null;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function insertCommand(cmd: string) {
    inputText = cmd;
  }
</script>

<div class="chat-panel">
  <!-- Messages -->
  <div class="messages" bind:this={chatContainer}>
    {#each messages as msg, i}
      <div class="message {msg.role}">
        <div class="avatar">
          {#if msg.role === 'user'}
            <span class="avatar-icon">👤</span>
          {:else}
            <span class="avatar-icon">🔒</span>
          {/if}
        </div>
        <div class="content">
          <div class="bubble">
            {#if msg.role === 'assistant'}
              {@html renderMarkdown(msg.content)}
            {:else}
              <p>{msg.content}</p>
            {/if}
          </div>
          {#if msg.meta}
            <div class="meta">
              <span class="score">Score: {msg.meta.score}/100</span>
              {#if msg.meta.score_breakdown}
                <span class="breakdown">
                  Q:{msg.meta.score_breakdown.quality} 
                  F:{msg.meta.score_breakdown.filteredness} 
                  S:{msg.meta.score_breakdown.speed}
                </span>
              {/if}
              {#if msg.meta.is_refusal}
                <span class="refusal-badge">⚠️ REFUSAL</span>
              {:else}
                <span class="compliant-badge">✅ COMPLIANT</span>
              {/if}
              {#if msg.meta.template_used}
                <span class="template">T:{msg.meta.template_used}</span>
              {/if}
              <button class="copy-btn" onclick={() => copyToClipboard(msg.content)}>📋</button>
            </div>
            {#if msg.meta.commands && msg.meta.commands.length > 0}
              <div class="commands">
                {#each msg.meta.commands as cmd}
                  <button class="cmd-btn" onclick={() => insertCommand(cmd)}>
                    $ {cmd}
                  </button>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/each}

    {#if isStreaming}
      <div class="message assistant streaming">
        <div class="avatar"><span class="avatar-icon">🔒</span></div>
        <div class="content">
          <div class="bubble">
            {#if currentStreamText}
              {@html renderMarkdown(currentStreamText)}
            {:else}
              <div class="thinking">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            {/if}
          </div>
          {#if currentMeta?.score_breakdown}
            <div class="meta">
              <span class="score">Score: {currentMeta.score_breakdown.total}/100</span>
              <span class="breakdown">
                Q:{currentMeta.score_breakdown.quality} 
                F:{currentMeta.score_breakdown.filteredness} 
                S:{currentMeta.score_breakdown.speed}
              </span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Input -->
  <div class="input-area">
    <textarea
      bind:value={inputText}
      onkeydown={handleKeydown}
      placeholder="Enter pentest query... (Shift+Enter for newline)"
      rows={3}
      disabled={isStreaming}
    ></textarea>
    <div class="input-actions">
      {#if isStreaming}
        <button class="btn cancel" onclick={cancelStream}>⏹ Stop</button>
      {:else}
        <button class="btn send" onclick={handleSubmit} disabled={!inputText.trim()}>
          ➤ Send
        </button>
      {/if}
      <span class="mode-badge">{appState.mode.toUpperCase()}</span>
      {#if appState.yolo}
        <span class="yolo-badge">🟢 YOLO</span>
      {:else}
        <span class="yolo-badge off">⚪ SAFE</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--abyss, #050507);
    color: var(--green, #00d992);
    font-family: 'JetBrains Mono', monospace;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    gap: 0.75rem;
    max-width: 90%;
  }

  .message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .message.assistant {
    align-self: flex-start;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 217, 146, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(0, 217, 146, 0.2);
  }

  .avatar-icon {
    font-size: 14px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .bubble {
    background: rgba(0, 217, 146, 0.05);
    border: 1px solid rgba(0, 217, 146, 0.15);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    line-height: 1.6;
    font-size: 13px;
  }

  .message.user .bubble {
    background: rgba(0, 217, 146, 0.1);
    border-color: rgba(0, 217, 146, 0.3);
  }

  .bubble :global(p) { margin: 0 0 0.5rem 0; }
  .bubble :global(p:last-child) { margin-bottom: 0; }
  .bubble :global(pre) {
    background: rgba(0,0,0,0.4);
    padding: 0.75rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }
  .bubble :global(code) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }
  .bubble :global(ul), .bubble :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.25rem;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 10px;
    opacity: 0.6;
    margin-top: 0.25rem;
  }

  .score { color: #00d992; font-weight: 600; }
  .breakdown { color: #888; }
  .refusal-badge { color: #ff6b6b; }
  .compliant-badge { color: #00d992; }
  .template { color: #888; font-style: italic; }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .copy-btn:hover { opacity: 1; }

  .commands {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .cmd-btn {
    background: rgba(0, 217, 146, 0.08);
    border: 1px solid rgba(0, 217, 146, 0.2);
    color: #00d992;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.2s;
  }
  .cmd-btn:hover {
    background: rgba(0, 217, 146, 0.15);
    border-color: rgba(0, 217, 146, 0.4);
  }

  .thinking {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00d992;
    animation: pulse 1.4s infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .input-area {
    border-top: 1px solid rgba(0, 217, 146, 0.1);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  textarea {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 217, 146, 0.2);
    border-radius: 8px;
    color: #00d992;
    padding: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    resize: vertical;
    min-height: 60px;
  }
  textarea:focus {
    outline: none;
    border-color: rgba(0, 217, 146, 0.5);
  }
  textarea::placeholder { color: rgba(0, 217, 146, 0.3); }
  textarea:disabled { opacity: 0.5; }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn.send {
    background: rgba(0, 217, 146, 0.15);
    color: #00d992;
    border: 1px solid rgba(0, 217, 146, 0.3);
  }
  .btn.send:hover:not(:disabled) {
    background: rgba(0, 217, 146, 0.25);
  }
  .btn.send:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn.cancel {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
  .btn.cancel:hover {
    background: rgba(255, 107, 107, 0.25);
  }

  .mode-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0, 217, 146, 0.1);
    color: #00d992;
    border: 1px solid rgba(0, 217, 146, 0.2);
  }

  .yolo-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0, 217, 146, 0.1);
    color: #00d992;
  }
  .yolo-badge.off {
    background: rgba(255, 255, 255, 0.05);
    color: #888;
  }
</style>