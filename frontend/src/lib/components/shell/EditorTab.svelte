<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Tab } from '$lib/stores/tabsStore';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: any;

  onMount(() => {
    if (!browser || !container) return;

    import('monaco-editor').then((monaco) => {
      monaco.editor.defineTheme('nil', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#08090a',
          'editor.foreground': '#e8e6e3',
          'editor.lineHighlightBackground': '#151819',
          'editorCursor.foreground': '#e8e6e3',
          'editor.selectionBackground': 'rgba(232, 230, 227, 0.18)',
          'editor.lineNumbers': '#6b7175',
          'editorIndentGuide.background': '#1c2022',
          'editorIndentGuide.activeBackground': '#2b3134',
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