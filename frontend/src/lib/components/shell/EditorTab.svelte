<script lang="ts">
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import type { Tab } from '$lib/stores/tabsStore';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    if (!container) return;

    // Configure monaco
    monaco.editor.defineTheme('nil', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#050507',
        'editor.foreground': '#e8e8e6',
        'editor.lineHighlightBackground': '#0a0a0c',
        'editorCursor.foreground': '#452a84',
        'editor.selectionBackground': 'rgba(169, 177, 240, 0.3)',
        'editor.lineNumbers': '#55554f',
        'editorIndentGuide.background': '#16161d',
        'editorIndentGuide.activeBackground': '#452a84',
      },
    });

    editor = monaco.editor.create(container, {
      value: '// Welcome to NIL Editor\n// Start coding...\n\nfunction hello() {\n  console.log("Hello, NIL!");\n}',
      language: 'typescript',
      theme: 'nil',
      fontFamily: 'JetBrains Mono',
      fontSize: 13,
      lineHeight: 1.5,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
      renderLineHighlight: 'all',
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="editor-tab" bind:this={container} />

<style>
  .editor-tab {
    width: 100%;
    height: 100%;
    background: var(--color-abyss-0);
    overflow: hidden;
  }
</style>