<script lang="ts">
  import MarketingNav from '$lib/components/MarketingNav.svelte';
  import { APP_TAG } from '$lib/version';
  import { INSTALL_ERAS, INSTALL_OS_ORDER, INSTALL_SYSTEMS } from '$lib/os';
</script>

<svelte:head>
  <title>Docs — Finn Pentest Harness</title>
</svelte:head>

<main class="docs marketing">
  <MarketingNav current="docs" />

  <p class="eyebrow">Getting started · {APP_TAG}</p>
  <h1>Install, welcome, workstation</h1>
  <p>
    Finn is a local pentest workstation. Use it only against systems you are authorized to test.
    The engagement is the product — Finn sits beside the terminal. The living IA is
    <code>UX_REDESIGN.md</code>; this page is the operator path.
  </p>

  <ol class="eras">
    {#each INSTALL_ERAS as era, i}
      <li>
        <span class="n mono">{i + 1}</span>
        <div>
          <h2>{era.title}</h2>
          <p>{era.body}</p>
        </div>
      </li>
    {/each}
  </ol>

  <h2>Install by OS</h2>
  <p>Double-click <strong>Finn-Setup</strong>. No Terminal. Do not use the Python wheel zip as a Mac installer.</p>

  {#each INSTALL_OS_ORDER.filter((id) => id !== 'web') as id}
    {@const spec = INSTALL_SYSTEMS[id]}
    <h3 id={id}>{spec.name} <span class="req mono">{spec.requirement}</span></h3>
    <p><strong>{spec.primary.file}</strong> — {spec.primary.action}</p>
    {#if spec.also.length}
      <ul>
        {#each spec.also as extra}
          <li><code>{extra.file}</code> — {extra.action}</li>
        {/each}
      </ul>
    {/if}
    <ol>
      {#each spec.first_launch as step}
        <li>{step}</li>
      {/each}
    </ol>
    <p class="paths mono">User paths: {spec.paths.user}</p>
    <pre><code>{spec.headless}</code></pre>
  {/each}

  <h3 id="web">{INSTALL_SYSTEMS.web.name}</h3>
  <p>{INSTALL_SYSTEMS.web.primary.action}</p>
  <pre><code>finn tui
cd web && npm install && npm run dev</code></pre>

  <h2>Welcome</h2>
  <p>
    After Setup writes <code>~/.finn-pentest/runtime.json</code>, opening Finn is the welcome era —
    not a second installer. Name a Space, paste scope, four template rows. The first terminal block is
    <code>scope loaded · N hosts · press ⌘K to scan</code>.
  </p>
  <p>
    Browser <code>/app</code> without a native install asks only how tools run (host vs Docker), then
    the same empty Space. User vs admin and online vs offline stay in Finn Setup on disk.
  </p>

  <h2>Workstation</h2>
  <p>
    Open <a href="/app">/app</a>. English typed in <kbd>$</kbd> goes to Finn; real commands stay in the shell.
    <kbd>⌘J</kbd> opens the Finn column beside the workspace (not an overlay).
    <kbd>⌘↵</kbd> in the terminal approves a pending block; in Finn it sends the message.
    <kbd>⌘K</kbd> is the OS of the app.
  </p>

  <h2>Providers</h2>
  <p>
    Keys live in <code>~/.finn-pentest/providers.json</code> and expand
    <code>${'{'}DEEPSEEK_API_KEY{'}'}</code> from the environment. Empty keys are skipped.
    Edit them from Settings (<kbd>⌘,</kbd>), not a separate page.
  </p>

  <h2>Sandbox</h2>
  <p>
    Tools default to a <strong>host sandbox</strong>: approved commands run in a per-Space folder on this machine.
    Switch to Docker in Welcome or Settings (or
    <code>finn setup --sandbox docker --accept-docker-tos</code>) for container isolation.
    Docker uses your computer as the sandbox host and typically needs administrator rights to install Docker Desktop.
  </p>

  <h2>YOLO</h2>
  <p>
    YOLO bypasses the approval gate for that Space only. Commands are still sandboxed
    and logged. Dangerous-classified tools emit a warning. Toggle with <kbd>⌘Y</kbd>.
    You own the consequences.
  </p>

  <p class="ver">{APP_TAG}</p>
  <p><a href="/app">Open the workstation →</a></p>
</main>

<style>
  .docs {
    max-width: 760px;
    margin: 0 auto;
    padding: 1rem 1.25rem 4rem;
    line-height: 1.55;
    overflow-y: auto;
    min-height: 100vh;
  }
  .eyebrow {
    margin: 0 0 0.5rem;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  h1 { letter-spacing: -0.03em; }
  h2 { margin-top: 2rem; font-size: 16px; }
  h3 { margin-top: 1.5rem; font-size: 14px; }
  .req { color: var(--text-faint); font-weight: 400; font-size: 12px; }
  .eras {
    list-style: none;
    margin: 1.25rem 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .eras li { display: flex; gap: 10px; }
  .eras h2 { margin: 0 0 2px; }
  .eras p { margin: 0; color: var(--text-dim); font-size: 13px; }
  .n {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    font-size: 11px;
    color: var(--green);
    flex-shrink: 0;
  }
  .paths { font-size: 12px; color: var(--text-faint); }
  pre {
    background: var(--abyss-3);
    padding: 1rem;
    border-radius: 8px;
    overflow: auto;
    border: 1px solid var(--glass-border);
  }
  .ver { font-family: var(--font-mono); font-size: 12px; color: var(--text-faint); }
</style>
