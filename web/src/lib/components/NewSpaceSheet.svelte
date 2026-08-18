<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { tick } from 'svelte';

  const templates = [
    { name: 'external-pt', label: 'External pentest', scope: '10.0.0.0/24, example.com' },
    { name: 'internal-net', label: 'Internal network', scope: '192.168.1.0/24' },
    { name: 'web-app', label: 'Web application', scope: 'https://app.example.com' },
    { name: 'wireless', label: 'Wireless audit', scope: 'SSID: CorpNet' }
  ];

  let name = $state('');
  let scope = $state('');
  let error = $state('');
  let busy = $state(false);
  let nameEl: HTMLInputElement | undefined;

  $effect(() => {
    void tick().then(() => nameEl?.focus());
  });

  async function create() {
    error = '';
    const n = name.trim();
    if (!n) {
      error = 'Name the Space.';
      return;
    }
    busy = true;
    try {
      await appState.createEngagement(n, scope);
      name = '';
      scope = '';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }

  function useTemplate(t: (typeof templates)[number]) {
    name = t.name;
    scope = t.scope;
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="new-space-title">
  <button class="backdrop" type="button" aria-label="Close" onclick={() => (appState.newSpaceOpen = false)}></button>
  <div class="sheet glass-overlay">
    <header>
      <h2 id="new-space-title">New Space</h2>
      <p>An engagement is a named scope. Finn sits beside the terminal for that scope.</p>
    </header>
    <label>
      Name
      <input bind:this={nameEl} bind:value={name} placeholder="acme-corp" onkeydown={(e) => e.key === 'Enter' && create()} />
    </label>
    <label>
      Scope
      <textarea bind:value={scope} placeholder="10.0.0.0/24, app.acme.com, *.acme.internal" rows="4"></textarea>
    </label>
    <div class="templates">
      <span class="label-micro">Templates</span>
      {#each templates as t}
        <button type="button" class="tpl" onclick={() => useTemplate(t)}>
          <span>{t.label}</span>
          <span class="mono dim">{t.scope}</span>
        </button>
      {/each}
    </div>
    {#if error}<p class="err">{error}</p>{/if}
    <footer>
      <button class="ghost" type="button" onclick={() => (appState.newSpaceOpen = false)}>Cancel</button>
      <button class="primary" type="button" disabled={busy} onclick={create}>{busy ? 'Creating…' : 'Create Space'}</button>
    </footer>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: grid;
    place-items: center;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--abyss) 72%, transparent);
    border: 0;
    cursor: default;
    min-height: unset;
  }
  .sheet {
    position: relative;
    width: min(480px, calc(100vw - 48px));
    border-radius: var(--radius-panel);
    padding: 22px;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 560;
    letter-spacing: -0.02em;
  }
  header p {
    margin: 0 0 18px;
    font-size: 13px;
    color: var(--text-dim);
    line-height: 1.45;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    font-weight: 560;
    color: var(--text-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  input, textarea {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
  }
  textarea { resize: vertical; font-family: var(--font-mono); }
  .templates { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
  .tpl {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    height: auto;
    min-height: unset;
    padding: 8px 10px;
    text-align: left;
    background: var(--abyss-3);
  }
  .dim { color: var(--text-faint); font-size: 11px; }
  .err { color: var(--danger); font-size: 12px; margin: 0 0 10px; }
  footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
  button.ghost { background: transparent; min-height: 32px; }
  button.primary { min-height: 32px; }
</style>
