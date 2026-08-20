<script lang="ts">
  import MarketingNav from '$lib/components/MarketingNav.svelte';
  import {
    fetchLatestRelease,
    fetchRecentReleases,
    formatBytes,
    formatReleaseDate,
    GITHUB_RELEASES_URL,
    GITHUB_REPO_URL,
    type GitHubRelease,
    type ReleaseAsset
  } from '$lib/releases';
  import { APP_TAG } from '$lib/version';
  import {
    INSTALL_ERAS,
    INSTALL_OS_ORDER,
    INSTALL_SYSTEMS,
    assetsForOS,
    detectHostOS,
    preferredAsset,
    type HostOS
  } from '$lib/os';

  let latest = $state<GitHubRelease | null>(null);
  let history = $state<GitHubRelease[]>([]);
  let loading = $state(true);
  let error = $state('');
  let os = $state<HostOS>('web');

  const desktopOs = $derived(INSTALL_OS_ORDER.filter((id) => id !== 'web'));

  load();

  async function load() {
    loading = true;
    error = '';
    os = detectHostOS();
    try {
      const [latestRelease, recent] = await Promise.all([fetchLatestRelease(), fetchRecentReleases(8)]);
      latest = latestRelease;
      history = recent;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Could not load releases';
    } finally {
      loading = false;
    }
  }

  function featured(release: GitHubRelease | null): ReleaseAsset | null {
    return preferredAsset(release, os === 'web' ? 'linux' : os);
  }
</script>

<svelte:head>
  <title>Download — Finn Pentest Harness</title>
</svelte:head>

