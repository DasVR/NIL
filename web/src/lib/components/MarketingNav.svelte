<script lang="ts">
  import { APP_TAG } from '$lib/version';

  let { current = 'home' }: { current?: 'home' | 'docs' | 'download' } = $props();
</script>

<nav class="top-nav">
  <a class="brand" href="/">
    <span class="logo">F</span>
    <span>Finn</span>
  </a>
  <div class="nav-links">
    <a href="/docs" class:on={current === 'docs'}>Docs</a>
    <a href="/download" class:on={current === 'download'}>Download</a>
    <a href="https://github.com/DasVR/finn-pentest-harness" target="_blank" rel="noopener noreferrer">GitHub</a>
    {#if current !== 'home'}
      <a class="btn ghost" href="/">{APP_TAG}</a>
    {/if}
    <a class="btn primary nav-cta" href="/app">Open Workstation</a>
  </div>
</nav>

<style>
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
  .nav-links a.on { color: var(--green); }
  .nav-cta { font-size: 13px; text-decoration: none; }
  .btn.ghost {
    background: transparent;
    border: 0;
    color: var(--text-faint);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 0;
    min-height: unset;
  }
</style>
