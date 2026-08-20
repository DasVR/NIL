<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import type { InspectorTab } from '$lib/types';
  import { SEVERITY_COLOR, SEVERITY_ORDER } from '$lib/findings';
  import { parseTimeline } from '$lib/timeline';
  import FindingCard from './FindingCard.svelte';
  import { toast } from '$lib/toast.svelte';

  const tabs: { id: InspectorTab; label: string }[] = [
    { id: 'findings', label: 'Findings' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'notes', label: 'Notes' }
  ];

  const sortedFindings = $derived(
    [...appState.findings].sort(
      (a, b) =>
        (SEVERITY_ORDER[b.severity?.toLowerCase()] || 0) - (SEVERITY_ORDER[a.severity?.toLowerCase()] || 0)
    )
  );
  const events = $derived(parseTimeline(appState.timeline));

  function setTab(id: InspectorTab) {
    appState.inspectorTab = id;
    appState.persist();
  }
</script>

<aside class="inspector" class:open={appState.rightSidebarOpen} class:focus={appState.focusPane === 'right'} aria-label="Inspector">
  <div class="head">
    <button type="button" class="icon" onclick={() => appState.toggleRight()} aria-label="Toggle inspector" title="⌘⇧B">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if appState.rightSidebarOpen}
          <path d="m9 18 6-6-6-6"/>
        {:else}
          <path d="m15 18-6-6 6-6"/>
        {/if}
      </svg>
    </button>
    {#if appState.rightSidebarOpen}
      <nav class="tabs">
        {#each tabs as t}
          <button type="button" class:on={appState.inspectorTab === t.id} onclick={() => setTab(t.id)}>{t.label}</button>
        {/each}
      </nav>
    {/if}
  </div>

  {#if appState.rightSidebarOpen}
    {#if appState.inspectorTab === 'findings'}
      <div class="body">
        {#if appState.selectedFinding}
          <FindingCard finding={appState.selectedFinding} />
          <button type="button" class="back" onclick={() => appState.selectFinding(null)}>All findings</button>
        {:else if sortedFindings.length === 0}
          <p class="empty">No findings yet. Run a scan — results land here, not in the tree.</p>
        {:else}
          {#each sortedFindings as finding (finding.id)}
            {@const sev = (finding.severity || 'info').toLowerCase()}
            <button
              type="button"
              class="row"
              class:on={appState.selectedFindingId === finding.id}
              onclick={() => appState.selectFinding(finding)}
            >
              <span class="bar" style="background:{SEVERITY_COLOR[sev] || SEVERITY_COLOR.info}"></span>
              <span class="title">{finding.title}</span>
              <span class="meta mono">{sev}</span>
            </button>
          {/each}
        {/if}
      </div>
    {:else if appState.inspectorTab === 'evidence'}
      <div class="body">
        {#if appState.loot.length === 0}
          <p class="empty">Loot and bookmarked blocks appear here.</p>
        {:else}
          {#each appState.loot as item (item.id)}
            <div class="row">
              <span class="title">{item.name}</span>
              <span class="meta mono">{item.type}</span>
            </div>
          {/each}
        {/if}
      </div>
    {:else if appState.inspectorTab === 'timeline'}
      <div class="body">
        {#if events.length === 0}
          <p class="empty">Activity will appear as commands run.</p>
        {:else}
          {#each events as ev (ev.id)}
            <div class="row event">
              <span class="meta mono">{ev.timestamp}</span>
              <span class="label mono">{ev.label}</span>
              <span class="title">{ev.text}</span>
            </div>
          {/each}
        {/if}
      </div>
    {:else if appState.inspectorTab === 'notes'}
      <div class="body notes">
        <span class="label-micro">Notes</span>
        <textarea bind:value={appState.notes} rows="8" placeholder="Running notes for this Space"></textarea>
        <span class="label-micro">Scope</span>
        <textarea bind:value={appState.scope} rows="5" class="mono" placeholder="In-scope hosts"></textarea>
        <button
          type="button"
          class="primary"
          onclick={async () => {
            await appState.saveNotes();
            await appState.saveScope();
            toast.show('Notes and scope saved');
          }}>Save ⌘S</button
        >
      </div>
    {/if}
  {/if}
</aside>

<style>
  .inspector {
    grid-column: 3;
    background: var(--abyss-2);
    border-left: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 0;
    min-width: 0;
    min-height: 0;
    opacity: 0;
    transition: width 280ms var(--spring-layout), opacity 180ms var(--spring-smooth);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  .inspector.open { width: var(--rightbar-width); opacity: 1; }
  .inspector.focus { box-shadow: inset 0 0 0 1px var(--green-soft); }
  .head {
    height: 36px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 6px;
    border-bottom: 1px solid var(--glass-border);
  }
  .icon {
    width: 22px; height: 22px; padding: 0; min-height: unset;
    display: grid; place-items: center;
    border: 0; background: transparent; color: var(--text-faint);
  }
  .tabs { display: flex; gap: 2px; min-width: 0; overflow: auto; }
  .tabs button {
    height: 24px; min-height: unset; padding: 0 8px; border: 0;
    background: transparent; color: var(--text-faint); font-size: 11px;
  }
  .tabs button.on { color: var(--text); background: var(--abyss-3); }
  .body { flex: 1; overflow: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
  .empty { font-size: 12px; color: var(--text-faint); padding: 12px; margin: 0; line-height: 1.4; }
  .row {
    display: flex; align-items: center; gap: 8px;
    height: var(--row-h); min-height: unset;
    padding: 0 8px; border: 0; border-radius: 5px;
    background: transparent; color: var(--text-dim);
    text-align: left; width: 100%; font-size: 12px;
  }
  .row.event { height: auto; min-height: 28px; align-items: flex-start; flex-wrap: wrap; padding: 6px 8px; }
  .row:hover { background: rgba(255,255,255,0.04); color: var(--text); }
  .row.on { background: rgba(255,255,255,0.05); color: var(--text); box-shadow: inset 2px 0 0 var(--green); }
  .bar { width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta { font-size: 10px; color: var(--text-faint); flex-shrink: 0; }
  .label { font-size: 10px; color: var(--green); }
  .back { min-height: unset; font-size: 11px; align-self: flex-start; }
  .notes textarea { width: 100%; min-height: 80px; font-size: 12px; }
  .notes .primary { min-height: 28px; margin-top: 8px; }
  @media (prefers-reduced-motion: reduce) {
    .inspector { transition: none; }
  }
</style>
