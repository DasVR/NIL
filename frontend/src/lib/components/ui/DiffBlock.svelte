<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface DiffBlockProps {
    block: {
      id: string;
      file: string;
      oldContent: string;
      newContent: string;
      language?: string;
    };
  }

  let { block }: DiffBlockProps = $props();

  let container: HTMLDivElement;
  let editor: any;
  let viewMode = $state<'unified' | 'side-by-side'>('unified');

  onMount(() => {
    if (!browser || !container) return;

    import('monaco-editor').then((monaco) => {
      monaco.editor.defineTheme('nil-diff', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#050507',
          'editor.foreground': '#e8e8e6',
          'diffEditor.insertedTextBackground': 'rgba(92, 255, 138, 0.15)',
          'diffEditor.removedTextBackground': 'rgba(255, 92, 92, 0.15)',
          'diffEditor.border': '#16161d',
        },
      });

      editor = monaco.editor.createDiffEditor(container, {
        theme: 'nil-diff',
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        lineHeight: 1.5,
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        renderSideBySide: viewMode === 'side-by-side',
        renderOverviewRuler: true,
        originalEditable: false,
      } as any);

      const originalModel = monaco.editor.createModel(block.oldContent, block.language || 'typescript');
      const modifiedModel = monaco.editor.createModel(block.newContent, block.language || 'typescript');

      editor.setModel({ original: originalModel, modified: modifiedModel });
    });

    return () => {
      editor?.dispose();
    };
  });

  function toggleViewMode() {
    viewMode = viewMode === 'unified' ? 'side-by-side' : 'unified';
    editor?.updateOptions({ renderSideBySide: viewMode === 'side-by-side' });
  }

  function accept() {
    console.log('accept', block.id);
  }

  function reject() {
    console.log('reject', block.id);
  }
</script>

<div class="diff-block" role="region" aria-label={`Diff: ${block.file}`}>
  <div class="diff-header">
    <div class="diff-file">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="diff-file-name">{block.file}</span>
    </div>
    <div class="diff-actions">
      <button class="diff-btn" onclick={toggleViewMode} aria-label={viewMode === 'unified' ? 'Side by side' : 'Unified'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {#if viewMode === 'unified'}
            <rect x="3" y="3" width="8" height="18" rx="1"/>
            <rect x="13" y="3" width="8" height="18" rx="1"/>
          {:else}
            <path d="M6 9H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
            <path d="M18 9h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"/>
          {/if}
        </svg>
      </button>
      <button class="diff-btn accept" onclick={accept} aria-label="Accept changes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
      <button class="diff-btn reject" onclick={reject} aria-label="Reject changes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="diff-editor" bind:this={container}></div>
</div>

<style>
  .diff-block {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
  }

  .diff-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    background: var(--surface-hover);
    border-bottom: 1px solid var(--surface-border);
  }

  .diff-file {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-family: var(--font-mono);
  }

  .diff-file-name {
    color: var(--text-primary);
    font-weight: 500;
  }

  .diff-actions {
    display: flex;
    gap: 4px;
  }

  .diff-btn {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .diff-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .diff-btn.accept:hover {
    background: rgba(92, 255, 138, 0.15);
    color: var(--color-success);
  }

  .diff-btn.reject:hover {
    background: rgba(255, 92, 92, 0.15);
    color: var(--color-danger);
  }

  .diff-editor {
    min-height: 300px;
    max-height: 500px;
  }
</style>