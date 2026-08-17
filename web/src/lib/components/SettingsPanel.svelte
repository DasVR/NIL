<script>
  import { getProviders, type ProviderInfo } from '$lib/api';
  import { appState } from '$lib/stores.svelte';

  let open = $state(false);
  let providers = $state<ProviderInfo[]>([]);
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

  function filteredControls() {
    const list = controls[activeTab] || [];
    if (!search.trim()) return list;
    return list.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
  }
</script>

{#if open}
<div class="overlay" onclick={() => (open = false)} role="presentation">
  <div class="settings-panel" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <header>
      <h1 id="settings-title">Settings</h1>
      <input class="search" type="search" placeholder="Filter settings…" bind:value={search} aria-label="Filter settings" />
      <button class="close" onclick={() => (open = false)} aria-label="Close settings">✕</button>
    </header>
    <div class="body">
      <nav class="tabs" role="tablist">
        {#each categories as cat}
          <button
            role="tab"
            aria-selected={activeTab === cat.id}
            onclick={() => (activeTab = cat.id)}
          >{cat.label}</button>
        {/each}
      </nav>
      <div class="content" role="tabpanel">
        {#each filteredControls() as ctrl}
          <div class="control-row">
            <label>{ctrl.label}</label>
            {#if ctrl.type === 'toggle'}
              <button
                class="toggle"
                class:on={get(ctrl.key, ctrl.fallback)}
                onclick={() => set(ctrl.key, !get(ctrl.key, ctrl.fallback))}
                aria-pressed={get(ctrl.key, ctrl.fallback)}
              >
                <span class="thumb"></span>
              </button>
            {:else if ctrl.type === 'range'}
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={get(ctrl.key, ctrl.fallback)}
                oninput={(e) => set(ctrl.key, Number(e.target.value))}
                aria-valuemin={ctrl.min}
                aria-valuemax={ctrl.max}
                aria-valuenow={get(ctrl.key, ctrl.fallback)}
              />
              <span class="value">{get(ctrl.key, ctrl.fallback)}</span>
            {:else if ctrl.type === 'info'}
              <p class="hint">{ctrl.value}</p>
            {/if}
          </div>
        {:else}
          <div class="empty">No matching settings.</div>
        {/each}
      </div>
    </div>
    <footer>
      <button class="danger" onclick={resetDefaults}>Reset to defaults</button>
    </footer>
  </div>
</div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: grid;
    place-items: center;
    z-index: 60;
    animation: finn-fade-in 200ms var(--spring-panel) both;
  }
  .settings-panel {
    width: min(720px, 92vw);
    max-height: min(80vh, 640px);
    background: var(--glass);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(32px) saturate(1.2);
    -webkit-backdrop-filter: blur(32px) saturate(1.2);
    border-radius: var(--radius-panel);
    box-shadow: var(--shadow-panel);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--glass-border);
  }
  h1 {
    font-size: 1rem;
    margin: 0;
    font-weight: 600;
  }
  .search {
    flex: 1;
    min-width: 0;
  }
  .close {
    width: 32px;
    height: 32px;
    padding: 0;
    display: grid;
    place-items: center;
  }
  .body {
    display: grid;
    grid-template-columns: 160px 1fr;
    flex: 1;
    overflow: hidden;
  }
  .tabs {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.5rem;
    border-right: 1px solid var(--glass-border);
    overflow-y: auto;
  }
  .tabs button {
    text-align: left;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    padding: 0.5rem 0.7rem;
    border-radius: var(--radius-control);
    cursor: pointer;
    transition: background 180ms var(--spring-control), color 120ms var(--spring-control);
  }
  .tabs button[aria-selected="true"] {
    background: var(--accent-12);
    color: var(--text-primary);
    box-shadow: inset 2px 0 0 var(--accent);
  }
  .content {
    padding: 0.75rem 1rem;
    overflow-y: auto;
  }
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--glass-border);
    gap: 1rem;
    min-height: 44px;
  }
  .control-row label {
    font-size: 13px;
    color: var(--text-primary);
  }
  .hint { font-size: 12px; color: var(--text-tertiary); margin: 0; }
  .value { font-family: var(--font-mono); font-size: 12px; color: var(--accent); min-width: 28px; text-align: right; }
  .toggle {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-1);
    position: relative;
    cursor: pointer;
    padding: 0;
    transition: background 150ms var(--spring-control);
  }
  .toggle.on {
    background: var(--accent);
  }
  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 200ms var(--spring-control);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .toggle.on .thumb {
    transform: translateX(20px);
  }
  footer {
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: flex-end;
  }
  .empty { color: var(--text-tertiary); font-size: 13px; padding: 1rem 0; }

  @keyframes finn-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 640px) {
    .body { grid-template-columns: 1fr; }
    .tabs { flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--glass-border); }
  }
</style>
