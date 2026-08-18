<script>
  import { APP_TAG } from '$lib/version';
</script>

<svelte:head>
  <title>Docs — Finn Pentest Harness</title>
</svelte:head>

<main class="docs marketing">
  <nav><a href="/">Finn</a> / Docs</nav>
  <h1>Getting started</h1>
  <p>Finn is a local pentest workstation. Use it only against systems you are authorized to test. The engagement is the product — Finn sits beside the terminal.</p>

  <h2>Install</h2>
  <pre><code>pip install -e .
cp .env.example .env
finn api</code></pre>

  <p>In another terminal:</p>
  <pre><code>finn tui
# or
cd web && npm install && npm run dev</code></pre>

  <h2>Workstation</h2>
  <p>
    Open <a href="/app">/app</a>. Create a Space, paste scope, run commands from the block terminal.
    English typed in <kbd>$</kbd> goes to Finn; real commands stay in the shell.
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

  <h2>Docker</h2>
  <p>
    Tool commands run inside a per-engagement container. Install Docker Desktop / Engine
    before creating a sandbox. The default image is Debian slim with nmap.
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
    padding: 2rem 1.25rem 4rem;
    line-height: 1.55;
    overflow-y: auto;
    min-height: 100vh;
  }
  nav { font-size: 13px; color: var(--text-faint); margin-bottom: 1.5rem; }
  h1 { letter-spacing: -0.03em; }
  h2 { margin-top: 2rem; font-size: 16px; }
  pre {
    background: var(--abyss-3);
    padding: 1rem;
    border-radius: 8px;
    overflow: auto;
    border: 1px solid var(--glass-border);
  }
  .ver { font-family: var(--font-mono); font-size: 12px; color: var(--text-faint); }
</style>
