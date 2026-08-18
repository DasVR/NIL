<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPut } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let scopeDraft = $state(appState.scope || '');
  let noteDraft = $state('');
  let saving = $state(false);
  let scopeSaved = $state(false);

  // Notes are stored as a single blob on the engagement (appState.notes).
  // We render them as timestamped entries split on blank lines.
  const entries = $derived(
    appState.notes
      .split(/\n{2,}/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ id: crypto.randomUUID(), text, timestamp: '' }))
  );

  $effect(() => {
    scopeDraft = appState.scope || '';
  });

  async function saveScope() {
    saving = true;
    try {
      await apiPut(`/v1/engagements/${appState.engagement}/scope`, { scope: scopeDraft });
      appState.scope = scopeDraft;
      scopeSaved = true;
      setTimeout(() => scopeSaved = false, 1200);
    } catch {
      appState.scope = scopeDraft;
    } finally {
      saving = false;
      await appState.refresh();
    }
  }

  async function addNote() {
    if (!noteDraft.trim()) return;
    const existing = appState.notes ? appState.notes.trim() + '\n\n' : '';
    appState.notes = existing + noteDraft.trim();
    await appState.saveNotes();
    noteDraft = '';
    await appState.refresh();
  }

  function linkFinding(f) {
    noteDraft += ` [finding:${f.id}]`;
  }
</script>

<section class="page">
  <PageHeader title="Notes" count={entries.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="scope-card">
        <div class="scope-header">
          <span class="label-micro">Scope</span>
          <button type="button" class="toolbar-btn primary" class:saved={scopeSaved} onclick={saveScope}>
            {scopeSaved ? 'Saved' : 'Save scope'}
          </button>
        </div>
        <textarea
          bind:value={scopeDraft}
          placeholder="Enter target scope (IPs, domains, exclusions...)"
          rows="10"
          class="scope-textarea mono"
        />
      </div>
    </div>

    <div class="detail-pane">
      <div class="notes-card">
        <div class="notes-header">
          <span class="label-micro">Notes</span>
          <div class="notes-actions">
            {#if appState.findings.length > 0}
              <select
                onchange={(e) => {
                  const id = e.target.value;
                  if (id) linkFinding({ id });
                  e.target.value = '';
                }}
                class="findings-select"
              >
                <option value="">Link finding...</option>
                {#each appState.findings as f}
                  <option value={f.id}>{f.title}</option>
                {/each}
              </select>
            {/if}
          </div>
        </div>
        <textarea
          bind:value={noteDraft}
          placeholder="Add a note..."
          rows="3"
          class="note-input"
        />
        <div class="notes-toolbar">
          <button type="button" class="toolbar-btn primary" onclick={addNote}>Add note</button>
        </div>
      </div>

      {#if entries.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">📝</span>
          <p class="empty-title">No notes yet</p>
          <p class="empty-desc">Add timestamped notes and link findings to build engagement context.</p>
        </div>
      {:else}
        <div class="entries-list">
          {#each entries as e}
            <div class="entry-card">
              <div class="entry-meta">
                <span class="entry-ts mono">note</span>
              </div>
              <p class="entry-text">{e.text}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
  }

  .list-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--glass-border);
    background: var(--glass-2);
    padding: 8px;
    gap: 8px;
  }

  .scope-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 8px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
  }

  .scope-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .scope-textarea {
    flex: 1;
    min-height: 0;
    padding: 6px 8px;
    font-size: 11px;
    line-height: 1.5;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-2);
    color: var(--text);
    resize: none;
  }

  .detail-pane {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notes-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 8px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
  }

  .notes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .notes-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .findings-select {
    padding: 4px 7px;
    font-size: 11px;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-2);
    color: var(--text);
    font-family: var(--font-mono);
  }

  .note-input {
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-2);
    color: var(--text);
    resize: vertical;
  }

  .notes-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }

  .toolbar-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--glass-3);
    color: var(--text);
    min-height: unset;
    cursor: pointer;
    transition: all 120ms var(--spring-control);
  }

  .toolbar-btn.primary {
    background: var(--green-soft);
    color: var(--green);
    border-color: var(--green-soft);
  }

  .toolbar-btn.saved {
    background: var(--green-soft);
    color: var(--green);
    border-color: var(--green-soft);
  }

  .toolbar-btn:hover {
    border-color: var(--glass-border-strong);
  }

  .label-micro {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-faint);
  }

  .entries-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .entry-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    border-radius: 6px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
  }

  .entry-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .entry-ts {
    font-size: 10px;
    color: var(--text-faint);
  }

  .entry-text {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .entry-link {
    font-size: 10px;
    color: var(--green);
    background: var(--green-soft);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .empty-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    opacity: 0.7;
  }

  .empty-icon {
    font-size: 24px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    margin: 0;
  }

  .empty-desc {
    font-size: 12px;
    color: var(--text-faint);
    text-align: center;
    max-width: 280px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .pane-body {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }
</style>
