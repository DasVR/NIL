<script lang="ts">
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';

  import type { Tab } from '$lib/stores/tabsStore';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneDiffEditor;

  onMount(() => {
    if (!container) return;

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
      renderSideBySide: window.innerWidth > 1000,
    } as monaco.editor.IStandaloneDiffEditorConstructionOptions);

    // Example diff
    const original = `function hello() {
  console.log("Hello, World!");
  return true;
}`;
    const modified = `function hello() {
  console.log("Hello, NIL!");
  return false;
}`;

    editor.setModel({
      original: monaco.editor.createModel(original, 'typescript'),
      modified: monaco.editor.createModel(modified, 'typescript'),
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="diff-tab" bind:this={container} />

<style>
  .diff-tab {
    width: 100%;
    height: 100%;
    background: var(--color-abyss-0);
    overflow: hidden;
  }
</style>