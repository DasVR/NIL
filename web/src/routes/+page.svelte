<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LiquidMetal from '$lib/components/LiquidMetal.svelte';
  import DitherOverlay from '$lib/components/DitherOverlay.svelte';

  onMount(() => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      goto('/app');
    }
  });

  const terminalSnippet = `$ finn api --port 8766
INFO  Finn API listening on http://127.0.0.1:8766
$ finn chat --engagement acme-corp --mode hunt
> Scan in-scope targets and propose nmap commands
Finn  Proposed: nmap -sV -sC 10.10.10.0/24
       [Approve] [Reject] [Edit]
$ finn yolo on acme-corp
YOLO enabled — auto-run still sandboxed, still logged`;
</script>

<svelte:head>
  <title>Finn Pentest Harness</title>
</svelte:head>

<DitherOverlay type="grain" intensity={0.018} animate={true} />

<main class="landing">
  <nav class="top-nav">
    <a class="brand" href="/">
      <span class="logo">F</span>
      <span>Finn</span>
    </a>
    <div class="nav-links">
      <a href="/docs">Read the Docs</a>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      <button class="primary nav-cta" type="button" onclick={() => goto('/app')}>Open Workstation</button>
    </div>
  </nav>

  <section class="hero liquid-glass">
    <div class="hero-bg">
      <LiquidMetal intensity={0.18} speed={0.6} interactive={false} />
    </div>
    <div class="hero-content">
      <p class="eyebrow">Authorized pentest workstation</p>
      <h1>Local-first AI for offensive security work</h1>
      <p class="lede">
        Terminal TUI, native desktop, and this browser UI share one FastAPI backend.
        Finn proposes commands — you approve them. YOLO when you trust the scope.
        Data stays on disk unless you choose a cloud model.
      </p>
      <div class="cta-row">
        <button class="primary" type="button" onclick={() => goto('/app')}>Open Workstation</button>
        <a class="btn secondary" href="/docs">Read the Docs</a>
        <a class="btn ghost" href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    </div>
  </section>

  <section class="demo-section">
    <div class="demo-grid">
      <div class="terminal-window">
        <div class="term-chrome">
          <span class="term-dot red"></span>
          <span class="term-dot yellow"></span>
          <span class="term-dot green"></span>
          <span class="term-title">finn — zsh</span>
        </div>
        <pre class="term-body"><code>{terminalSnippet}</code></pre>
      </div>

      <div class="feature-stack">
        <article class="feature-card">
          <h3>Approval gate</h3>
          <p>Every shell command passes through review. Approve, reject, or edit before execution inside the engagement sandbox.</p>
        </article>
        <article class="feature-card">
          <h3>Per-engagement isolation</h3>
          <p>Separate Docker sandboxes, findings, notes, and scope per client. Nuke one without touching the next.</p>
        </article>
        <article class="feature-card">
          <h3>Bring your own model</h3>
          <p>Ollama, DeepSeek, Grok, Kimi, or any OpenAI-compatible endpoint. Auto-rotate on rate limits.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="interfaces">
    <h2>Three interfaces, one backend</h2>
    <div class="iface-grid">
      <article>
        <h4>Textual TUI</h4>
        <p>Keyboard-driven terminal UI for SSH sessions and headless boxes.</p>
      </article>
      <article>
        <h4>Tauri desktop</h4>
        <p>Native window with traffic-light chrome and offline-capable shell.</p>
      </article>
      <article>
        <h4>Browser workstation</h4>
        <p>Chat, findings, tools, and terminal panes in a single layout.</p>
      </article>
    </div>
  </section>

  <footer class="landing-footer">
    <span>Finn Pentest Harness v0.3.0</span>
    <div class="footer-links">
      <a href="/download">Download desktop build</a>
      <a href="/docs">Documentation</a>
    </div>
  </footer>
</main>

<style>
  .landing {
    min-height: 100vh;
    min-height: 100dvh;
    max-width: 1040px;
    margin: 0 auto;
    padding: 1rem 1.25rem 3rem;
    overflow-x: hidden;
  }

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 0.5rem 0 1.5rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
  }

  .brand:hover {
    text-decoration: none;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--accent);
    color: var(--abyss);
    font-weight: 800;
    font-size: 14px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  .nav-links a {
    color: var(--text-secondary);
    font-size: 13px;
    text-decoration: none;
  }

  .nav-links a:hover {
    color: var(--accent);
    text-decoration: none;
  }

  .nav-cta {
    min-height: 44px;
    font-size: 13px;
  }

  .hero {
    position: relative;
    padding: 2.5rem 1.75rem;
    margin-bottom: 2.5rem;
    min-height: 320px;
    display: flex;
    align-items: center;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    opacity: 0.55;
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 620px;
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  h1 {
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    line-height: 1.12;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }

  .lede {
    margin: 0 0 1.5rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 15px;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .btn.secondary {
    background: var(--glass);
    color: var(--text-primary);
  }

  .btn.ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-secondary);
  }

  .btn.ghost:hover {
    color: var(--accent);
    background: var(--accent-8);
    border-color: var(--accent-20);
  }

  .demo-section {
    margin-bottom: 2.5rem;
  }

  .demo-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 1.25rem;
    align-items: start;
  }

  .terminal-window {
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
    box-shadow: var(--elevation-1);
  }

  .term-chrome {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.55rem 0.75rem;
    background: var(--abyss-2);
    border-bottom: 1px solid var(--glass-border);
  }

  .term-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .term-dot.red { background: #ff5f57; }
  .term-dot.yellow { background: #febc2e; }
  .term-dot.green { background: #28c840; }

  .term-title {
    margin-left: 0.5rem;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .term-body {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-secondary);
    background: var(--abyss);
  }

  .term-body code {
    white-space: pre;
  }

  .feature-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .feature-card {
    padding: 1rem 1.1rem;
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-control);
  }

  .feature-card h3 {
    margin: 0 0 0.35rem;
    font-size: 14px;
    color: var(--text-primary);
  }

  .feature-card p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .interfaces {
    margin-bottom: 2rem;
  }

  .interfaces h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--text-primary);
  }

  .iface-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .iface-grid article {
    padding: 0.85rem 1rem;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-control);
  }

  .iface-grid h4 {
    margin: 0 0 0.35rem;
    font-size: 13px;
    color: var(--accent);
  }

  .iface-grid p {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.45;
  }

  .landing-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border);
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .footer-links {
    display: flex;
    gap: 1rem;
  }

  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
  }

  .footer-links a:hover {
    color: var(--accent);
  }

  @media (max-width: 768px) {
    .demo-grid {
      grid-template-columns: 1fr;
    }

    .nav-links {
      width: 100%;
      justify-content: flex-start;
    }

    .hero {
      padding: 1.75rem 1.25rem;
      min-height: 280px;
    }

    .term-body {
      font-size: 11px;
    }
  }

  @media (max-width: 320px) {
    .landing {
      padding: 0.75rem;
    }

    .cta-row {
      flex-direction: column;
    }

    .cta-row button,
    .cta-row a {
      width: 100%;
      text-align: center;
    }
  }
</style>
