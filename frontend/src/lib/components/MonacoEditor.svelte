<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let {
    value = '',
    language = 'typescript',
    readOnly = false,
    className = ''
  }: {
    value?: string;
    language?: string;
    readOnly?: boolean;
    className?: string;
  } = $props();

  let container: HTMLDivElement;
  let editor: any;
  let loaded = $state(false);

  onMount(() => {
    if (!browser) return;

    import('@monaco-editor/loader').then((mod) => {
      const loader = mod.default;
      loader.init().then((monaco) => {
        monaco.editor.defineTheme('nil-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#050507',
            'editor.lineHighlightBackground': '#101016',
            'editor.selectionBackground': '#452a8466',
          },
        });

        editor = monaco.editor.create(container, {
          value,
          language,
          theme: 'nil-dark',
          readOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          lineHeight: 22,
          scrollBeyondLastLine: false,
          roundedSelection: false,
          padding: { top: 12 },
        });
        loaded = true;
      });
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="monaco-editor {className}" class:loaded bind:this={container} role="region" aria-label="Code editor">
  {#if !loaded}
    <div class="monaco-editor__placeholder">Loading editor…</div>
  {/if}
</div>

<style>
  .monaco-editor {
    width: 100%;
    height: 100%;
    min-height: 12rem;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--surface-0);
  }
  .monaco-editor__placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--text-tertiary);
    font: var(--type-mono);
  }
</style>
