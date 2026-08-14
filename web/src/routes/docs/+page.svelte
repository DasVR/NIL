<main class="docs">
  <nav><a href="/">Finn</a> / Docs</nav>
  <h1>Getting started</h1>
  <p>Finn is a local pentest workstation. Use it only against systems you are authorized to test.</p>

  <h2>Install</h2>
  <pre><code>pip install -e .
cp .env.example .env
finn api</code></pre>

  <p>In another terminal:</p>
  <pre><code>finn tui
# or
cd web && npm install && npm run dev</code></pre>

  <h2>Providers</h2>
  <p>
    Keys live in <code>~/.finn-pentest/providers.json</code> and expand
    <code>${'{'}DEEPSEEK_API_KEY{'}'}</code> from the environment. Empty keys are skipped.
  </p>

  <h2>Docker</h2>
  <p>
    Tool commands run inside a per-engagement container. Install Docker Desktop / Engine
    before creating a sandbox. The default image is Debian slim with nmap.
  </p>

  <h2>YOLO</h2>
  <p>
    YOLO bypasses the approval gate for that engagement only. Commands are still sandboxed
    and logged. Dangerous-classified tools emit a warning. Turn it off with Ctrl+Y or the
    status-bar toggle. You own the consequences.
  </p>

  <p><a href="/app">Open the app →</a></p>
</main>

<style>
  .docs { max-width: 760px; margin: 0 auto; padding: 2rem 1.25rem 4rem; line-height: 1.55; }
  pre { background: var(--navy); padding: 1rem; border-radius: 8px; overflow: auto; }
</style>
