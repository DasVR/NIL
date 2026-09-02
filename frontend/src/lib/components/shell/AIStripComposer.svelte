<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { agentStore, sendMessage as agentSendMessage, cancel } from '$lib/stores/agentStore';
  import Icon from '@iconify/svelte';

  let store = $derived($agentStore);
  let input = $state('');
  let mode = $state<'hunt' | 'chat' | 'code' | 'report'>('hunt');
  let expanded = $state(false);

  const modes = [
    { id: 'hunt', label: 'Hunt', icon: 'ph:radar-bold', desc: 'Assessment loop' },
    { id: 'chat', label: 'Chat', icon: 'ph:chat-circle-bold', desc: 'Security Q&A' },
    { id: 'code', label: 'Code', icon: 'ph:code-bold', desc: 'Write scripts' },
    { id: 'report', label: 'Report', icon: 'ph:file-text-bold', desc: 'Generate report' },
  ] as const;


  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        agentSendMessage(input, appState.activeEngagementId || 'default', mode);
        input = '';
      }
    }
  }

  function onSend() {
    if (input.trim()) {
      agentSendMessage(input, appState.activeEngagementId || 'default', mode);
      input = '';
    }
  }

  function toggleMode(newMode: typeof mode) {
    mode = newMode;
  }
</script>

<div class="ai-strip-composer">
  <div class="composer-header">
    <div class="composer-modes" role="group" aria-label="Agent mode">
      {#each modes as m}
        <button
          class="mode-chip {mode === m.id ? 'active' : ''}"
          onclick={() => toggleMode(m.id)}
          aria-pressed={mode === m.id}
          title={m.desc}
        >
          <Icon icon={m.icon} width="14" height="14" />
          <span>{m.label}</span>
        </button>
      {/each}
    </div>
    <div class="composer-actions">
      <button class="icon-btn" aria-label="Attach file" title="Attach File">
        <Icon icon="ph:paperclip-bold" width="16" height="16" />
      </button>
      <button class="icon-btn" aria-label="Voice input" title="Voice (Cmd+Shift+V)">
        <Icon icon="ph:microphone-bold" width="16" height="16" />
      </button>
      <button class="icon-btn" aria-label="Expand composer" title="Expand" onclick={() => expanded = !expanded}>
        <Icon icon={expanded ? 'ph:arrows-in-line-vertical-bold' : 'ph:arrows-out-line-vertical-bold'} width="16" height="16" />
      </button>
    </div>
  </div>

  <div class="composer-input-area">
  <textarea
    bind:value={input}
    placeholder={mode === 'hunt' ? 'Describe the target or next step...' : mode === 'chat' ? 'Ask a security question...' : mode === 'code' ? 'Describe what to build...' : 'Describe report section...'}
    onkeydown={handleKeydown}
    rows={expanded ? 4 : 1}
    aria-label="Agent input"
  ></textarea>
  <button class="composer-send-btn" onclick={onSend} disabled={!input.trim()} aria-label="Send">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>

  <div class="composer-hints">
    <kbd>Enter</kbd> Send &nbsp; <kbd>Shift+Enter</kbd> New line &nbsp; <kbd>Cmd+J</kbd> Toggle strip &nbsp; <kbd>Cmd+Y</kbd> YOLO
  </div>
</div>

<style>
  .ai-strip-composer {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
  }

  .composer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .composer-modes {
    display: flex;
    gap: 4px;
    flex: 1;
    overflow-x: auto;
  }

  .mode-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-card);
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--spring-snappy);
  }

  .mode-chip:hover {
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }

  .mode-chip.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--color-abyss-0);
  }

  .mode-chip.active :global(svg) {
    color: var(--color-abyss-0);
  }

  .composer-actions {
    display: flex;
    gap: 2px;
  }

  .composer-input-area {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    flex: 1;
    min-height: 0;
  }

  .composer-input-area textarea {
    flex: 1;
    min-height: 44px;
    max-height: 160px;
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

  .composer-input-area textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .composer-input-area textarea::placeholder {
    color: var(--text-muted);
  }

  .composer-send-btn {
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

  .composer-send-btn:hover:not(:disabled) {
    background: var(--accent-secondary);
  }

  .composer-send-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .composer-send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .composer-hints {
    display: flex;
    gap: 12px;
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    padding-top: var(--space-1);
    border-top: 1px solid var(--surface-border);
  }

  .composer-hints kbd {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--surface-hover);
    border: 1px solid var(--surface-border);
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
  }
</style>