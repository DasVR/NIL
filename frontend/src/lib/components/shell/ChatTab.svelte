<script lang="ts">
  import { onMount } from 'svelte';

  let container: HTMLDivElement;
  let messagesEnd: HTMLDivElement;

  let messages = $state<Array<{ role: string; content: string; timestamp: string }>>([]);
  let input = $state('');

  function sendMessage() {
    if (!input.trim()) return;
    const msg = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    messages.push(msg);
    input = '';
    scrollToBottom();
    
    // Simulate AI response
    setTimeout(() => {
      messages.push({ 
        role: 'assistant', 
        content: 'This is the AI strip — it will show agent conversations, tool blocks, diffs, and findings. Cmd+J toggles.', 
        timestamp: new Date().toLocaleTimeString() 
      });
      scrollToBottom();
    }, 500);
  }

  function scrollToBottom() {
    messagesEnd?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="chat-tab">
  <div class="chat-messages">
    {#each messages as msg}
      <div class="chat-message {msg.role}">
        <div class="chat-message-header">
          <span class="chat-message-role">{msg.role === 'user' ? 'You' : 'Finn'}</span>
          <span class="chat-message-time">{msg.timestamp}</span>
        </div>
        <div class="chat-message-content">{msg.content}</div>
      </div>
    {/each}
    <div bind:this={messagesEnd} />
  </div>
  
  <div class="chat-input-area">
    <textarea
      bind:value={input}
      placeholder="Message Finn... (Enter to send, Shift+Enter for new line)"
      onkeydown={handleKeydown}
      rows={1}
    />
    <button class="chat-send-btn" onclick={sendMessage} aria-label="Send">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .chat-tab {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--surface-base);
    overflow: hidden;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .chat-message {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 85%;
  }

  .chat-message.user {
    align-self: flex-end;
  }

  .chat-message.assistant {
    align-self: flex-start;
  }

  .chat-message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .chat-message.user .chat-message-header {
    flex-direction: row-reverse;
  }

  .chat-message-role {
    font-weight: 500;
    color: var(--text-secondary);
  }

  .chat-message-content {
    padding: 10px 14px;
    border-radius: var(--radius-panel);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    font-size: var(--font-xs);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .chat-message.user .chat-message-content {
    background: var(--accent-primary);
    color: var(--color-abyss-0);
    border-color: var(--accent-primary);
  }

  .chat-input-area {
    display: flex;
    gap: 8px;
    padding: var(--space-3);
    border-top: 1px solid var(--surface-border);
    background: var(--surface-panel);
    flex-shrink: 0;
  }

  .chat-input-area textarea {
    flex: 1;
    min-height: 44px;
    max-height: 120px;
    padding: 10px 14px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    background: var(--input-bg);
    color: var(--input-text);
    font-family: var(--font-sans);
    font-size: var(--step-0);
    line-height: 1.5;
    resize: none;
    transition: border-color var(--spring-snappy);
  }

  .chat-input-area textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .chat-input-area textarea::placeholder {
    color: var(--text-muted);
  }

  .chat-send-btn {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: var(--radius-control);
    background: var(--accent-primary);
    color: var(--color-abyss-0);
    cursor: pointer;
    transition: background var(--spring-snappy), transform var(--spring-snappy);
    flex-shrink: 0;
  }

  .chat-send-btn:hover {
    background: var(--accent-secondary);
  }

  .chat-send-btn:active {
    transform: scale(0.95);
  }
</style>