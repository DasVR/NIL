<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';

  let q = $state('');
  let selectedIndex = $state(0);

  // Static commands
  const staticCommands = [
    { id: 'chat', label: 'Go to workspace', shortcut: '', run: () => goto('/app') },
    { id: 'findings', label: 'Go to findings', shortcut: '', run: () => goto('/app/findings') },
    { id: 'notes', label: 'Go to notes', shortcut: '', run: () => goto('/app/notes') },
    { id: 'tools', label: 'Go to tools', shortcut: '', run: () => goto('/app/tools') },
    { id: 'settings', label: 'Go to settings', shortcut: '⌘,', run: () => goto('/app/settings') },
    { id: 'yolo', label: 'Toggle YOLO', shortcut: '⌘Y', run: () => appState.toggleYolo() },
    { id: 'hunt', label: 'Mode: hunt', shortcut: '', run: () => (appState.mode = 'hunt') },
    { id: 'chatmode', label: 'Mode: chat', shortcut: '', run: () => (appState.mode = 'chat') },
    { id: 'code', label: 'Mode: code', shortcut: '', run: () => (appState.mode = 'code') },
    { id: 'report', label: 'Mode: report', shortcut: '', run: () => (appState.mode = 'report') },
    { id: 'newEng', label: 'New engagement', shortcut: '⌘N', run: () => { const n = prompt('Name?'); if (n) appState.createEngagement(n); } }
  ];

  // Dynamic commands from live data — targets, findings, engagements, tools
  const dynamicCommands = $derived([
    ...appState.engagements.map((e) => ({
      id: `eng-${e.name}`,
      label: `Engagement: ${e.name}`,
      group: 'engagements',
      run: () => appState.select(e.name)
    })),
    ...appState.targets.map((t) => ({
      id: `target-${t.id}`,
      label: `Target: ${t.host}`,
      group: 'targets',
      run: () => { appState.activeView = 'terminal'; }
    })),
    ...appState.findings.map((f) => ({
      id: `finding-${f.id}`,
      label: `Finding: ${f.title}`,
      group: 'findings',
      run: () => goto('/app/findings')
    })),
    ...appState.plugins.map((p) => ({
      id: `plugin-${p.name}`,
      label: `Tool: ${p.name}`,
      group: 'tools',
      run: () => goto('/app/tools')
    }))
  ]);

  const allCommands = $derived([...staticCommands, ...dynamicCommands]);

  const filtered = $derived(
    allCommands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
  );

  $effect(() => {
    q;
    selectedIndex = 0;
  });

  function pick(cmd) {
    cmd.run();
    appState.paletteOpen = false;
    q = '';
    selectedIndex = 0;
  }

  function closePalette() {
    appState.paletteOpen = false;
    q = '';
    selectedIndex = 0;
  }

  function onKey(ev) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (filtered.length) selectedIndex = (selectedIndex + 1) % filtered.length;
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (filtered.length) selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (filtered[selectedIndex]) pick(filtered[selectedIndex]);
    } else if (ev.key === 'Escape') {
      closePalette();
    }
  }
</script>

{#if appState.paletteOpen}
<div class="overlay" onclick={closePalette} role="presentation">
  <div class="palette" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
    <div class="search-row">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
      </svg>
      <input
        bind:value={q}
        placeholder="Search commands, targets, findings, tools…"
        autofocus
        onkeydown={onKey}
        aria-autocomplete="list"
        aria-controls="palette-list"
        aria-activedescendant={filtered[selectedIndex] ? `cmd-${filtered[selectedIndex].id}` : undefined}
      />
    </div>

    <ul id="palette-list" role="listbox" class="results">
      {#each filtered as cmd, i}
        <li
          id={`cmd-${cmd.id}`}
          role="option"
          aria-selected={i === selectedIndex}
          class:selected={i === selectedIndex}
          onclick={() => pick(cmd)}
          onkeydown={(e) => { if (e.key === 'Enter') pick(cmd); }}
          tabindex="0"
        >
          <span class="cmd-icon" aria-hidden="true">
            {#if cmd.group === 'engagements'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1"/></svg>
            {:else if cmd.group === 'targets'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
            {:else if cmd.group === 'findings'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19"/></svg>
            {:else if cmd.group === 'tools'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            {/if}
          </span>
          <span class="cmd-label">{cmd.label}</span>
          {#if cmd.group}
            <span class="cmd-group mono">{cmd.group}</span>
          {/if}
          {#if cmd.shortcut}
            <kbd class="cmd-shortcut">{cmd.shortcut}</kbd>
          {/if}
        </li>
      {:else}
        <li class="empty" role="presentation">
          <span class="empty-icon" aria-hidden="true">⌕</span>
          <span class="empty-text">No results for “{q}”</span>
          <span class="empty-hint">Try a command, target, finding, or tool name</span>
        </li>
      {/each}
    </ul>

    <footer class="footer-hint" aria-hidden="true">
      <span>↑↓ to navigate</span>
      <span class="sep">·</span>
      <span>↵ to run</span>
      <span class="sep">·</span>
      <span>esc to close</span>
    </footer>
  </div>
</div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.62);
    display: grid;
    place-items: start center;
    padding-top: 10vh;
    z-index: 50;
    animation: overlay-in 200ms var(--spring-panel) both;
  }

  .palette {
    width: min(580px, 92vw);
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(36px) saturate(1.3);
    -webkit-backdrop-filter: blur(36px) saturate(1.3);
    border-radius: 14px;
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    overflow: hidden;
    animation: palette-in 280ms var(--spring-panel) both;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .search-icon {
    flex-shrink: 0;
    color: var(--text-faint);
  }

  .search-row input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0.35rem 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text);
    box-shadow: none;
  }

  .search-row input:focus {
    border: none;
    box-shadow: none;
    outline: none;
  }

  .search-row input::placeholder {
    color: var(--text-faint);
    font-weight: 400;
  }

  .results {
    list-style: none;
    margin: 0;
    padding: 0.4rem;
    max-height: 340px;
    overflow-y: auto;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.65rem;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-dim);
    font-size: 13px;
    transition:
      background 140ms var(--spring-control),
      color 100ms var(--spring-control),
      transform 140ms var(--spring-control);
  }

  li:hover:not(.empty) {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
  }

  li.selected {
    background: var(--green-soft);
    color: var(--text);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .cmd-icon {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-faint);
    flex-shrink: 0;
  }

  li.selected .cmd-icon {
    color: var(--green);
    background: var(--green-soft);
  }

  .cmd-label {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cmd-group {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-faint);
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    padding: 1px 5px;
    flex-shrink: 0;
  }

  .cmd-shortcut {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-faint);
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    border-radius: 5px;
    padding: 0.12rem 0.35rem;
    flex-shrink: 0;
  }

  li.selected .cmd-shortcut {
    color: var(--text-dim);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .empty {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 2rem 1rem;
    cursor: default;
    border-radius: var(--radius-control);
  }

  .empty-icon {
    font-size: 1.5rem;
    color: var(--text-faint);
    opacity: 0.5;
    line-height: 1;
  }

  .empty-text {
    font-size: 13px;
    color: var(--text-dim);
  }

  .empty-hint {
    font-size: 12px;
    color: var(--text-faint);
  }

  .footer-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.55rem 0.85rem;
    border-top: 1px solid var(--glass-border);
    background: rgba(0, 0, 0, 0.25);
    font-size: 11px;
    color: var(--text-faint);
  }

  .sep {
    opacity: 0.45;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes palette-in {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .palette {
      animation: none !important;
    }
  }
</style>
