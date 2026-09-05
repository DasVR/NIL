<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import Icon from '@iconify/svelte';
  import SettingsGeneral from '$lib/components/shell/SettingsGeneral.svelte';
  import SettingsAppearance from '$lib/components/shell/SettingsAppearance.svelte';
  import SettingsEditor from '$lib/components/shell/SettingsEditor.svelte';
  import SettingsTerminal from '$lib/components/shell/SettingsTerminal.svelte';
  import SettingsAI from '$lib/components/shell/SettingsAI.svelte';
  import SettingsPlugins from '$lib/components/shell/SettingsPlugins.svelte';
  import SettingsShortcuts from '$lib/components/shell/SettingsShortcuts.svelte';
  import SettingsAdvanced from '$lib/components/shell/SettingsAdvanced.svelte';

  interface Props {
    open?: boolean;
    onToggle?: (open: boolean) => void;
  }

  let { open = false, onToggle }: Props = $props();

  let activeCategory = $state<'general' | 'appearance' | 'editor' | 'terminal' | 'ai' | 'plugins' | 'shortcuts' | 'advanced'>('general');
  let categories = [
    { id: 'general', label: 'General', icon: 'ph:gear-bold' },
    { id: 'appearance', label: 'Appearance', icon: 'ph:paint-brush-broad-bold' },
    { id: 'editor', label: 'Editor', icon: 'ph:code-bold' },
    { id: 'terminal', label: 'Terminal', icon: 'ph:terminal-bold' },
    { id: 'ai', label: 'Agent', icon: 'ph:cpu-bold' },
    { id: 'plugins', label: 'Plugins', icon: 'ph:puzzle-piece-bold' },
    { id: 'shortcuts', label: 'Shortcuts', icon: 'ph:keyboard-bold' },
    { id: 'advanced', label: 'Advanced', icon: 'ph:wrench-bold' },
  ] as const;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (onToggle) onToggle(false);
    }
  }
</script>

{#if open}
  <div class="settings-overlay" onclick={() => { if (onToggle) onToggle(false); }} />
  <div class="settings-sheet" role="dialog" aria-label="Settings" onkeydown={handleKeydown}>
    <div class="settings-header">
      <h2>Settings</h2>
      <button class="settings-close" onclick={appState.toggleSettings} aria-label="Close">
        <Icon icon="ph:x-bold" width="20" height="20" />
      </button>
    </div>

    <div class="settings-body">
      <nav class="settings-sidebar" aria-label="Settings categories">
        <ul>
          {#each categories as cat}
            <li>
              <button
                class="settings-category {activeCategory === cat.id ? 'active' : ''}"
                onclick={() => activeCategory = cat.id}
                aria-selected={activeCategory === cat.id}
              >
                <Icon icon={cat.icon} width="16" height="16" />
                <span>{cat.label}</span>
              </button>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="settings-content">
        {#if activeCategory === 'general'}
          <SettingsGeneral />
        {:else if activeCategory === 'appearance'}
          <SettingsAppearance />
        {:else if activeCategory === 'editor'}
          <SettingsEditor />
        {:else if activeCategory === 'terminal'}
          <SettingsTerminal />
        {:else if activeCategory === 'ai'}
          <SettingsAI />
        {:else if activeCategory === 'plugins'}
          <SettingsPlugins />
        {:else if activeCategory === 'shortcuts'}
          <SettingsShortcuts />
        {:else if activeCategory === 'advanced'}
          <SettingsAdvanced />
        {/if}
      </div>
    </div>

    <div class="settings-footer">
      <button class="settings-btn secondary" onclick={appState.toggleSettings}>
        <Icon icon="ph:x-bold" width="14" height="14" />
        <span>Close</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in oklab, var(--nil-void) 72%, transparent);
    z-index: var(--z-modal);
  }

  .settings-sheet {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 880px;
    max-width: calc(100vw - 32px);
    height: 72vh;
    max-height: 800px;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-3);
    z-index: var(--z-modal);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--surface-border);
    flex-shrink: 0;
  }

  .settings-header h2 {
    font-size: var(--step-1);
    font-weight: 600;
    color: var(--text-primary);
  }

  .settings-close {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .settings-close:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .settings-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  .settings-sidebar {
    width: 220px;
    min-width: 220px;
    border-right: 1px solid var(--surface-border);
    padding: var(--space-4);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .settings-sidebar ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .settings-category {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .settings-category:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .settings-category.active {
    background: var(--accent-soft);
    color: var(--nil-ink);
  }

  .settings-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .settings-search {
    position: relative;
    padding: var(--space-4);
    border-bottom: 1px solid var(--surface-border);
    flex-shrink: 0;
  }

  .settings-search svg {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .settings-search input {
    width: 100%;
    padding: 8px 12px 8px 44px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-input);
    color: var(--input-text);
    font-family: var(--font-sans);
    font-size: var(--font-xs);
    outline: none;
  }

  .settings-search input:focus {
    border-color: var(--nil-line-hot);
  }

  .settings-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--surface-border);
    flex-shrink: 0;
  }

  .settings-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-control);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    transition: border-color var(--dur-flip) var(--ease-out),
      background var(--dur-flip) var(--ease-out),
      color var(--dur-flip) var(--ease-out);
  }

  .settings-btn.secondary {
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    color: var(--nil-ink-2);
  }

  .settings-btn.secondary:hover {
    background: var(--nil-panel);
    color: var(--nil-ink);
  }
</style>