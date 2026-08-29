<script lang="ts">
  import loader from '@monaco-editor/loader';
  import { onMount } from 'svelte';

  let {
    value = '',
    language = 'typescript',
    theme = 'vs-dark',
    readOnly = false,
    className = ''
  }: {
    value?: string;
    language?: string;
    theme?: string;
    readOnly?: boolean;
    className?: string;
  } = $props();

  let container: HTMLDivElement;
  let editor: any;

  onMount(() => {
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
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="monaco-editor {className}" bind:this={container}></div>

<style>
  .monaco-editor {
    width: 100%;
    height: 100%;
    min-height: 12rem;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
</style>
