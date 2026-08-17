<script>
  import { getProviders } from '$lib/api';
  import { Motion, AnimatePresence } from 'svelte-motion';

  let { open = $bindable(false) } = $props();
  let providers = $state([]);
  let loading = $state(false);
  let search = $state('');

  const categories = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'typography', label: 'Typography' },
    { id: 'motion', label: 'Motion' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'chat', label: 'Chat' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'keyboard', label: 'Keyboard' }
  ];

  let activeTab = $state('appearance');

  async function loadProviders() {
    loading = true;
    try {
      const data = await getProviders();
      providers = data.resolved || [];
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function set(key, value) {
    localStorage.setItem(`finn.settings.${key}`, JSON.stringify(value));
    document.documentElement.style.setProperty(`--${key}`, value);
  }

  function get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(`finn.settings.${key}`) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }

  function resetDefaults() {
    if (!confirm('Reset all settings to defaults?')) return;
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('finn.settings.')) localStorage.removeItem(k);
    });
    location.reload();
  }

  const controls = {
    appearance: [
      { key: 'glassBlur', label: 'Glass blur (px)', type: 'range', min: 0, max: 40, step: 1, fallback: 24 },
      { key: 'scanlines', label: 'Scanlines overlay', type: 'toggle', fallback: false },
      { key: 'noise', label: 'Noise overlay', type: 'toggle', fallback: false },
      { key: 'accentHue', label: 'Accent hue shift', type: 'range', min: 0, max: 360, step: 10, fallback: 0 }
    ],
    typography: [
      { key: 'uiFontSize', label: 'UI font size (px)', type: 'range', min: 12, max: 16, step: 1, fallback: 13 },
      { key: 'monoFontSize', label: 'Mono font size (px)', type: 'range', min: 11, max: 15, step: 1, fallback: 13 }
    ],
    motion: [
      { key: 'animations', label: 'Enable animations', type: 'toggle', fallback: true },
      { key: 'springIntensity', label: 'Spring intensity (%)', type: 'range', min: 0, max: 100, step: 5, fallback: 100 }
    ],
    terminal: [
      { key: 'termFontSize', label: 'Terminal font size (px)', type: 'range', min: 10, max: 18, step: 1, fallback: 13 },
      { key: 'termCursorBlink', label: 'Cursor blink', type: 'toggle', fallback: true },
      { key: 'termScrollback', label: 'Scrollback lines', type: 'range', min: 1000, max: 10000, step: 1000, fallback: 5000 }
    ],
    chat: [
      { key: 'copyBtnVisible', label: 'Always show copy button', type: 'toggle', fallback: false },
      { key: 'stickToBottom', label: 'Auto-scroll to bottom', type: 'toggle', fallback: true }
    ],
    accessibility: [
      { key: 'highContrast', label: 'High contrast override', type: 'toggle', fallback: false },
      { key: 'reduceMotion', label: 'Reduce motion', type: 'toggle', fallback: false },
      { key: 'focusRingWidth', label: 'Focus ring width (px)', type: 'range', min: 1, max: 4, step: 1, fallback: 2 }
    ],
    keyboard: [
      { key: 'shortcuts', label: 'Shortcuts reference', type: 'info', value: 'Cmd/Ctrl+K palette, Cmd/Ctrl+B sidebar, Cmd/Ctrl+J new chat, Cmd/Ctrl+N engagement, Cmd/Ctrl+, settings, Cmd/Ctrl+Y YOLO, Esc close modal' }
    ]
  };

  const isSearching = $derived(search.trim().length > 0);

  const searchGroups = $derived.by(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase();
    return categories
      .map(cat => ({
        ...cat,
        items: (controls[cat.id] || []).filter(c => c.label.toLowerCase().includes(q))
      }))
      .filter(g => g.items.length > 0);
  });

  const activeGroups = $derived.by(() => {
    if (isSearching) return searchGroups;
    const cat = categories.find(c => c.id === activeTab);
    return [{ id: activeTab, label: cat?.label ?? activeTab, items: controls[activeTab] || [] }];
  });

  function parseShortcuts(raw) {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }

  function rangeFill(ctrl) {
    const val = get(ctrl.key, ctrl.fallback);
    const pct = ((val - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
    return `${pct}%`;
  }

  function closePanel() {
    open = false;
    search = '';
  }

  $effect(() => {
    if (open) loadProviders();
  });

  $effect(() => {
    document.documentElement.classList.toggle('high-contrast', get('highContrast', false));
    document.documentElement.classList.toggle('scanlines', get('scanlines', false));
    if (get('reduceMotion', false)) {
      document.documentElement.classList.add('prefers-reduced-motion');
    }
  });
</script>

{#snippet controlRow(ctrl)}
  {#if ctrl.type === 'info'}
    <div class="control-row shortcuts-row">
      <span class="control-label">{ctrl.label}</span>
      <div class="kbd-grid">
        {#each parseShortcuts(ctrl.value) as shortcut}
          <kbd class="kbd-chip">{shortcut}</kbd>
        {/each}
      </div>
    </div>
  {:else}
    <div class="control-row">
      <label class="control-label" for={ctrl.type === 'range' ? `setting-${ctrl.key}` : undefined}>{ctrl.label}</label>
      {#if ctrl.type === 'toggle'}
        <button
          id="setting-{ctrl.key}"
          class="switch"
          class:on={get(ctrl.key, ctrl.fallback)}
          onclick={() => set(ctrl.key, !get(ctrl.key, ctrl.fallback))}
          role="switch"
          aria-checked={get(ctrl.key, ctrl.fallback)}
          aria-label={ctrl.label}
        >
          <span class="switch-track">
            <span class="switch-thumb"></span>
          </span>
        </button>
      {:else if ctrl.type === 'range'}
        <div class="slider-wrap">
          <input
            id="setting-{ctrl.key}"
            class="slider"
            type="range"
            min={ctrl.min}
            max={ctrl.max}
            step={ctrl.step}
            value={get(ctrl.key, ctrl.fallback)}
            style="--fill: {rangeFill(ctrl)}"
            oninput={(e) => set(ctrl.key, Number(e.currentTarget.value))}
            aria-valuemin={ctrl.min}
            aria-valuemax={ctrl.max}
            aria-valuenow={get(ctrl.key, ctrl.fallback)}
          />
          <span class="value-badge">{get(ctrl.key, ctrl.fallback)}</span>
        </div>
      {/if}
    </div>
  {/if}
{/snippet}

{#if open}
<div class="overlay" onclick={closePanel} role="presentation">
  <div class="sheet" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <header class="titlebar">
      <div class="traffic-lights" role="toolbar" aria-label="Window controls">
        <button class="dot close-dot" onclick={closePanel} aria-label="Close settings" type="button"></button>
        <span class="dot minimize-dot" aria-hidden="true"></span>
        <span class="dot maximize-dot" aria-hidden="true"></span>
      </div>
      <h1 id="settings-title" class="titlebar-label">Settings</h1>
      <div class="titlebar-spacer" aria-hidden="true"></div>
    </header>

    <div class="body">
      <aside class="sidebar">
        <div class="sidebar-search">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
          </svg>
          <input
            class="search-input"
            type="search"
            placeholder="Search settings…"
            bind:value={search}
            aria-label="Search settings"
          />
        </div>

        <nav class="categories" role="tablist" aria-label="Settings categories">
          {#each categories as cat}
            <button
              role="tab"
              class="cat-btn"
              class:selected={activeTab === cat.id && !isSearching}
              aria-selected={activeTab === cat.id && !isSearching}
              onclick={() => { activeTab = cat.id; search = ''; }}
            >
              <span class="cat-icon" aria-hidden="true">
                {#if cat.id === 'appearance'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                {:else if cat.id === 'typography'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                {:else if cat.id === 'motion'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 12c2-4 4-6 8-6s6 2 8 6-4 6-8 6-6-2-8-6z"/></svg>
                {:else if cat.id === 'terminal'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                {:else if cat.id === 'chat'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                {:else if cat.id === 'accessibility'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="4" r="2"/><path d="M7 8h10M12 6v8M8 20l4-8 4 8"/></svg>
                {:else}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h8M8 16h5"/></svg>
                {/if}
              </span>
              <span class="cat-label">{cat.label}</span>
            </button>
          {/each}
        </nav>
      </aside>

      <div class="content" role="tabpanel">
        {#if isSearching && searchGroups.length === 0}
          <div class="empty-state">
            <p>No matching settings for “{search}”</p>
          </div>
        {:else}
          <AnimatePresence list={[{ key: isSearching ? 'search' : activeTab }]} let:item>
            <Motion
              let:motion
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div use:motion class="content-panel">
                {#each activeGroups as group}
                  {#if isSearching}
                    <h2 class="search-group-header">{group.label}</h2>
                  {/if}
                  <section class="settings-section">
                    {#if !isSearching}
                      <header class="section-header">{group.label}</header>
                    {/if}
                    <div class="section-body">
                      {#each group.items as ctrl}
                        {@render controlRow(ctrl)}
                      {/each}
                    </div>
                  </section>
                {/each}
              </div>
            </Motion>
          </AnimatePresence>
        {/if}
      </div>
    </div>

    <footer class="sheet-footer">
      {#if loading}
        <span class="footer-hint">Loading providers…</span>
      {:else if providers.length}
        <span class="footer-hint">{providers.length} provider{providers.length === 1 ? '' : 's'} resolved</span>
      {/if}
      <button class="danger reset-btn" onclick={resetDefaults}>Reset to defaults</button>
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
    place-items: center;
    z-index: 60;
    animation: overlay-in 220ms var(--spring-panel) both;
  }

  .sheet {
    width: 720px;
    height: 520px;
    max-width: 92vw;
    max-height: 88vh;
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    box-shadow:
      0 28px 80px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(40px) saturate(1.3);
    -webkit-backdrop-filter: blur(40px) saturate(1.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(8px);
    animation: sheet-in 320ms var(--spring-panel) both;
  }

  .titlebar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: 44px;
    padding: 0 14px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
    border-bottom: 1px solid var(--glass-border);
    flex-shrink: 0;
  }

  .traffic-lights {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    flex-shrink: 0;
  }

  .close-dot {
    background: #ff5f57;
    cursor: pointer;
    transition: transform 180ms var(--spring-control), filter 120ms ease;
  }

  .close-dot:hover {
    filter: brightness(1.08);
    transform: scale(1.08);
  }

  .close-dot:active {
    transform: scale(0.94);
  }

  .minimize-dot { background: #febc2e; }
  .maximize-dot { background: #28c840; }

  .titlebar-label {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .titlebar-spacer {
    width: 52px;
    justify-self: end;
  }

  .body {
    display: grid;
    grid-template-columns: 200px 1fr;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.65rem;
    background: rgba(255, 255, 255, 0.02);
    border-right: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .sidebar-search {
    position: relative;
    flex-shrink: 0;
  }

  .search-icon {
    position: absolute;
    left: 0.55rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.45rem 0.6rem 0.45rem 1.85rem;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
  }

  .categories {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .cat-btn {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    padding: 0.42rem 0.65rem;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background 180ms var(--spring-control),
      color 120ms var(--spring-control),
      box-shadow 180ms var(--spring-control);
  }

  .cat-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  .cat-btn.selected {
    background: var(--accent-12);
    color: var(--text-primary);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .cat-icon {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.85;
  }

  .cat-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content {
    padding: 0.85rem 1rem 1rem;
    overflow-y: auto;
    min-height: 0;
    position: relative;
  }

  .content-panel {
    min-height: 100%;
  }

  .search-group-header {
    margin: 0.75rem 0 0.35rem;
    padding: 0 0.15rem;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .search-group-header:first-child {
    margin-top: 0;
  }

  .settings-section {
    margin-bottom: 0.85rem;
  }

  .section-header {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 0.35rem 0.65rem;
    margin-bottom: 0.35rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    letter-spacing: -0.01em;
  }

  .section-body {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    overflow: hidden;
  }

  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.55rem 0.75rem;
    min-height: 44px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .control-row:last-child {
    border-bottom: none;
  }

  .control-label {
    font-size: 13px;
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
  }

  .shortcuts-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.75rem;
  }

  .kbd-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    width: 100%;
  }

  .kbd-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.28rem 0.55rem;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-badge);
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.35),
      0 1px 0 rgba(255, 255, 255, 0.04);
    white-space: nowrap;
  }

  /* macOS-style switch */
  .switch {
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .switch-track {
    display: block;
    width: 44px;
    height: 26px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    transition:
      background 220ms var(--spring-control),
      border-color 180ms var(--spring-control);
  }

  .switch:focus-visible .switch-track {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .switch.on .switch-track {
    background: var(--accent);
    border-color: var(--accent);
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    transition: transform 280ms var(--spring-control);
  }

  .switch.on .switch-thumb {
    transform: translateX(18px);
  }

  .switch:active .switch-thumb {
    width: 22px;
  }

  .switch.on:active .switch-thumb {
    transform: translateX(16px);
  }

  /* Styled slider */
  .slider-wrap {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 140px;
    height: 4px;
    border: none;
    border-radius: 999px;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(
      to right,
      var(--accent) 0%,
      var(--accent) var(--fill),
      rgba(255, 255, 255, 0.12) var(--fill),
      rgba(255, 255, 255, 0.12) 100%
    );
  }

  .slider::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
  }

  .slider::-moz-range-progress {
    height: 4px;
    border-radius: 999px;
    background: var(--accent);
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    margin-top: -6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    transition: transform 180ms var(--spring-control);
  }

  .slider:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  .slider:active::-webkit-slider-thumb {
    transform: scale(1.12);
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  }

  .value-badge {
    min-width: 36px;
    padding: 0.15rem 0.4rem;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    text-align: center;
    background: var(--accent-8);
    border: 1px solid var(--accent-20);
    border-radius: var(--radius-badge);
  }

  .empty-state {
    display: grid;
    place-items: center;
    height: 100%;
    min-height: 200px;
    color: var(--text-tertiary);
    font-size: 13px;
  }

  .sheet-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0.85rem;
    border-top: 1px solid var(--glass-border);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .footer-hint {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .reset-btn {
    margin-left: auto;
    font-size: 12px;
    padding: 0.35rem 0.7rem;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes sheet-in {
    from {
      opacity: 0;
      transform: translateY(28px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(8px) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .sheet,
    .switch-track,
    .switch-thumb,
    .slider::-webkit-slider-thumb,
    .close-dot {
      animation: none !important;
      transition: none !important;
    }

    .sheet {
      transform: translateY(8px);
    }
  }

  @media (max-width: 640px) {
    .sheet {
      width: 100%;
      height: min(520px, 88vh);
    }

    .body {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .sidebar {
      border-right: none;
      border-bottom: 1px solid var(--glass-border);
    }

    .categories {
      flex-direction: row;
      overflow-x: auto;
    }

    .cat-btn {
      flex-shrink: 0;
    }
  }
</style>
