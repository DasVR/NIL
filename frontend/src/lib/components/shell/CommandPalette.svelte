<script lang="ts">
  import { onMount } from 'svelte';
  import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
  import Icon from '@iconify/svelte';

  interface Props {
    open?: boolean;
    onToggle?: (open: boolean) => void;
  }

  let { open = false, onToggle }: Props = $props();

  let inputRef: HTMLInputElement;
  let selectedIndex = $state(0);

  function filteredCommands() {
    if (!paletteStore.query) return paletteStore.commands;
    const q = paletteStore.query.toLowerCase();
    return paletteStore.commands.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.shortcut?.toLowerCase().includes(q) ||
      c.section?.toLowerCase().includes(q)
    );
  }

  let visibleCommands = $derived(filteredCommands());

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, visibleCommands.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleCommands[selectedIndex]) {
        paletteStore.executeCommand(visibleCommands[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      paletteStore.closePalette();
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    paletteStore.query = target.value;
    selectedIndex = 0;
  }

  onMount(() => {
    inputRef?.focus();
    selectedIndex = 0;
  });
</script>

{#if open}
  <div class="palette-overlay" onclick={() => { if (onToggle) onToggle(false); }} />
  <div class="palette-window" role="dialog" aria-label="Command Palette">
    <div class="palette-header">
      <div class="palette-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          bind:this={inputRef}
          type="text"
          bind:value={paletteStore.query}
          oninput={handleInput}
          onkeydown={handleKeydown}
          placeholder="Type a command or search..."
          aria-label="Command palette search"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd class="palette-hint">Cmd+K</kbd>
      </div>
    </div>

    <div class="palette-results" role="listbox" aria-activedescendant={`cmd-${visibleCommands[selectedIndex]?.id}`}>
      {#each visibleCommands as cmd, i}
        <div
          class="palette-item {i === selectedIndex ? 'selected' : ''}"
          role="option"
          aria-selected={i === selectedIndex}
          id={`cmd-${cmd.id}`}
          onclick={() => paletteStore.executeCommand(cmd.id)}
        >
          <div class="palette-item-main">
            <Icon icon={cmd.icon || 'ph:command-bold'} width="16" height="16" />
            <span class="palette-item-label">{cmd.label}</span>
          </div>
          {#if cmd.shortcut}
            <kbd class="palette-item-shortcut">{cmd.shortcut}</kbd>
          {/if}
          {#if cmd.section}
            <span class="palette-item-section">{cmd.section}</span>
          {/if}
        </div>
      {/each}

      {#if visibleCommands.length === 0}
        <div class="palette-empty">
          <Icon icon="ph:magnifying-glass-bold" width="20" height="20" />
          <p>No commands found</p>
          <span>Try a different search</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .palette-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 5, 7, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: var(--z-modal);
    animation: fadeIn 0.15s var(--spring-smooth);
  }

  .palette-window {
    position: fixed;
    top: 12vh;
    left: 50%;
    transform: translateX(-50%);
    width: 640px;
    max-width: calc(100vw - 32px);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    box-shadow: 
      0 24px 48px rgba(5, 5, 7, 0.6),
      0 0 0 1px var(--accent-primary);
    z-index: var(--z-modal);
    overflow: hidden;
    animation: slideDown 0.2s var(--spring-snappy);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .palette-header {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--surface-border);
  }

  .palette-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .palette-search svg {
    position: absolute;
    left: 14px;
    color: var(--text-tertiary);
    flex-shrink: 0;
    z-index: 1;
  }

  .palette-search input {
    width: 100%;
    padding: 10px 14px 10px 42px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-input);
    color: var(--input-text);
    font-family: var(--font-sans);
    font-size: var(--step-0);
    outline: none;
    transition: border-color var(--spring-snappy), box-shadow var(--spring-snappy);
  }

  .palette-search input:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .palette-hint {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--surface-hover);
    border: 1px solid var(--surface-border);
  }

  .palette-results {
    max-height: 480px;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .palette-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-control);
    cursor: pointer;
    transition: background var(--spring-snappy);
  }

  .palette-item:hover,
  .palette-item.selected {
    background: var(--surface-hover);
  }

  .palette-item.selected {
    outline: 1px solid var(--accent-primary);
  }

  .palette-item-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .palette-item-label {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .palette-item-shortcut {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--surface-hover);
    border: 1px solid var(--surface-border);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .palette-item-section {
    font-size: var(--font-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .palette-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    gap: var(--space-2);
    color: var(--text-tertiary);
    text-align: center;
  }

  .palette-empty p {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .palette-empty span {
    font-size: var(--font-2xs);
  }

  @media (prefers-reduced-motion: reduce) {
    .palette-overlay, .palette-window { animation: none; }
  }

  html.reduce-motion .palette-overlay,
  html.reduce-motion .palette-window { animation: none; }
</style>