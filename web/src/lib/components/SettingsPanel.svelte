<script lang="ts">
  import { getProviders, type ProviderInfo } from '$lib/api';
  import { appState } from '$lib/stores.svelte';

  // Props
  export let open = $state(false);

  // Local state
  let providers = $state<ProviderInfo[]>([]);
  let selectedModel = $state(appState.model);
  let loading = $state(false);

  async function loadProviders() {
    loading = true;
    try {
      const res = await getProviders();
      providers = res.resolved || [];
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      loading = false;
    }
  }

  function selectModel(name: string, model: string) {
    selectedModel = `${name}/${model}`;
    appState.model = selectedModel;
  }

  function close() {
    open = false;
  }

  $effect(() => {
    if (open) loadProviders();
  });
</script>

{#if open}
<div class="settings-overlay" onclick={close}>
  <div class="settings-panel" onclick={(e) => e.stopPropagation()}>
    <div class="settings-header">
      <h2>⚙️ Settings</h2>
      <button class="close-btn" onclick={close}>✕</button>
    </div>

    <div class="settings-body">
      <!-- Mode Selection -->
      <div class="section">
        <h3>🎯 Mode</h3>
        <div class="mode-grid">
          {#each ['hunt', 'chat', 'code', 'report'] as mode}
            <button
              class="mode-btn {appState.mode === mode ? 'active' : ''}"
              onclick={() => appState.mode = mode as typeof appState.mode}
            >
              {mode.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>

      <!-- Model Selection -->
      <div class="section">
        <h3>🧠 Model</h3>
        {#if loading}
          <div class="loading">Loading providers...␤</div>
        {:else}
          <div class="provider-list">
            {#each providers as provider}
              <button
                class="provider-btn {selectedModel === `${provider.name}/${provider.model}` ? 'active' : ''}"
                onclick={() => selectModel(provider.name, provider.model)}
              >
                <span class="provider-name">{provider.display_name}</span>
                <span class="provider-meta">
                  {#if provider.supports_streaming}<span class="badge">stream</span>{/if}
                  {#if !provider.enabled}<span class="badge disabled">offline</span>{/if}
                </span>
              </button>
            {/each}
            <button
              class="provider-btn {selectedModel === 'auto' ? 'active' : ''}"
              onclick={() => selectModel('auto', '')}
            >
              <span class="provider-name">🎲 Auto (Best Available)</span>
            </button>
          </div>
        {/if}
      </div>

      <!-- YOLO Toggle -->
      <div class="section">
        <h3>🔥 Safety</h3>
        <div class="toggle-row">
          <span class="toggle-label">YOLO Mode</span>
          <button
            class="toggle {appState.yolo ? 'on' : 'off'}"
            onclick={() => appState.toggleYolo()}
          >
            {appState.yolo ? 'ON' : 'OFF'}
          </button>
        </div>
        <p class="hint">
          {#if appState.yolo}
            ⚠️ Commands execute immediately. Use with caution.
          {:else}
            ✅ All commands require manual approval before execution.
          {/if}
        </p>
      </div>

      <!-- Visual Effects -->
      <div class="section">
        <h3>👁️ Visual Effects</h3>
        <div class="toggle-row">
          <span class="toggle-label">Scanlines</span>
          <button
            class="toggle {appState.scanlines ? 'on' : 'off'}"
            onclick={() => appState.scanlines = !appState.scanlines}
          >
            {appState.scanlines ? 'ON' : 'OFF'}
          </button>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Noise Overlay</span>
          <button
            class="toggle {appState.paletteOpen ? 'on' : 'off'}"
            onclick={() => appState.paletteOpen = !appState.paletteOpen}
          >
            {appState.paletteOpen ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .settings-panel {
    background: #0a0a0c;
    border: 1px solid rgba(0, 217, 146, 0.2);
    border-radius: 16px;
    width: 90%;
    max-width: 480px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 217, 146, 0.1);
  }

  .settings-header h2 {
    margin: 0;
    font-size: 16px;
    color: #00d992;
    font-family: 'JetBrains Mono', monospace;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    transition: color 0.2s;
  }
  .close-btn:hover { color: #00d992; }

  .settings-body {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section h3 {
    margin: 0 0 0.75rem 0;
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'JetBrains Mono', monospace;
  }

  .mode-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .mode-btn {
    background: rgba(0, 217, 146, 0.05);
    border: 1px solid rgba(0, 217, 146, 0.15);
    color: #888;
    padding: 0.5rem;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mode-btn:hover {
    border-color: rgba(0, 217, 146, 0.3);
    color: #ccc;
  }
  .mode-btn.active {
    background: rgba(0, 217, 146, 0.15);
    border-color: rgba(0, 217, 146, 0.4);
    color: #00d992;
  }

  .provider-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .provider-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 217, 146, 0.03);
    border: 1px solid rgba(0, 217, 146, 0.1);
    color: #ccc;
    padding: 0.625rem 0.75rem;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  .provider-btn:hover {
    border-color: rgba(0, 217, 146, 0.25);
    background: rgba(0, 217, 146, 0.06);
  }
  .provider-btn.active {
    border-color: rgba(0, 217, 146, 0.4);
    background: rgba(0, 217, 146, 0.1);
    color: #00d992;
  }

  .provider-name { flex: 1; }
  .provider-meta { display: flex; gap: 0.25rem; }

  .badge {
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(0, 217, 146, 0.1);
    color: #00d992;
  }
  .badge.disabled {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
  }

  .toggle-label {
    font-size: 13px;
    color: #ccc;
    font-family: 'JetBrains Mono', monospace;
  }

  .toggle {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.2s;
    min-width: 60px;
  }
  .toggle.on {
    background: rgba(0, 217, 146, 0.15);
    border-color: rgba(0, 217, 146, 0.4);
    color: #00d992;
  }
  .toggle.off {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
    color: #666;
  }

  .hint {
    margin: 0.5rem 0 0 0;
    font-size: 11px;
    color: #666;
    line-height: 1.5;
  }

  .loading {
    color: #666;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    padding: 1rem;
    text-align: center;
  }
</style>