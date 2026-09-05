<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Tab } from '$lib/stores/tabsStore';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: { dispose: () => void } | undefined;

  function token(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  onMount(() => {
    if (!browser || !container) return;

    import('monaco-editor').then((monaco) => {
      const voidC = token('--nil-void', '#08090a');
      const ink = token('--nil-ink', '#e8e6e3');
      const ink3 = token('--nil-ink-3', '#6b7175');
      const raised = token('--nil-raised', '#151819');
      const line = token('--nil-line', '#1c2022');

      monaco.editor.defineTheme('nil', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': voidC,
          'editor.foreground': ink,
          'editor.lineHighlightBackground': raised,
          'editorCursor.foreground': ink,
          'editor.selectionBackground': raised,
          'editorLineNumber.foreground': ink3,
          'editorIndentGuide.background': line,
          'editorIndentGuide.activeBackground': ink3,
        },
      });

      editor = monaco.editor.create(container, {
        value: '',
        language: 'plaintext',
        theme: 'nil',
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        lineHeight: 20,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        renderLineHighlight: 'line',
      });
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="editor-tab" bind:this={container} data-tab={tab.id}></div>

<style>
  .editor-tab {
    width: 100%;
    height: 100%;
    background: var(--nil-void);
    overflow: hidden;
  }
</style>
