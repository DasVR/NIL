<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LiquidMetal from '$lib/components/LiquidMetal.svelte';
  import MarketingNav from '$lib/components/MarketingNav.svelte';
  import { APP_TAG } from '$lib/version';
  import { INSTALL_ERAS, INSTALL_OS_ORDER, INSTALL_SYSTEMS } from '$lib/os';

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
  <MarketingNav current="home" />

  <section class="hero">
    <p class="eyebrow">Authorized pentest workstation · {APP_TAG}</p>
    <h1>Terminal first.<br />Finn beside you.</h1>
    <p class="lede">
      A Space is an engagement. The block terminal is home. Finn is a glass strip you summon —
      never a chat landing page. Install is one double-click per OS. Welcome is the first Space.
    </p>
    <div class="cta-row">
      <a class="btn primary" href="/download">Download for your OS</a>
      <button class="btn" type="button" onclick={() => goto('/app')}>Open Workstation</button>
      <a class="btn ghost" href="/docs">Docs</a>
    </div>
  </section>

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

  <section class="os-row" aria-label="Installers by operating system">
    {#each INSTALL_OS_ORDER.filter((id) => id !== 'web') as id}
      {@const spec = INSTALL_SYSTEMS[id]}
      <a class="os-card" href="/download#{id}">
        <span class="label-micro">{spec.requirement}</span>
        <strong>{spec.name}</strong>
        <span class="mono">{spec.primary.file}</span>
      </a>
    {/each}
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
      <pre class="ghost-term mono">┌ scope loaded                              ok
│ 3 hosts · press ⌘K to scan
└

┌ nmap -sV -sC 10.0.1.5                    exit 0  12.4s
│ 22/tcp open  ssh     OpenSSH 8.9
│ 443/tcp open ssl/http nginx 1.22
└ [Copy] [Add to Finn] [Save as evidence]</pre>
      <aside class="ghost-insp">
        <div class="finding">CRITICAL · panel RCE</div>
        <div class="finding">HIGH · default creds</div>
      </aside>
    </div>
  </section>

  <section class="editorial">
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
  .hero { padding: 3.5rem 0 2rem; max-width: 860px; }
  .eyebrow {
    margin: 0 0 0.75rem;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  h1 {
    font-size: clamp(2.6rem, 8vw, 4.6rem);
    line-height: 0.98;
    margin: 0 0 1.25rem;
    letter-spacing: -0.055em;
    font-weight: 650;
  }
  .lede {
    margin: 0 0 1.75rem;
    color: var(--text-dim);
    line-height: 1.55;
    font-size: 18px;
    max-width: 36em;
  }
  .cta-row { display: flex; flex-wrap: wrap; gap: 0.65rem; align-items: center; }
  .cta-row .primary, .cta-row .btn { text-decoration: none; }
  .btn.ghost, a.ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-dim);
  }
  .eras {
    list-style: none;
    margin: 0 0 1.75rem;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .eras li { display: flex; gap: 10px; align-items: flex-start; }
  .eras h2 { margin: 0 0 4px; font-size: 15px; letter-spacing: -0.02em; }
  .eras p { margin: 0; font-size: 13px; color: var(--text-dim); line-height: 1.45; }
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
  .os-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 2rem;
  }
  .os-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-control);
    background: var(--abyss-2);
    color: inherit;
    text-decoration: none;
  }
  .os-card:hover { border-color: var(--green); text-decoration: none; }
  .os-card strong { font-size: 15px; }
  .os-card .mono { font-size: 11px; color: var(--text-faint); }
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
    grid-template-columns: 160px 1fr 200px;
    min-height: 280px;
    position: relative;
  }
  .ghost-side, .ghost-insp {
    padding: 10px;
    background: var(--abyss-2);
    font-size: 12px;
    color: var(--text-dim);
  }
  .ghost-side { border-right: 1px solid var(--glass-border); }
  .ghost-insp { border-left: 1px solid var(--glass-border); }
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
    grid-template-columns: 1fr 1fr;
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
    .frame-body, .editorial, .eras, .os-row { grid-template-columns: 1fr; }
    .ghost-side, .ghost-insp { display: none; }
  }
</style>
