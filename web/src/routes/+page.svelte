<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LiquidMetal from '$lib/components/LiquidMetal.svelte';
  import { APP_TAG } from '$lib/version';

  onMount(() => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      goto('/app');
    }
  });
</script>

<svelte:head>
  <title>Finn Pentest Harness</title>
</svelte:head>

<main class="landing marketing">
  <nav class="top-nav">
    <a class="brand" href="/">
      <span class="logo">F</span>
      <span>Finn</span>
    </a>
    <div class="nav-links">
      <a href="/docs">Docs</a>
      <a href="/download">Download</a>
      <a href="https://github.com/DasVR/finn-pentest-harness" target="_blank" rel="noopener noreferrer">GitHub</a>
      <button class="primary nav-cta" type="button" onclick={() => goto('/app')}>Open Workstation</button>
    </div>
  </nav>

  <section class="hero">
    <p class="eyebrow">Authorized pentest workstation · {APP_TAG}</p>
    <h1>The pentest workstation with an operator in the chair.</h1>
    <p class="lede">
      Engagements are Spaces. The terminal is home. Talk to Finn like a Cursor agent —
      English lands in the column beside the shell, real commands stay in `$`.
      YOLO when you trust the scope. Data stays on disk unless you choose a cloud model.
    </p>
    <div class="cta-row">
      <button class="primary" type="button" onclick={() => goto('/app')}>Open Workstation</button>
      <a class="btn" href="/download">Download</a>
      <a class="btn ghost" href="/docs">Docs</a>
    </div>
  </section>

  <section class="frame" aria-hidden="true">
    <div class="frame-chrome">
      <div class="metal"><LiquidMetal intensity={0.22} speed={0.4} interactive={false} /></div>
      <span class="space">acme-corp</span>
      <span class="host mono">10.0.1.5</span>
      <span class="mode">hunt</span>
      <span class="safe">SAFE</span>
    </div>
    <div class="frame-body">
      <aside class="ghost-side">
        <div class="row on">10.0.1.5</div>
        <div class="row">api.acme.test</div>
        <div class="row">10.0.1.0/24</div>
      </aside>
      <pre class="ghost-term mono">┌ nmap -sV -sC 10.0.1.5                    exit 0  12.4s
│ Starting Nmap 7.94 …
│ 22/tcp open  ssh     OpenSSH 8.9
│ 443/tcp open ssl/http nginx 1.22
└ [Copy] [Add to Finn] [Save as evidence]

$ Can you scan 10.0.1.0/24 for http?
› sent to Finn</pre>
      <aside class="ghost-finn">
        <div class="turn-label">You</div>
        <div class="turn-body">Can you scan 10.0.1.0/24 for http?</div>
        <div class="turn-label finn">Finn</div>
        <div class="turn-body">I’ll propose nmap against that range. Approve the card when you’re ready.</div>
      </aside>
      <aside class="ghost-insp">
        <div class="finding">CRITICAL · panel RCE</div>
        <div class="finding">HIGH · default creds</div>
      </aside>
    </div>
  </section>

  <section class="editorial">
    <article>
      <h2>Finn beside the terminal</h2>
      <p>Ask in English. Finn already has the Space, last runs, and findings — like an agent sitting on the workspace, not a chat overlay.</p>
    </article>
    <article>
      <h2>Approval gate</h2>
      <p>Every shell command is a Warp-style block with Approve / Edit / Reject. Dangerous tools stay sandboxed and logged — even in YOLO.</p>
    </article>
    <article>
      <h2>Your disk</h2>
      <p>Findings, notes, loot, and scope live per engagement on the machine. Nuke one Space without touching the next.</p>
    </article>
  </section>

  <footer class="landing-footer">
    <span>Finn Pentest Harness {APP_TAG}</span>
    <div class="footer-links">
      <a href="/download">Releases</a>
      <a href="/docs">Documentation</a>
    </div>
  </footer>
</main>

<style>
  .landing {
    min-height: 100vh;
    min-height: 100dvh;
    max-width: 1080px;
    margin: 0 auto;
    padding: 1rem 1.25rem 3rem;
    overflow-x: hidden;
    overflow-y: auto;
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
    color: var(--text);
    text-decoration: none;
  }
  .logo {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--green);
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
  .nav-links a { color: var(--text-dim); font-size: 13px; }
  .nav-cta { font-size: 13px; }
  .hero { padding: 2rem 0 1.5rem; max-width: 720px; }
  .eyebrow {
    margin: 0 0 0.75rem;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  h1 {
    font-size: clamp(2rem, 5vw, 3.1rem);
    line-height: 1.08;
    margin: 0 0 1rem;
    letter-spacing: -0.035em;
    font-weight: 620;
  }
  .lede {
    margin: 0 0 1.5rem;
    color: var(--text-dim);
    line-height: 1.6;
    font-size: 16px;
  }
  .cta-row { display: flex; flex-wrap: wrap; gap: 0.65rem; }
  .btn.ghost, a.ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-dim);
  }
  .frame {
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--abyss);
    margin: 2rem 0 2.5rem;
    box-shadow: var(--shadow-panel);
  }
  .frame-chrome {
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    border-bottom: 1px solid var(--glass-border);
    overflow: hidden;
  }
  .metal { position: absolute; inset: 0; opacity: 0.65; pointer-events: none; }
  .space { position: relative; font-weight: 600; font-size: 13px; }
  .host, .mode, .safe { position: relative; font-size: 11px; color: var(--text-dim); }
  .mode { color: var(--green); text-transform: uppercase; letter-spacing: 0.06em; }
  .safe { margin-left: auto; color: var(--green); font-weight: 600; font-size: 10px; }
  .frame-body {
    display: grid;
    grid-template-columns: 160px 1fr 200px 160px;
    min-height: 240px;
  }
  .ghost-side, .ghost-insp, .ghost-finn {
    padding: 10px;
    background: var(--abyss-2);
    font-size: 12px;
    color: var(--text-dim);
  }
  .ghost-side { border-right: 1px solid var(--glass-border); }
  .ghost-finn { border-left: 1px solid var(--glass-border); }
  .ghost-insp { border-left: 1px solid var(--glass-border); }
  .turn-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 4px;
  }
  .turn-label.finn { color: var(--green); margin-top: 10px; }
  .turn-body { font-size: 12px; line-height: 1.45; color: var(--text); margin-bottom: 8px; }
  .row { height: 28px; display: flex; align-items: center; padding: 0 8px; border-radius: 5px; }
  .row.on { background: rgba(255,255,255,0.05); box-shadow: inset 2px 0 0 var(--green); color: var(--text); }
  .ghost-term {
    margin: 0;
    padding: 14px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-dim);
    background: var(--abyss);
  }
  .finding { padding: 8px; margin-bottom: 6px; border: 1px solid var(--glass-border); border-radius: 6px; font-size: 11px; }
  .editorial {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  .editorial h2 { margin: 0 0 0.4rem; font-size: 18px; letter-spacing: -0.02em; }
  .editorial p { margin: 0; color: var(--text-dim); line-height: 1.5; font-size: 14px; }
  .landing-footer {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border);
    font-size: 12px;
    color: var(--text-faint);
  }
  .footer-links { display: flex; gap: 1rem; }
  @media (max-width: 800px) {
    .frame-body, .editorial { grid-template-columns: 1fr; }
    .ghost-side, .ghost-insp, .ghost-finn { display: none; }
  }
</style>
