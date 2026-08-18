<script>
  import { appState } from '$lib/stores.svelte';
  import { uploadLoot } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let selected = $state(null);
  let previewText = $state('');
  let previewImage = $state('');
  let loadingPreview = $state(false);
  let uploading = $state(false);
  let fileInput;

  const files = $derived(appState.loot);

  const typeIcon = {
    image: '🖼',
    text: '📄',
    json: '📋',
    binary: '📦',
    default: '📎'
  };

  function fmtBytes(b) {
    if (!b) return '0 B';
    const units = ['B','KB','MB','GB'];
    let i = 0;
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
    return `${b.toFixed(1)} ${units[i]}`;
  }

  async function selectFile(f) {
    selected = f;
    previewText = '';
    previewImage = '';
    loadingPreview = true;
    try {
      if (f.type?.startsWith('image')) {
        previewImage = f.url || '';
      } else {
        previewText = f.preview || '(preview unavailable)';
      }
    } catch {
      previewText = '(preview unavailable)';
    } finally {
      loadingPreview = false;
    }
  }

  async function handleUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    uploading = true;
    try {
      await uploadLoot(appState.engagement, file);
      await appState.refresh();
    } finally {
      uploading = false;
      if (fileInput) fileInput.value = '';
    }
  }

  function typeFromName(name) {
    if (!name) return 'default';
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png','jpg','jpeg','gif','webp','bmp'].includes(ext)) return 'image';
    if (['txt','md','log','csv','xml','html'].includes(ext)) return 'text';
    if (['json'].includes(ext)) return 'json';
    return 'binary';
  }

  function goToTools() {
    appState.aiStripOpen = true;
    appState.send('Run a scan to capture files and loot.');
  }
</script>

<section class="page">
  <PageHeader title="Loot" count={files.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="list-toolbar">
        <span class="label-micro">{files.length} files</span>
        <input
          bind:this={fileInput}
          type="file"
          class="file-input"
          onchange={handleUpload}
          aria-label="Upload loot file"
        />
        <button type="button" class="toolbar-btn primary" onclick={() => fileInput?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : '+ Upload'}
        </button>
      </div>

      {#if files.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">📦</span>
          <p class="empty-title">No captured files yet</p>
          <p class="empty-desc">Run scans to capture screenshots, logs, and exported data. They'll show up here.</p>
          <button type="button" class="toolbar-btn primary" onclick={goToTools}>Run a scan to capture loot</button>
        </div>
      {:else}
        <div class="files-grid">
          {#each files as f}
            <button
              type="button"
              class="file-card"
              class:selected={selected?.id === f.id}
              onclick={() => selectFile(f)}
            >
              <span class="file-icon">{typeIcon[typeFromName(f.name)] || typeIcon.default}</span>
              <span class="file-name mono">{f.name}</span>
              <span class="file-meta mono">{fmtBytes(f.size)} · {f.source}</span>
              <span class="file-ts mono">{f.timestamp ? new Date(f.timestamp).toLocaleString() : ''}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="detail-pane">
      {#if selected}
        <div class="detail-card">
          <div class="detail-header">
            <span class="detail-name mono">{selected.name}</span>
            <span class="detail-meta mono">{fmtBytes(selected.size)} · {selected.source}</span>
          </div>

          {#if loadingPreview}
            <div class="preview-loading">Loading preview...</div>
          {:else if previewImage}
            <img class="preview-image" src={previewImage} alt={selected.name} />
          {:else}
            <pre class="preview-text">{previewText}</pre>
          {/if}

          <div class="detail-actions">
            <button type="button" class="toolbar-btn" onclick={() => selected = null}>Close</button>
          </div>
        </div>
      {:else}
        <div class="empty-pane">
          <span class="empty-icon">📦</span>
          <p class="empty-title">Select a file</p>
          <p class="empty-desc">Click a file from the list to preview or download it.</p>
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

  .file-input {
    display: none;
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

  .label-micro {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-faint);
  }

  .files-grid {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .file-card {
    display: flex;
    flex-direction: column;
    gap: 2px;
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

  .file-card:hover {
    background: var(--glass-3);
  }

  .file-card.selected {
    background: var(--glass-3);
    border-left: 2px solid var(--green);
    padding-left: 6px;
  }

  .file-icon {
    font-size: 16px;
  }

  .file-name {
    font-size: 12px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-meta {
    font-size: 10px;
    color: var(--text-dim);
  }

  .file-ts {
    font-size: 10px;
    color: var(--text-faint);
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
    flex-wrap: wrap;
  }

  .detail-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .detail-meta {
    font-size: 11px;
    color: var(--text-faint);
  }

  .preview-loading {
    font-size: 12px;
    color: var(--text-faint);
    padding: 20px;
    text-align: center;
  }

  .preview-image {
    max-width: 100%;
    border-radius: 6px;
    border: 1px solid var(--glass-border);
    background: var(--abyss-2);
  }

  .preview-text {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    padding: 10px;
    border-radius: 6px;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    overflow-x: auto;
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
