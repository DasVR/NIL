<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';

  type Privilege = 'user' | 'admin';
  type Channel = 'online' | 'offline';
  type Sandbox = 'host' | 'docker';

  let step = $state(0);
  let privilege = $state<Privilege>('user');
  let channel = $state<Channel>('online');
  let sandbox = $state<Sandbox>('host');
  let features = $state({ ai: true, tui: true, bundled_api: true, docker: false });
  let acceptTos = $state(false);
  let error = $state('');
  let busy = $state(false);

  const tos = $derived(appState.runtime?.docker_tos || '');

  const privileges: { id: Privilege; title: string; body: string }[] = [
    {
      id: 'user',
      title: 'User installer',
      body: 'No admin. Files under your home directory. Host sandbox is the default.'
    },
    {
      id: 'admin',
      title: 'Admin installer',
      body: 'System paths and optional Docker. Still launch Finn as a normal user afterward.'
    }
  ];

  const channels: { id: Channel; title: string; body: string }[] = [
    {
      id: 'online',
      title: 'Online',
      body: 'Download matching GitHub release parts for this OS (app, wheel). Builds locally only with --from-source.'
    },
    {
      id: 'offline',
      title: 'Offline',
      body: 'Use the .app / .dmg / wheel / API folder next to the installer. No network required.'
    }
  ];

  async function finish() {
    error = '';
    if (sandbox === 'docker' && !acceptTos) {
      error = 'Accept the Docker sandbox terms to continue, or pick host sandbox.';
      return;
    }
    if (sandbox === 'docker' && privilege !== 'admin') {
      error = 'Docker sandbox is an admin install. Switch to Admin, or use host sandbox.';
      return;
    }
    busy = true;
    try {
      const next = await apiPost('/v1/setup', {
        variant: sandbox === 'docker' ? 'docker' : 'bundled',
        privilege,
        channel,
        sandbox,
        features: { ...features, docker: sandbox === 'docker', bundled_api: true },
        accept_docker_tos: sandbox === 'docker' && acceptTos
      });
      appState.runtime = {
        ...next,
        sandbox_effective: next.sandbox,
        docker_available: appState.runtime?.docker_available ?? false,
        docker_tos: tos
      };
      appState.setupOpen = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Setup failed';
    } finally {
      busy = false;
    }
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="setup-title">
  <button class="backdrop" type="button" aria-label="Close setup" onclick={() => (appState.setupOpen = false)}></button>
  <div class="sheet liquid-glass">
    <header>
      <p class="label-micro">Installer</p>
      <h2 id="setup-title">Set up Finn</h2>
      <p>Same liquid-glass installer. The API always starts with the desktop app — never as a second process you have to remember.</p>
    </header>

    {#if step === 0}
      <p class="hint">Who installs, and whether this machine can reach GitHub.</p>
      <div class="cards">
        {#each privileges as v}
          <button type="button" class="card" class:on={privilege === v.id} onclick={() => { privilege = v.id; if (v.id === 'user' && sandbox === 'docker') sandbox = 'host'; }}>
            <strong>{v.title}</strong>
            <span>{v.body}</span>
          </button>
        {/each}
      </div>
      <div class="cards stacked">
        {#each channels as v}
          <button type="button" class="card" class:on={channel === v.id} onclick={() => (channel = v.id)}>
            <strong>{v.title}</strong>
            <span>{v.body}</span>
          </button>
        {/each}
      </div>
    {:else if step === 1}
      <label class="row"><span>AI / Finn agent</span><input type="checkbox" bind:checked={features.ai} /></label>
      <label class="row"><span>TUI (`finn tui`)</span><input type="checkbox" bind:checked={features.tui} /></label>
      <p class="hint">The API is always bundled and started by the app. Recorded in <code>~/.finn-pentest/runtime.json</code>.</p>
    {:else}
      <div class="cards">
        <button type="button" class="card" class:on={sandbox === 'host'} onclick={() => (sandbox = 'host')}>
          <strong>Host sandbox</strong>
          <span>Approved commands run in a per-Space folder on this machine. No Docker, no admin daemon.</span>
        </button>
        <button type="button" class="card" class:on={sandbox === 'docker'} onclick={() => { sandbox = 'docker'; privilege = 'admin'; }}>
          <strong>Docker sandbox</strong>
          <span>Per-engagement container. Requires Docker Engine and the terms below.</span>
        </button>
      </div>
      {#if sandbox === 'docker'}
        <pre class="tos mono">{tos}</pre>
        <label class="row">
          <span>I accept the Docker sandbox terms</span>
          <input type="checkbox" bind:checked={acceptTos} />
        </label>
      {/if}
    {/if}

    {#if error}<p class="err">{error}</p>{/if}

    <footer>
      <span class="dots">{step + 1} / 3</span>
      {#if step > 0}
        <button type="button" onclick={() => (step -= 1)}>Back</button>
      {/if}
      {#if step < 2}
        <button type="button" class="primary" onclick={() => (step += 1)}>Continue</button>
      {:else}
        <button type="button" class="primary" disabled={busy} onclick={() => finish()}>{busy ? 'Saving…' : 'Finish'}</button>
      {/if}
    </footer>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 85;
    display: grid;
    place-items: center;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--abyss) 72%, transparent);
    border: 0;
    min-height: unset;
  }
  .sheet {
    position: relative;
    width: min(640px, calc(100vw - 32px));
    max-height: min(640px, calc(100vh - 64px));
    overflow: auto;
    padding: 22px 22px 16px;
    border-radius: var(--radius-panel);
    z-index: 1;
  }
  header { margin-bottom: 16px; }
  h2 { margin: 4px 0 8px; font-size: 18px; }
  header p { margin: 0; color: var(--text-dim); font-size: 13px; line-height: 1.45; }
  .cards { display: grid; gap: 8px; }
  .cards.stacked { margin-top: 8px; }
  .card {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    min-height: unset;
    background: var(--abyss);
    border: 1px solid var(--glass-border);
  }
  .card.on { border-color: var(--green); background: var(--green-soft); }
  .card span { font-size: 12px; color: var(--text-dim); line-height: 1.4; }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    font-size: 13px;
  }
  .hint { font-size: 12px; color: var(--text-faint); line-height: 1.45; }
  .tos {
    max-height: 160px;
    overflow: auto;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.45;
    color: var(--text-dim);
    background: var(--abyss);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    white-space: pre-wrap;
  }
  .err { color: var(--danger); font-size: 12px; }
  footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }
  .dots { margin-right: auto; font-size: 11px; color: var(--text-faint); }
</style>
