<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';
  import { detectHostOS, INSTALL_ERAS, systemFor, welcomeLine } from '$lib/os';

  type Sandbox = 'host' | 'docker';

  const os = detectHostOS();
  const spec = systemFor(os);

  let sandbox = $state<Sandbox>('host');
  let acceptTos = $state(false);
  let error = $state('');
  let busy = $state(false);

  const tos = $derived(appState.runtime?.docker_tos || '');

  async function applyRuntime(next: Sandbox, accept: boolean) {
    const payload = await apiPost('/v1/setup', {
      variant: next === 'docker' ? 'docker' : 'bundled',
      privilege: 'user',
      channel: 'offline',
      sandbox: next,
      features: { ai: true, tui: true, bundled_api: true, docker: next === 'docker' },
      accept_docker_tos: next === 'docker' && accept
    });
    appState.runtime = {
      ...payload,
      sandbox_effective: payload.sandbox,
      docker_available: appState.runtime?.docker_available ?? false,
      docker_tos: tos
    };
  }

  async function finish() {
    error = '';
    if (sandbox === 'docker' && !acceptTos) {
      error = 'Accept the Docker sandbox terms, or pick host sandbox.';
      return;
    }
    busy = true;
    try {
      await applyRuntime(sandbox, acceptTos);
      appState.setupOpen = false;
      appState.setupDismissed = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Welcome failed';
    } finally {
      busy = false;
    }
  }

  async function dismiss() {
    error = '';
    busy = true;
    try {
      if (!appState.runtime?.setup_complete) {
        await applyRuntime('host', false);
      }
    } catch {
      /* still close so the workstation is reachable */
    } finally {
      busy = false;
      appState.setupOpen = false;
      appState.setupDismissed = true;
    }
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
  <button class="backdrop" type="button" aria-label="Skip welcome" onclick={() => void dismiss()}></button>
  <div class="sheet liquid-glass">
    <p class="label-micro">Welcome · {spec.name}</p>
    <h2 id="welcome-title">{welcomeLine(os)}</h2>
    <p class="lede">
      The terminal is home. Finn sits beside it. This sheet is not an installer — Setup already
      chose who installs and where files come from.
    </p>

    <ol class="eras">
      {#each INSTALL_ERAS as era, i}
        <li class:on={era.id === 'welcome'}>
          <span class="n mono">{i + 1}</span>
          <span>
            <strong>{era.title}</strong>
            <span class="era-body">{era.body}</span>
          </span>
        </li>
      {/each}
    </ol>

    <p class="label-micro">How should tools run?</p>
    <div class="cards">
      <button type="button" class="card" class:on={sandbox === 'host'} onclick={() => (sandbox = 'host')}>
        <strong>Host sandbox</strong>
        <span>Approved commands run in a per-Space folder on {spec.here}. No Docker, no admin daemon.</span>
      </button>
      <button type="button" class="card" class:on={sandbox === 'docker'} onclick={() => (sandbox = 'docker')}>
        <strong>Docker sandbox</strong>
        <span>Per-engagement container. Needs Docker Engine and the terms below. Switch later in Settings if you skip this.</span>
      </button>
    </div>

    {#if sandbox === 'docker'}
      <pre class="tos mono">{tos}</pre>
      <label class="row">
        <span>I accept the Docker sandbox terms</span>
        <input type="checkbox" bind:checked={acceptTos} />
      </label>
    {/if}

    {#if error}<p class="err">{error}</p>{/if}

    <footer>
      <button type="button" class="ghost" disabled={busy} onclick={() => void dismiss()}>Skip</button>
      <button type="button" class="primary" disabled={busy} onclick={() => void finish()}>
        {busy ? 'Saving…' : 'Enter workstation'}
      </button>
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
    width: min(560px, calc(100vw - 32px));
    max-height: min(720px, calc(100vh - 48px));
    overflow: auto;
    padding: 22px 22px 16px;
    border-radius: var(--radius-panel);
    z-index: 1;
  }
  h2 {
    margin: 6px 0 8px;
    font-size: 20px;
    letter-spacing: -0.03em;
    font-weight: 600;
  }
  .lede {
    margin: 0 0 16px;
    color: var(--text-dim);
    font-size: 13px;
    line-height: 1.45;
  }
  .eras {
    list-style: none;
    margin: 0 0 18px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .eras li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 12px;
    color: var(--text-faint);
  }
  .eras li.on { color: var(--text); }
  .eras li.on strong { color: var(--green); }
  .n {
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    font-size: 10px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .eras li.on .n {
    border-color: var(--green);
    color: var(--green);
  }
  .era-body {
    display: block;
    color: var(--text-faint);
    font-size: 11px;
    line-height: 1.4;
    margin-top: 2px;
  }
  .cards { display: grid; gap: 8px; margin: 8px 0 12px; }
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
  .tos {
    max-height: 140px;
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
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  button.ghost { background: transparent; min-height: 32px; }
  button.primary { min-height: 32px; }
</style>
