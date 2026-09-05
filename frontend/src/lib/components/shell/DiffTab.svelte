<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Tab } from '$lib/stores/tabsStore';
  import type { editor as MonacoEditor } from 'monaco-editor';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: MonacoEditor.IStandaloneDiffEditor | undefined;

  function token(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  onMount(() => {
    if (!browser || !container) return;

    import('monaco-editor').then((monaco) => {
      const voidC = token('--nil-void', '#08090a');
      const ink = token('--nil-ink', '#e8e6e3');
      const line = token('--nil-line', '#1c2022');
      const criticalBg = 'rgba(229, 72, 77, 0.15)';
      const lowBg = 'rgba(92, 158, 173, 0.15)';

      monaco.editor.defineTheme('nil-diff', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': voidC,
          'editor.foreground': ink,
          'diffEditor.insertedTextBackground': lowBg,
          'diffEditor.removedTextBackground': criticalBg,
          'diffEditor.border': line,
        },
      });

      const diff = monaco.editor.createDiffEditor(container, {
        theme: 'nil-diff',
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        lineHeight: 20,
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        renderSideBySide: window.innerWidth > 1000,
      });
      editor = diff;

      diff.setModel({
        original: monaco.editor.createModel('', 'plaintext'),
        modified: monaco.editor.createModel('', 'plaintext'),
      });
    });

    return () => {
      editor?.dispose();
    };
  });
</script>

<div class="diff-tab" bind:this={container} data-tab={tab.id}></div>

<style>
  .diff-tab {
    width: 100%;
    height: 100%;
    background: var(--nil-void);
    overflow: hidden;
  }
</style>
