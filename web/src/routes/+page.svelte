<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      goto('/app');
    }
  });
</script>

<main class="landing">
  <nav>
    <strong>Finn</strong>
    <div class="links">
      <a href="/docs">Docs</a>
      <a href="/download">Download</a>
      <a href="/app">Open the app</a>
    </div>
  </nav>

  <section class="hero">
    <p class="eyebrow">Authorized pentest workstation</p>
    <h1>AI copilot. Your machine. Your sandboxes.</h1>
    <p class="lede">
      Dual-interface pentest harness: terminal TUI, native desktop, and a local website.
      AI proposes, you approve. YOLO when you say so. Data never leaves disk unless you pick a cloud model.
    </p>
    <div class="cta">
      <button class="primary" onclick={() => goto('/app')}>Open the app</button>
      <a class="btn" href="/download">Download</a>
    </div>
  </section>

  <section class="grid">
    <article>
      <h3>Three faces, one backend</h3>
      <p>Textual TUI, Tauri desktop, and this browser UI all talk to FastAPI on localhost:8766.</p>
    </article>
    <article>
      <h3>Approval gate + YOLO</h3>
      <p>Every tool command is reviewed by default. Flip YOLO per engagement to auto-run still-sandboxed, still-logged commands.</p>
    </article>
    <article>
      <h3>BYOM + auto-rotate</h3>
      <p>DeepSeek, Grok, Kimi, Ollama, or any OpenAI-compatible endpoint. Hit a rate limit? Fail over silently.</p>
    </article>
    <article>
      <h3>Per-engagement Docker</h3>
      <p>Isolation for cleanliness, not a hypervisor jail. Nuke a sandbox without touching the next client.</p>
    </article>
  </section>
</main>

<style>
  .landing { max-width: 980px; margin: 0 auto; padding: 1.5rem; }
  nav { display: flex; justify-content: space-between; align-items: center; }
  .links { display: flex; gap: 1.2rem; }
  .hero { padding: 4rem 0 2rem; }
  .eyebrow { color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; }
  h1 { font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.1; margin: 0.4rem 0 1rem; }
  .lede { color: #b0b0b0; max-width: 640px; line-height: 1.5; }
  .cta { display: flex; gap: 0.8rem; margin-top: 1.5rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; padding: 2rem 0 4rem; }
  article { background: var(--navy); padding: 1.1rem; border-radius: 10px; border: 1px solid #22223a; }
  h3 { margin-top: 0; color: var(--accent); }
</style>
