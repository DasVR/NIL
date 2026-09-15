<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { droplet } from '$lib/motion/droplet';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import DitherWipe from '$lib/ui/DitherWipe.svelte';
  import SettingsGeneral from '$lib/components/shell/SettingsGeneral.svelte';
  import SettingsAppearance from '$lib/components/shell/SettingsAppearance.svelte';
  import SettingsEditor from '$lib/components/shell/SettingsEditor.svelte';
  import SettingsTerminal from '$lib/components/shell/SettingsTerminal.svelte';
  import SettingsAI from '$lib/components/shell/SettingsAI.svelte';
  import SettingsPlugins from '$lib/components/shell/SettingsPlugins.svelte';
  import SettingsShortcuts from '$lib/components/shell/SettingsShortcuts.svelte';
  import SettingsAdvanced from '$lib/components/shell/SettingsAdvanced.svelte';
  import SourceControl from '$lib/components/shell/SourceControl.svelte';
  import GitHubPanel from '$lib/components/shell/GitHubPanel.svelte';
  import McpPanel from '$lib/components/shell/McpPanel.svelte';
  import type { SettingsCategory } from '$lib/stores/appState.svelte.ts';
  import { focusTrap } from '$lib/a11y/focusTrap';

  interface Props {
    open?: boolean;
    onToggle?: (open: boolean) => void;
  }

  let { open = false, onToggle }: Props = $props();

  let sheetEl: HTMLDivElement | undefined = $state();
  const headingId = $props.id();

  // Land on the active category so the first Tab press moves into its pane,
  // and give focus back to whatever opened the sheet (⌘, from the composer,
  // the palette's "Open settings", the titlebar gear) when it closes.
  const trap = focusTrap({
    initial: () => sheetEl?.querySelector<HTMLElement>('.settings-category[aria-current="true"]'),
  });

  const activeCategory = $derived(appState.settingsCategory);
  const categories: { id: SettingsCategory; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'editor', label: 'Editor' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'ai', label: 'Agent' },
    { id: 'source', label: 'Source control' },
    { id: 'github', label: 'GitHub' },
    { id: 'mcp', label: 'MCP tools' },
    { id: 'plugins', label: 'Plugins' },
    { id: 'shortcuts', label: 'Shortcuts' },
    { id: 'advanced', label: 'Advanced' },
  ];

  function close() {
    if (onToggle) onToggle(false);
    else appState.toggleSettings();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    close();
  }
</script>

{#if open}
  <!-- Pointer-only light-dismiss; kept out of the Tab cycle (Escape closes for keyboard). -->
  <button
    type="button"
    class="settings-overlay"
    aria-label="Close settings"
    tabindex="-1"
    onclick={close}
  ></button>
  <div
    class="settings-sheet"
    role="dialog"
    aria-modal="true"
    aria-labelledby={headingId}
    tabindex="-1"
    bind:this={sheetEl}
    onkeydown={handleKeydown}
    {@attach trap}
  >
    <DitherWipe mode="dissolve" />
    <div class="settings-header">
      <h2 id={headingId}>Settings</h2>
      <button class="settings-close nil-halo" type="button" onclick={close} aria-label="Close settings">
        <NilIcon name="x" size={16} />
      </button>
    </div>

    <div class="settings-body">
      <nav class="settings-sidebar" aria-label="Settings categories">
        <ul>
          {#each categories as cat}
            <li>
              <button
                class="settings-category nil-halo nil-row-host {activeCategory === cat.id ? 'active' : ''}"
                type="button"
                onclick={() => (appState.settingsCategory = cat.id)}
                aria-current={activeCategory === cat.id ? 'true' : undefined}
                {@attach droplet}
                data-cuelume-hover="tick"
              >{cat.label}</button>
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
        {:else if activeCategory === 'source'}
          <SourceControl />
        {:else if activeCategory === 'github'}
          <GitHubPanel />
        {:else if activeCategory === 'mcp'}
          <McpPanel />
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
      <button class="settings-btn secondary nil-lift nil-halo" type="button" onclick={close}>
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  .settings-overlay {
    display: block;
    position: fixed;
    inset: 0;
    width: 100%;
    border: none;
    padding: 0;
    cursor: default;
    background: color-mix(in oklab, var(--nil-void) 72%, transparent);
    z-index: var(--z-modal);
  }

  .settings-sheet {
    /* Fixed like the palette: as a relative box it sat in the app-shell's flex
       column and squashed the workbench above it instead of floating over it. */
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
    padding: var(--s-4) var(--s-5);
    border-bottom: 1px solid var(--nil-line);
    flex-shrink: 0;
  }

  .settings-header h2 {
    font: 600 var(--t-lead)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
  }

  .settings-close {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
  }

  .settings-close:hover {
    background: var(--nil-raised);
    color: var(--nil-ink);
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
    border-right: 1px solid var(--nil-line);
    padding: var(--s-4);
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
    width: 100%;
    height: var(--row-h);
    padding: 0 10px;
    border: none;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-meta)/1 var(--font-ui);
    text-align: left;
    cursor: pointer;
  }

  .settings-category:hover,
  .settings-category.active {
    background: var(--nil-panel);
    color: var(--nil-ink);
  }

  .settings-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .settings-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--s-3);
    padding: var(--s-4) var(--s-5);
    border-top: 1px solid var(--nil-line);
    flex-shrink: 0;
  }

  .settings-btn {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 28px;
    border-radius: var(--r-field);
    font: 500 var(--t-meta)/1 var(--font-ui);
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