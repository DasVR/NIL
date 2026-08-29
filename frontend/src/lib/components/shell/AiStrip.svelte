<script lang="ts">
  import Icon from '@iconify/svelte';
  import ThinkingLogo from '$lib/components/effects/ThinkingLogo.svelte';

  interface AiStripProps {
    open?: boolean;
    state?: 'idle' | 'thinking' | 'streaming' | 'done';
    model?: string;
    onToggle?: () => void;
    className?: string;
  }

  let {
    open = false,
    state = 'idle',
    model = 'nemotron-3-nano',
    onToggle = () => {},
    className = ''
  }: AiStripProps = $props();

  const stateLabel: Record<'idle' | 'thinking' | 'streaming' | 'done', string> = {
    idle: 'Ready',
    thinking: 'Thinking…',
    streaming: 'Streaming',
    done: 'Done'
  };
</script>

<div class="ai-strip {open ? 'ai-strip--open' : ''} {className}" data-state={state}>
  <div class="ai-strip__grip">
    <button
      class="ai-strip__toggle"
      onclick={() => onToggle()}
      aria-label={open ? 'Collapse AI strip' : 'Expand AI strip'}
      aria-expanded={open}
    >
      <ThinkingLogo state={state} size="0.9rem" />
      <span class="ai-strip__model">{model}</span>
      <span class="ai-strip__status">{stateLabel[state]}</span>
      <Icon class="ai-strip__chev" icon={open ? 'ph:caret-down-bold' : 'ph:caret-up-bold'} aria-hidden="true" />
    </button>
  </div>

  {#if open}
    <div class="ai-strip__body">
      <div class="ai-strip__input-row">
        <span class="ai-strip__prompt-char" aria-hidden="true">❯</span>
        <input
          class="ai-strip__input"
          type="text"
          placeholder="Ask NIL about this engagement…"
          aria-label="Ask NIL about this engagement"
        />
        <button class="icon-btn" aria-label="Send">
          <Icon icon="ph:arrow-up-bold" />
        </button>
      </div>
      <div class="ai-strip__meta">
        <span>⌘J to collapse</span>
        <span>{stateLabel[state]}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-strip {
    border-top: 1px solid var(--border-subtle);
    background: var(--surface-1);
  }
  .ai-strip__grip {
    padding: var(--space-1) var(--space-3);
  }
  .ai-strip__toggle {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    min-height: var(--control-height);
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-secondary);
  }
  .ai-strip__model {
    font: var(--type-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }
  .ai-strip__status {
    margin-left: auto;
    font: var(--type-overline);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
  }
  .ai-strip__chev {
    color: var(--text-tertiary);
  }
  .ai-strip__body {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .ai-strip__input-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface-0);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: var(--space-2);
  }
  .ai-strip__prompt-char {
    color: var(--accent);
    font: var(--type-mono);
  }
  .ai-strip__input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font: var(--type-ui);
    outline: none;
  }
  .ai-strip__meta {
    display: flex;
    justify-content: space-between;
    font: var(--type-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }
</style>
