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

  function groupCommands(cmds: typeof visibleCommands) {
    const map = new Map<string, typeof visibleCommands>();
    for (const cmd of cmds) {
      const section = cmd.section ?? 'General';
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(cmd);
    }
    return Array.from(map.entries()).map(([section, commands]) => ({ section, commands }));
  }

  let groupedCommands = $derived(groupCommands(visibleCommands));

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
      {#if visibleCommands.length === 0}
        <div class="palette-empty">
          <Icon icon="ph:magnifying-glass-bold" width="20" height="20" />
          <p>No commands found</p>
          <span>Try a different search</span>
        </div>
      {:else}
        {#each groupedCommands as group}
          <div class="palette-section-header">{group.section}</div>
          {#each group.commands as cmd}
            {@const globalIdx = visibleCommands.indexOf(cmd)}
            <div
              class="palette-item {globalIdx === selectedIndex ? 'selected' : ''}"
              role="option"
              aria-selected={globalIdx === selectedIndex}
              id={`cmd-${cmd.id}`}
              onclick={() => paletteStore.executeCommand(cmd.id)}
            >
              <div class="palette-item-main">
                <Icon icon={cmd.icon || 'ph:command-bold'} width="14" height="14" />
                <span class="palette-item-label">{cmd.label}</span>
              </div>
              {#if cmd.shortcut}
                <kbd class="palette-item-shortcut">{cmd.shortcut}</kbd>
              {/if}
            </div>
          {/each}
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .palette-overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in oklab, var(--nil-void) 72%, transparent);
    z-index: var(--z-modal);
  }

  .palette-window {
    position: fixed;
    top: 12vh;
    left: 50%;
    transform: translateX(-50%);
    width: 640px;
    max-width: calc(100vw - 32px);
    background: var(--nil-raised);
    border-radius: var(--r-panel);
    border: 1px solid var(--nil-line-hot);
    box-shadow: var(--lift-3);
    z-index: var(--z-modal);
    overflow: hidden;
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
    transition: border-color var(--spring-snappy);
  }

  .palette-search input:focus {
    border-color: var(--nil-line-hot);
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
    outline: 1px solid var(--nil-line-hot);
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

  .palette-section-header {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    padding: var(--space-2) var(--space-3) var(--space-1);
    pointer-events: none;
    user-select: none;
  }

  .palette-section-header:not(:first-child) {
    margin-top: var(--space-2);
    border-top: 1px solid var(--surface-border);
    padding-top: var(--space-3);
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
</style>