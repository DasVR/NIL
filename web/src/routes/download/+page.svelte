<script>
  import {
    fetchLatestRelease,
    fetchRecentReleases,
    formatBytes,
    formatReleaseDate,
    GITHUB_RELEASES_URL,
    GITHUB_REPO_URL
  } from '$lib/releases';
  import DitherOverlay from '$lib/components/DitherOverlay.svelte';

  let latest = $state(null);
  let history = $state([]);
  let loading = $state(true);
  let error = $state('');

  const installSnippet = `# macOS — Python 3.11+
brew install python@3.12
python3.12 -m venv .venv && source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
cp .env.example .env
finn api`;

  load();

  async function load() {
    loading = true;
    error = '';
    try {
      const [latestRelease, recent] = await Promise.all([
        fetchLatestRelease(),
        fetchRecentReleases(8)
      ]);
      latest = latestRelease;
      history = recent;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Could not load releases';
    } finally {
      loading = false;
    }
  }

  function primaryAsset(release) {
    if (!release?.assets?.length) return null;
    const order = ['.dmg', '.exe', '.appimage', '.deb', '.msi'];
    for (const ext of order) {
      const hit = release.assets.find((a) => a.name.toLowerCase().endsWith(ext));
      if (hit) return hit;
    }
    return release.assets[0];
  }
</script>

<svelte:head>
  <title>Download — Finn Pentest Harness</title>
</svelte:head>

<DitherOverlay type="grain" intensity={0.014} animate={true} />

