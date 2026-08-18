<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, savePrefs } from '$lib/stores.svelte';
  import { getApiBase, getApiKey, setApiBase, setApiKey, apiGet, apiPut } from '$lib/api';
  import { APP_TAG } from '$lib/version';
  import { SHORTCUT_HELP } from '$lib/keymap';

  type Tab = 'general' | 'appearance' | 'ai' | 'api' | 'keyboard';
  let tab = $state<Tab>('general');

  let apiBase = $state(getApiBase());
  let apiKey = $state(getApiKey());
  let providers = $state<{ priority: Array<{ name: string; model: string; base_url: string; api_key?: string }> }>({
    priority: []
  });
  let newName = $state('');
  let newBase = $state('');
  let newKey = $state('');
  let newModel = $state('');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'ai', label: 'AI' },
    { id: 'api', label: 'API' },
    { id: 'keyboard', label: 'Keyboard' }
  ];

  onMount(() => {
    apiGet('/v1/providers')
      .then((data) => {
        providers = data.config || { priority: [] };
      })
      .catch(() => {});
  });

  function persistApi() {
    setApiBase(apiBase);
    setApiKey(apiKey);
    void appState.refresh();
  }

  async function saveProviders() {
    await apiPut('/v1/providers', providers);
    await appState.refresh();
  }

  function addProvider() {
    if (!newName.trim() || !newBase.trim()) return;
    providers = {
      ...providers,
      priority: [
        ...(providers.priority || []),
        { name: newName.trim(), base_url: newBase.trim(), api_key: newKey, model: newModel }
      ]
    };
    newName = newBase = newKey = newModel = '';
    void saveProviders();
  }

  function removeProvider(i: number) {
    providers = {
      ...providers,
      priority: (providers.priority || []).filter((_, idx) => idx !== i)
    };
    void saveProviders();
  }

  function onGrain() {
    appState.grain = appState.prefs.grain;
    savePrefs();
  }

  function onScan() {
    appState.scanlines = appState.prefs.scanlines;
    savePrefs();
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <button class="backdrop" type="button" aria-label="Close settings" onclick={() => (appState.settingsOpen = false)}></button>
  <div class="sheet">
    <aside>
      <h2 id="settings-title">Settings</h2>
      {#each tabs as t}
        <button type="button" class:on={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
      {/each}
      <p class="ver">{APP_TAG}</p>
    </aside>
    <section>
      {#if tab === 'general'}
        <h3>General</h3>
        <label class="row">
          <span>Confirm YOLO mode</span>
          <input type="checkbox" bind:checked={appState.prefs.confirmYolo} onchange={savePrefs} />
        </label>
        <label class="row">
          <span>Auto-approve on YOLO</span>
          <input type="checkbox" bind:checked={appState.prefs.autoApproveOnYolo} onchange={savePrefs} />
        </label>
        <p class="hint">YOLO still requires an explicit toggle. Auto-approve does not skip the HUD.</p>
      {:else if tab === 'appearance'}
        <h3>Appearance</h3>
        <label class="row">
          <span>Theme</span>
          <select bind:value={appState.prefs.theme} onchange={savePrefs}>
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label class="row">
          <span>Accent</span>
          <select bind:value={appState.prefs.accent} onchange={savePrefs}>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="teal">Teal</option>
            <option value="amber">Amber</option>
          </select>
        </label>
        <label class="row">
          <span>Reduced motion</span>
          <select bind:value={appState.prefs.reducedMotion} onchange={savePrefs}>
            <option value="system">System</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label class="row">
          <span>Film grain</span>
          <input type="checkbox" bind:checked={appState.prefs.grain} onchange={onGrain} />
        </label>
        <label class="row">
          <span>Scanlines</span>
          <input type="checkbox" bind:checked={appState.prefs.scanlines} onchange={onScan} />
        </label>
        <label class="row">
          <span>UI sounds</span>
          <input type="checkbox" bind:checked={appState.prefs.sounds} onchange={() => { appState.sounds = appState.prefs.sounds; savePrefs(); }} />
        </label>
        <p class="hint">Grain is CSS, not canvas. Scanlines are opt-in. Titlebar metal is one WebGL instance.</p>
      {:else if tab === 'ai'}
        <h3>AI</h3>
        <label class="row">
          <span>Streaming</span>
          <input type="checkbox" bind:checked={appState.prefs.streaming} onchange={savePrefs} />
        </label>
        <p class="hint">Active model: {appState.model}. Chat currently returns a complete turn from the API.</p>
      {:else if tab === 'api'}
        <h3>API</h3>
        <label class="stack">
          Base URL
          <input bind:value={apiBase} onchange={persistApi} />
        </label>
        <label class="stack">
          API key
          <input type="password" bind:value={apiKey} onchange={persistApi} />
        </label>
        <h4>Providers</h4>
        {#each providers.priority || [] as p, i}
          <div class="prov">
            <span>{p.name}</span>
            <code>{p.model || p.base_url}</code>
            <button type="button" onclick={() => removeProvider(i)}>Remove</button>
          </div>
        {/each}
        <div class="add">
          <input placeholder="Name" bind:value={newName} />
          <input placeholder="Base URL" bind:value={newBase} />
          <input placeholder="Key" bind:value={newKey} />
          <input placeholder="Model" bind:value={newModel} />
          <button type="button" onclick={addProvider}>Add</button>
        </div>
      {:else if tab === 'keyboard'}
        <h3>Keyboard</h3>
        <dl>
          {#each SHORTCUT_HELP as row}
            <dt>{row.keys}</dt>
            <dd>{row.action}</dd>
          {/each}
        </dl>
      {/if}
    </section>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--abyss) 70%, transparent);
    border: 0;
    min-height: unset;
  }
  .sheet {
    position: relative;
    width: min(720px, calc(100vw - 48px));
    height: min(520px, calc(100vh - 80px));
    display: grid;
    grid-template-columns: 168px 1fr;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border-strong);
    border-radius: var(--radius-panel);
    overflow: hidden;
    box-shadow: var(--shadow-modal);
  }
  aside {
    padding: 18px 10px;
    border-right: 1px solid var(--glass-border);
    background: var(--abyss);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  h2 {
    margin: 0 8px 12px;
    font-size: 13px;
    font-weight: 600;
  }
  aside button {
    text-align: left;
    height: 28px;
    min-height: unset;
    padding: 0 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--text-dim);
    font: 12px/1 var(--font-sans);
  }
  aside button.on {
    background: var(--abyss-3);
    color: var(--text);
  }
  .ver {
    margin-top: auto;
    padding: 8px;
    font: 11px/1 var(--font-mono);
    color: var(--text-faint);
  }
  section {
    padding: 22px 24px;
    overflow: auto;
  }
  h3 { margin: 0 0 16px; font-size: 15px; font-weight: 560; }
  h4 { margin: 18px 0 8px; font-size: 12px; color: var(--text-faint); }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    gap: 12px;
    font-size: 13px;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
  input, select {
    text-transform: none;
    letter-spacing: 0;
  }
  .hint { font-size: 12px; color: var(--text-faint); margin-top: 12px; line-height: 1.45; }
  .prov, .add {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
  }
  .prov code { flex: 1; color: var(--text-faint); }
  button {
    font: 12px/1 var(--font-sans);
    height: 28px;
    min-height: unset;
    padding: 0 10px;
  }
  dl {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 8px 12px;
    font-size: 13px;
    margin: 0;
  }
  dt { font-family: var(--font-mono); color: var(--text-dim); font-size: 12px; }
  dd { margin: 0; color: var(--text); }
</style>
