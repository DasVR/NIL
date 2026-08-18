<script>
  import { appState } from '$lib/stores.svelte';
  import { toast } from '$lib/toast.svelte';

  let addOpen = $state(false);
  let hostDraft = $state('');
  let pluginTarget = $state('');

  const services = $derived(
    appState.targets.flatMap((t) =>
      (t.ports.length ? t.ports : []).map((port) => ({
        id: `${t.id}-${port}`,
        host: t.host,
        port
      }))
    )
  );

  function submitTarget() {
    if (hostDraft.trim()) {
      appState.addTarget(hostDraft.trim());
      hostDraft = '';
      addOpen = false;
    }
  }

  function copyHost(host) {
    navigator.clipboard.writeText(host);
    toast.show('Copied host');
  }

  async function runPlugin(name) {
    const target = pluginTarget.trim() || appState.activeTarget?.host;
    if (!target) {
      toast.show('Select a target first', 'warn');
      return;
    }
    try {
      await appState.runPlugin(name, target);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Plugin failed', 'danger');
    }
  }
</script>

<aside class="sidebar" class:open={appState.leftSidebarOpen} class:focus={appState.focusPane === 'left'} aria-label="Space tree">
  <div class="head">
    {#if appState.leftSidebarOpen}
      <div class="spaces">
        {#each appState.engagements.slice(0, 9) as space, i}
          <button
            type="button"
            class="space-dot"
            class:on={space.name === appState.engagement}
            title={`${space.name} (Ctrl+${i + 1})`}
            onclick={() => appState.select(space.name)}
          >{space.name.slice(0, 1)}</button>
        {/each}
        <button type="button" class="space-dot add" onclick={() => (appState.newSpaceOpen = true)} title="New Space">+</button>
      </div>
    {/if}
    <button type="button" class="icon-btn" onclick={() => appState.toggleLeft()} aria-label="Toggle sidebar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if appState.leftSidebarOpen}
          <path d="m15 18-6-6 6-6"/>
        {:else}
          <path d="m9 18 6-6-6-6"/>
        {/if}
      </svg>
    </button>
  </div>

  {#if appState.leftSidebarOpen}
    <button type="button" class="search" onclick={() => { appState.paletteMode = 'root'; appState.paletteOpen = true; }}>
      <span>Search Space…</span>
      <kbd>⌘K</kbd>
    </button>

    <section class="sec">
      <div class="sec-h">
        <span class="label-micro">Targets</span>
        <button type="button" class="icon-btn" onclick={() => (addOpen = !addOpen)} aria-label="Add target">+</button>
      </div>
      {#if addOpen}
        <form class="add-row" onsubmit={(e) => { e.preventDefault(); submitTarget(); }}>
          <input class="mono" bind:value={hostDraft} placeholder="host or CIDR" />
        </form>
      {/if}
      <div class="list" role="listbox" aria-label="Targets">
        {#if appState.targets.length === 0}
          <p class="empty">Add a host or paste scope.</p>
        {:else}
          {#each appState.targets as target (target.id)}
            <div
              class="row"
              class:on={appState.selectedTargetId === target.id}
              role="option"
              aria-selected={appState.selectedTargetId === target.id}
              tabindex="0"
              onclick={() => appState.selectTarget(target)}
              onkeydown={(e) => { if (e.key === 'Enter') appState.selectTarget(target); }}
            >
              <span class="st" class:scanning={target.status === 'scanning'} class:done={target.status === 'done'} class:error={target.status === 'error'}></span>
              <span class="host mono">{target.host}</span>
              {#if target.ports.length}
                <span class="meta mono">{target.ports.join(',')}</span>
              {/if}
              <span class="hover-actions">
                <button type="button" class="mini" onclick={(e) => { e.stopPropagation(); copyHost(target.host); }}>copy</button>
                <button type="button" class="mini" onclick={(e) => { e.stopPropagation(); void appState.send(`Scan ${target.host} and summarize open services.`); }}>ask</button>
              </span>
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><span class="label-micro">Services</span></div>
      <div class="list">
        {#if services.length === 0}
          <p class="empty">Ports appear after scans.</p>
        {:else}
          {#each services as svc}
            <div class="row"><span class="host mono">{svc.host}:{svc.port}</span></div>
          {/each}
        {/if}
      </div>
    </section>

    <section class="sec">
      <div class="sec-h">
        <span class="label-micro">Creds</span>
        <span class="count">{appState.creds.length}</span>
      </div>
      <div class="list">
        {#each appState.creds.slice(0, 6) as cred}
          <div class="row">
            <span class="host">{cred.service}</span>
            <span class="meta mono">{cred.username}</span>
          </div>
        {:else}
          <p class="empty">Empty vault.</p>
        {/each}
      </div>
    </section>

    <section class="sec grow">
      <div class="sec-h"><span class="label-micro">Plugins</span></div>
      <div class="list">
        {#each appState.plugins as plugin}
          <button
            type="button"
            class="row plugin"
            class:on={appState.pluginMenu === plugin.name}
            onclick={() => {
              appState.pluginMenu = appState.pluginMenu === plugin.name ? '' : plugin.name;
              pluginTarget = appState.activeTarget?.host || '';
            }}
          >
            <span class="host">{plugin.name}</span>
            <span class="safety" style="color:{plugin.safety_level === 'dangerous' || plugin.safety_level === 'destructive' ? 'var(--danger)' : 'var(--text-faint)'}">{plugin.safety_level}</span>
          </button>
          {#if appState.pluginMenu === plugin.name}
            <div class="plugin-pop">
              <p class="hint">{plugin.description}</p>
              <input class="mono" bind:value={pluginTarget} placeholder="target" />
              <button type="button" class="run" onclick={() => runPlugin(plugin.name)}>Propose run</button>
            </div>
          {/if}
        {:else}
          <p class="empty">Start the API to load plugins.</p>
        {/each}
      </div>
    </section>

    {#if appState.criticalCount || appState.highCount}
      <div class="sev-foot">
        {#if appState.criticalCount}<span class="pill crit">{appState.criticalCount}C</span>{/if}
        {#if appState.highCount}<span class="pill high">{appState.highCount}H</span>{/if}
      </div>
    {/if}
  {/if}
</aside>

<style>
  .sidebar {
    grid-column: 1;
    background: var(--abyss-2);
    border-right: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 0;
    opacity: 0;
    transition: width 280ms var(--spring-layout), opacity 180ms var(--spring-smooth);
  }
  .sidebar.open { width: var(--sidebar-width); opacity: 1; }
  .sidebar.focus { box-shadow: inset 0 0 0 1px var(--green-soft); }
  .head {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    border-bottom: 1px solid var(--glass-border);
    gap: 6px;
  }
  .spaces { display: flex; gap: 4px; min-width: 0; overflow: hidden; }
  .space-dot {
    width: 22px; height: 22px; padding: 0; min-height: unset;
    border-radius: 6px; font-size: 10px; font-weight: 600;
    background: var(--abyss-3); color: var(--text-dim);
  }
  .space-dot.on { background: var(--green-soft); color: var(--green); }
  .space-dot.add { color: var(--text-faint); }
  .icon-btn {
    width: 22px; height: 22px; padding: 0; min-height: unset;
    display: grid; place-items: center;
    border: none; background: transparent; color: var(--text-faint);
  }
  .icon-btn:hover { background: var(--abyss-3); color: var(--text); }
  .search {
    margin: 8px 8px 4px;
    height: 28px;
    display: flex; align-items: center;
    padding: 0 8px;
    border-radius: 6px;
    background: var(--abyss-3);
    border: 1px solid var(--glass-border);
    color: var(--text-dim);
    font-size: 12px;
    min-height: unset;
  }
  .search kbd { margin-left: auto; }
  .sec { border-bottom: 1px solid var(--glass-border); min-height: 0; display: flex; flex-direction: column; }
  .sec.grow { flex: 1; }
  .sec-h {
    height: 28px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 10px;
  }
  .count { font-family: var(--font-mono); font-size: 10px; color: var(--text-faint); }
  .list { padding: 2px 4px 8px; overflow-y: auto; }
  .empty { font-size: 11px; color: var(--text-faint); padding: 8px; margin: 0; }
  .row {
    display: flex; align-items: center; gap: 8px;
    height: var(--row-h);
    padding: 0 8px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text-dim);
    width: 100%;
    text-align: left;
    min-height: unset;
    font-size: 12px;
    position: relative;
  }
  .row:hover { background: rgba(255,255,255,0.04); color: var(--text); }
  .row.on {
    background: rgba(255,255,255,0.05);
    color: var(--text);
    box-shadow: inset 2px 0 0 var(--green);
  }
  .st { width: 6px; height: 6px; border-radius: 50%; background: var(--text-faint); flex-shrink: 0; }
  .st.scanning { background: var(--green); box-shadow: 0 0 6px var(--green-glow); }
  .st.done { background: var(--green-dim); }
  .st.error { background: var(--danger); }
  .host { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
  .meta { font-size: 10px; color: var(--text-faint); }
  .safety { font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
  .hover-actions {
    display: none;
    gap: 4px;
  }
  .row:hover .hover-actions { display: flex; }
  .mini {
    font-size: 9px; padding: 1px 5px; min-height: unset;
    background: var(--abyss-4); color: var(--text-dim);
  }
  .add-row { padding: 0 8px 6px; }
  .add-row input { width: 100%; height: 26px; padding: 0 8px; font-size: 12px; }
  .plugin-pop {
    margin: 0 6px 6px;
    padding: 8px;
    border: 1px solid var(--glass-border);
    border-radius: 6px;
    background: var(--abyss-3);
    display: flex; flex-direction: column; gap: 6px;
  }
  .hint { margin: 0; font-size: 11px; color: var(--text-dim); }
  .run {
    font-size: 11px; min-height: unset; padding: 4px 8px;
    background: var(--green-soft); color: var(--green); border-color: transparent;
  }
  .sev-foot { display: flex; gap: 6px; padding: 8px 10px; }
  .pill { font-family: var(--font-mono); font-size: 10px; padding: 1px 6px; border-radius: 8px; }
  .pill.crit { background: var(--critical-soft); color: var(--critical); }
  .pill.high { background: var(--danger-soft); color: var(--danger); }
  @media (prefers-reduced-motion: reduce) {
    .sidebar { transition: none; }
  }
</style>
