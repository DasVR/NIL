<script>
  import { appState } from '$lib/stores.svelte';
  import { storeCredential, deleteCredential, listCredentials } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let selected = $state(null);
  let showAdd = $state(false);
  let showPassword = $state(false);
  let copied = $state('');

  let newService = $state('');
  let newUsername = $state('');
  let newPassword = $state('');
  let newNote = $state('');

  const creds = $derived(appState.creds);

  async function addCred() {
    const body = {
      engagement: appState.engagement,
      service: newService,
      username: newUsername,
      password: newPassword,
      note: newNote
    };
    await storeCredential(body);
    newService = '';
    newUsername = '';
    newPassword = '';
    newNote = '';
    showAdd = false;
    await appState.refresh();
  }

  async function removeCred(c) {
    await deleteCredential(appState.engagement, c.id);
    if (selected?.id === c.id) selected = null;
    await appState.refresh();
  }

  async function revealPassword(c) {
    if (showPassword) {
      showPassword = false;
      return;
    }
    try {
      const data = await listCredentials(appState.engagement, true);
      const found = (data.credentials || []).find((x) => x.id === c.id);
      if (found) {
        c.password = found.password;
        showPassword = true;
      }
    } catch {
      // keep masked
    }
  }

  function selectCred(c) {
    selected = c;
    showPassword = false;
  }

  function maskPassword(pw) {
    if (!pw) return '';
    return '•'.repeat(Math.min(pw.length, 16));
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      copied = label;
      setTimeout(() => copied = '', 1200);
    } catch {
      // ignore
    }
  }

  function useInTool() {
    if (!selected) return;
    appState.aiStripOpen = true;
    appState.send(`Use credential ${selected.username}@${selected.service} in next tool run.`);
  }
</script>

<section class="page">
  <PageHeader title="Creds" count={creds.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="list-toolbar">
        <button type="button" class="toolbar-btn primary" onclick={() => showAdd = !showAdd}>
          {showAdd ? 'Cancel' : '+ Add credential'}
        </button>
      </div>

      {#if showAdd}
        <div class="add-card">
          <span class="label-micro">New Credential</span>
          <input bind:value={newService} placeholder="Service (ssh, http, smb...)" />
          <input bind:value={newUsername} placeholder="Username" />
          <input bind:value={newPassword} placeholder="Password" type="password" />
          <input bind:value={newNote} placeholder="Note (optional)" />
          <button type="button" class="toolbar-btn primary" onclick={addCred}>Save</button>
        </div>
      {/if}

      {#if creds.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">🔒</span>
          <p class="empty-title">No credentials stored yet</p>
          <p class="empty-desc">Store passwords, keys, and tokens here for quick access during engagements.</p>
          <button type="button" class="toolbar-btn primary" onclick={() => showAdd = true}>Add first credential</button>
        </div>
      {:else}
        <div class="creds-list">
          {#each creds as c}
            <button
              type="button"
              class="cred-row"
              class:selected={selected?.id === c.id}
              onclick={() => selectCred(c)}
            >
              <div class="cred-meta">
                <span class="cred-service mono">{c.service}</span>
                <span class="cred-user mono">{c.username}</span>
                <span class="cred-pass mono">{maskPassword(c.password)}</span>
              </div>
              <span class="cred-ts mono">{c.last_used ? new Date(c.last_used).toLocaleString() : ''}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="detail-pane">
      {#if selected}
        <div class="detail-card">
          <div class="detail-header">
            <span class="detail-service mono">{selected.service}</span>
            <span class="detail-ts mono">{selected.last_used ? new Date(selected.last_used).toLocaleString() : ''}</span>
          </div>
          <div class="detail-field">
            <span class="label-micro">Username</span>
            <div class="field-row">
              <span class="field-value mono">{selected.username}</span>
              <button type="button" class="toolbar-btn" onclick={() => copy(selected.username, 'user')}>
                {copied === 'user' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div class="detail-field">
            <span class="label-micro">Password</span>
            <div class="field-row">
              <span class="field-value mono">{showPassword ? selected.password : maskPassword(selected.password)}</span>
              <button type="button" class="toolbar-btn" onclick={() => revealPassword(selected)}>
                {showPassword ? 'Hide' : 'Reveal'}
              </button>
              <button type="button" class="toolbar-btn" onclick={() => copy(selected.password, 'pass')}>
                {copied === 'pass' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          {#if selected.note}
            <div class="detail-field">
              <span class="label-micro">Note</span>
              <span class="field-value">{selected.note}</span>
            </div>
          {/if}
          <div class="detail-actions">
            <button type="button" class="toolbar-btn primary" onclick={useInTool}>Use in tool</button>
            <button type="button" class="toolbar-btn danger" onclick={() => removeCred(selected)}>Delete</button>
            <button type="button" class="toolbar-btn" onclick={() => selected = null}>Close</button>
          </div>
        </div>
      {:else}
        <div class="empty-pane">
          <span class="empty-icon">🔒</span>
          <p class="empty-title">Select a credential</p>
          <p class="empty-desc">Click a credential from the list to view details, copy values, or use in a tool.</p>
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
  }

  .list-toolbar {
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid var(--glass-border);
    gap: 8px;
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

  .toolbar-btn:hover {
    border-color: var(--glass-border-strong);
  }

  .add-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--glass-3);
  }

  .add-card input {
    padding: 5px 7px;
    font-size: 11px;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-2);
    color: var(--text);
    font-family: var(--font-mono);
  }

  .label-micro {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-faint);
  }

  .creds-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cred-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background 120ms var(--spring-control);
    min-height: 32px;
  }

  .cred-row:hover {
    background: var(--glass-3);
  }

  .cred-row.selected {
    background: var(--glass-3);
    border-left: 2px solid var(--green);
    padding-left: 6px;
  }

  .cred-meta {
    flex: 1;
    display: grid;
    grid-template-columns: 80px 1fr 1fr;
    gap: 6px;
    min-width: 0;
    align-items: center;
  }

  .cred-service {
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cred-user {
    font-size: 11px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cred-pass {
    font-size: 11px;
    color: var(--text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cred-ts {
    font-size: 10px;
    color: var(--text-faint);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .detail-pane {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
  }

  .detail-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .detail-service {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .detail-ts {
    font-size: 11px;
    color: var(--text-faint);
  }

  .detail-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .field-value {
    flex: 1;
    font-size: 12px;
    color: var(--text-dim);
    word-break: break-all;
    padding: 5px 7px;
    border-radius: 5px;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    min-height: 28px;
    display: flex;
    align-items: center;
  }

  .detail-actions {
    display: flex;
    gap: 6px;
    margin-top: 4px;
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
