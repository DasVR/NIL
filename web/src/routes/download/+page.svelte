<main class="dl">
  <nav><a href="/">Finn</a> / Download</nav>
  <h1>Run Finn locally</h1>
  <section>
    <h2>CLI + TUI</h2>
    <pre><code>pip install -e .
finn api          # backend on :8766
finn tui          # terminal workstation
finn hunt -e acme # copilot alongside your tools</code></pre>
  </section>
  <section>
    <h2>Website (this UI)</h2>
    <pre><code>cd web
npm install
npm run dev       # http://127.0.0.1:5173
# Open /app against the local API</code></pre>
  </section>
  <section>
    <h2>Desktop app</h2>
    <p>
      Tauri 2 wraps the same Svelte UI. From <code>desktop/</code> run
      <code>npm run tauri dev</code> (requires Rust). Native binaries land in
      <code>desktop/src-tauri/target/release/bundle/</code> after
      <code>npm run tauri build</code>.
    </p>
    <p>
      macOS 12+: <code>npm run tauri build -- --bundles app,dmg</code> produces
      <code>Finn Pentest Harness.app</code> and a DMG. CI on GitHub builds those
      artifacts and smoke-tests that the app process stays up after launch.
    </p>
    <p>Until a signed release is published, the browser app at <a href="/app">/app</a> is the full workstation.</p>
  </section>
</main>

<style>
  .dl { max-width: 760px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  pre { background: var(--navy); padding: 1rem; border-radius: 8px; overflow: auto; }
  section { margin: 2rem 0; }
</style>