<main class="releases-page marketing">
  <MarketingNav current="download" />

  <header class="hero">
    <p class="eyebrow">Desktop builds · {APP_TAG}</p>
    <h1>Download Finn</h1>
    <p class="lede">
      Install era: one double-click. Welcome era: first Space. Workstation: terminal home.
      Detected <strong>{INSTALL_SYSTEMS[os].name}</strong> — {INSTALL_SYSTEMS[os].requirement}.
    </p>
    <div class="hero-actions">
      {#if latest}
        {@const asset = featured(latest)}
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

  <ol class="eras">
    {#each INSTALL_ERAS as era, i}
      <li>
        <span class="n mono">{i + 1}</span>
        <div>
          <strong>{era.title}</strong>
          <p>{era.body}</p>
        </div>
      </li>
    {/each}
  </ol>

  {#if loading}
    <section class="panel" aria-busy="true">
      <div class="pulse-row"></div>
      <div class="pulse-row short"></div>
    </section>
  {:else if error}
    <section class="panel">
      <p class="err">{error}</p>
      <button type="button" class="btn secondary" onclick={() => void load()}>Retry</button>
    </section>
  {/if}

  {#each desktopOs as id}
    {@const spec = INSTALL_SYSTEMS[id]}
    {@const files = latest ? assetsForOS(latest, id) : []}
    <section class="panel" id={id} class:here={os === id}>
      <div class="panel-head">
        <div>
          <p class="label-micro">{spec.requirement}</p>
          <h2>{spec.name}</h2>
          <p class="meta">{spec.primary.file} · {spec.primary.action}</p>
        </div>
        {#if os === id}<span class="badge">This machine</span>{/if}
      </div>
      {#if files.length}
        <div class="asset-grid">
          {#each files as asset (asset.url)}
            <a class="asset-card" href={asset.url} download>
              <span class="asset-platform">{asset.label}</span>
              <strong>{asset.name}</strong>
              <span class="asset-size">{formatBytes(asset.size)}</span>
              <span class="asset-cta">Download</span>
            </a>
          {/each}
        </div>
      {:else if !loading}
        <p class="empty">No {spec.name} binary on the latest GitHub release yet. Use the kit zip or build from source.</p>
      {/if}
      <ol class="steps">
        {#each spec.first_launch as step}
          <li>{step}</li>
        {/each}
      </ol>
      <p class="paths mono">User: {spec.paths.user} · Admin: {spec.paths.admin}</p>
      <pre><code>{spec.headless}</code></pre>
    </section>
  {/each}

  <section class="panel" id="web">
    <p class="label-micro">{INSTALL_SYSTEMS.web.requirement}</p>
    <h2>Browser workstation</h2>
    <p class="lede-sm">{INSTALL_SYSTEMS.web.primary.action}</p>
    <p class="hint">
      Terminal UI: <code>finn tui</code>. Marketing at <code>/</code>, docs, and download do not need the API.
    </p>
  </section>

  {#if history.length > 1}
    <section class="panel">
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

  <section class="panel">
    <h2>Maintainers: cut a release</h2>
    <p>Tag any commit to build all platforms and publish to GitHub Releases automatically.</p>
    <pre><code>git tag v1.1.1
git push origin v1.1.1</code></pre>
    <p class="hint">
      Or run the <strong>Release</strong> workflow in
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
  .hero {
    border-radius: var(--radius-panel);
    padding: 1.75rem 0 0.5rem;
    margin-bottom: 1.25rem;
  }
  .eyebrow {
    margin: 0 0 0.35rem;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--green);
  }
  h1 {
    margin: 0 0 0.6rem;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    letter-spacing: -0.03em;
  }
  .lede, .lede-sm {
    margin: 0 0 1.1rem;
    color: var(--text-dim);
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
    min-height: 40px;
  }
  .btn.primary { background: var(--green); color: var(--abyss); }
  .btn.secondary { background: var(--glass-2); border-color: var(--glass-border); color: var(--text); }
  .btn.ghost { background: transparent; border-color: var(--glass-border); color: var(--text-dim); }
  .eras {
    list-style: none;
    margin: 0 0 1.25rem;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  .eras li { display: flex; gap: 8px; }
  .eras p { margin: 4px 0 0; font-size: 12px; color: var(--text-dim); line-height: 1.4; }
  .n {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    font-size: 10px;
    color: var(--green);
    flex-shrink: 0;
  }
  .panel {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-panel);
    background: var(--abyss-2);
    padding: 1.25rem 1.35rem;
    margin-bottom: 1rem;
  }
  .panel.here { border-color: var(--green); }
  .panel h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
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
    color: var(--text-faint);
    font-size: 12px;
    font-family: var(--font-mono);
  }
  .badge {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--green);
    border: 1px solid var(--green);
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
    border: 1px solid var(--glass-border);
    background: var(--green-soft);
    color: inherit;
    text-decoration: none;
  }
  .asset-card:hover { border-color: var(--green); text-decoration: none; }
  .asset-platform {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--green);
  }
  .asset-size { font-size: 12px; color: var(--text-dim); }
  .asset-cta { margin-top: 0.35rem; font-size: 12px; font-weight: 600; color: var(--green); }
  .steps {
    margin: 1rem 0 0;
    padding-left: 1.1rem;
    color: var(--text-dim);
    font-size: 13px;
    line-height: 1.5;
  }
  .paths { font-size: 11px; color: var(--text-faint); margin: 0.75rem 0 0; }
  .history-list { display: flex; flex-direction: column; gap: 0.65rem; }
  .history-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--glass-border);
  }
  .history-row:last-child { border-bottom: none; }
  .history-assets { display: flex; flex-wrap: wrap; gap: 0.45rem; font-size: 12px; }
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
  .hint { margin: 0.75rem 0 0; color: var(--text-dim); font-size: 13px; line-height: 1.5; }
  .pulse-row {
    height: 14px;
    border-radius: 6px;
    background: var(--abyss-3);
    margin-bottom: 0.6rem;
  }
  .pulse-row.short { width: 55%; }
  .err { color: var(--danger); margin: 0 0 0.75rem; }
  .empty { color: var(--text-dim); margin: 0; }
  @media (max-width: 640px) {
    .panel-head, .history-row, .eras { flex-direction: column; align-items: flex-start; grid-template-columns: 1fr; }
  }
</style>