<main class="releases-page">
  <nav class="crumb">
    <a href="/">Finn</a>
    <span>/</span>
    <span>Releases</span>
  </nav>

  <header class="hero liquid-glass">
    <p class="eyebrow">Desktop builds · CI-signed bundles</p>
    <h1>Download Finn</h1>
    <p class="lede">
      Native apps for macOS, Windows, and Linux — built by GitHub Actions on every version tag.
      The desktop shell wraps the same Svelte workstation; start <code>finn api</code> locally for scans and tools.
    </p>
    <div class="hero-actions">
      {#if latest}
        {@const asset = primaryAsset(latest)}
        {#if asset}
          <a class="btn primary" href={asset.url} download>{asset.label} · {latest.tag}</a>
        {/if}
        <a class="btn secondary" href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
          All releases on GitHub
        </a>
      {:else if !loading}
        <a class="btn primary" href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
          View releases on GitHub
        </a>
      {/if}
      <a class="btn ghost" href="/app">Open browser workstation</a>
    </div>
  </header>

  {#if loading}
    <section class="panel loading-panel" aria-busy="true">
      <div class="pulse-row"></div>
      <div class="pulse-row short"></div>
    </section>
  {:else if error}
    <section class="panel error-panel">
      <p>{error}</p>
      <button type="button" class="btn secondary" onclick={load}>Retry</button>
    </section>
  {:else if latest}
    <section class="panel latest-panel">
      <div class="panel-head">
        <div>
          <h2>{latest.name}</h2>
          <p class="meta">
            Published {formatReleaseDate(latest.publishedAt)}
            {#if latest.prerelease}
              <span class="badge warn">Pre-release</span>
            {/if}
          </p>
        </div>
        <a class="github-link" href={latest.htmlUrl} target="_blank" rel="noopener noreferrer">
          Release notes →
        </a>
      </div>

      <div class="asset-grid">
        {#each latest.assets as asset (asset.url)}
          <a class="asset-card" href={asset.url} download>
            <span class="asset-platform">{asset.platform}</span>
            <strong>{asset.label}</strong>
            <span class="asset-name">{asset.name}</span>
            <span class="asset-size">{formatBytes(asset.size)}</span>
            <span class="asset-cta">Download</span>
          </a>
        {:else}
          <p class="empty">No binaries attached yet — check back after the next tagged release.</p>
        {/each}
      </div>
    </section>
  {/if}

  {#if history.length > 1}
    <section class="panel history-panel">
      <h2>Release history</h2>
      <div class="history-list">
        {#each history as release (release.tag)}
          <article class="history-row">
            <div>
              <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer">{release.tag}</a>
              <span class="meta">{formatReleaseDate(release.publishedAt)}</span>
            </div>
            <div class="history-assets">
              {#each release.assets.slice(0, 4) as asset (asset.url)}
                <a href={asset.url} download title={asset.name}>{asset.label}</a>
              {/each}
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  <section class="panel install-panel">
    <h2>From source (API + TUI)</h2>
    <p>No desktop installer? Run the Python backend and terminal UI directly.</p>
    <pre><code>{installSnippet}</code></pre>
    <p class="hint">
      Terminal UI: <code>finn tui</code> · Browser UI:
      <code>cd web && npm install && npm run dev</code> then open <a href="/app">/app</a>.
    </p>
  </section>

  <section class="panel trigger-panel">
    <h2>Maintainers: cut a release</h2>
    <p>Tag any commit to build all platforms and publish to GitHub Releases automatically.</p>
    <pre><code>git tag v0.2.1
git push origin v0.2.1</code></pre>
    <p class="hint">
      Or run the <strong>Release</strong> workflow manually in
      <a href="{GITHUB_REPO_URL}/actions/workflows/release.yml" target="_blank" rel="noopener noreferrer">GitHub Actions</a>.
    </p>
  </section>
</main>

<style>
  .releases-page {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem 1.25rem 4rem;
  }

  .crumb {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    color: var(--text-tertiary);
    font-size: 13px;
    margin-bottom: 1.25rem;
  }

  .hero {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-panel);
    padding: 1.75rem 1.5rem;
    margin-bottom: 1.25rem;
    border: 1px solid var(--glass-border);
    background: linear-gradient(145deg, rgba(0, 217, 146, 0.08), rgba(255, 255, 255, 0.02));
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  h1 {
    margin: 0 0 0.6rem;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    letter-spacing: -0.03em;
  }

  .lede {
    margin: 0 0 1.1rem;
    color: var(--text-secondary);
    line-height: 1.55;
    max-width: 62ch;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0.95rem;
    border-radius: var(--radius-control);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform 150ms var(--spring-control), background 150ms ease;
  }

  .btn:hover { transform: translateY(-1px); text-decoration: none; }
  .btn.primary { background: var(--accent); color: #04140e; }
  .btn.secondary { background: var(--glass-2); border-color: var(--glass-border); color: var(--text-primary); }
  .btn.ghost { background: transparent; border-color: var(--glass-border); color: var(--text-secondary); }

  .panel {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-panel);
    background: var(--glass);
    padding: 1.25rem 1.35rem;
    margin-bottom: 1rem;
  }

  .panel h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .panel-head h2 { margin: 0; font-size: 1.35rem; }

  .meta {
    margin: 0.25rem 0 0;
    color: var(--text-tertiary);
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .badge {
    display: inline-block;
    margin-left: 0.4rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-size: 10px;
    text-transform: uppercase;
  }

  .badge.warn {
    background: var(--warning-20);
    color: var(--warning);
  }

  .github-link {
    font-size: 13px;
    white-space: nowrap;
  }

  .asset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .asset-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border-radius: var(--radius-control);
    border: 1px solid var(--accent-20);
    background: var(--accent-8);
    color: inherit;
    text-decoration: none;
    transition: border-color 150ms ease, transform 150ms var(--spring-control);
  }

  .asset-card:hover {
    border-color: var(--accent-60);
    transform: translateY(-2px);
    text-decoration: none;
  }

  .asset-platform {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .asset-name {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
    word-break: break-all;
  }

  .asset-size {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .asset-cta {
    margin-top: 0.35rem;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .history-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--glass-border);
  }

  .history-row:last-child { border-bottom: none; }

  .history-assets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    font-size: 12px;
  }

  pre {
    margin: 0.75rem 0 0;
    padding: 1rem;
    border-radius: var(--radius-control);
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    overflow: auto;
    font-size: 12px;
    line-height: 1.5;
  }

  .hint {
    margin: 0.75rem 0 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  .loading-panel .pulse-row {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, var(--glass-2), var(--glass), var(--glass-2));
    animation: shimmer 1.2s infinite;
    margin-bottom: 0.6rem;
  }

  .loading-panel .pulse-row.short { width: 55%; }

  .error-panel p { color: var(--danger); margin: 0 0 0.75rem; }
  .empty { color: var(--text-secondary); margin: 0; }

  @keyframes shimmer {
    0% { opacity: 0.55; }
    50% { opacity: 1; }
    100% { opacity: 0.55; }
  }

  @media (max-width: 640px) {
    .panel-head, .history-row { flex-direction: column; align-items: flex-start; }
  }
</style>
