<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Tab } from '$lib/stores/tabsStore';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { readProjectFile } from '$lib/project.svelte.ts';
  import api from '$lib/api';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let editor: {
    dispose: () => void;
    setValue: (v: string) => void;
    getValue: () => string;
    onDidChangeModelContent: (listener: () => void) => { dispose: () => void };
  } | undefined;
  let status = $state('');

  function token(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function languageOf(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'mjs':
      case 'cjs':
        return 'javascript';
      case 'py':
        return 'python';
      case 'rs':
        return 'rust';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
      case 'svelte':
        return 'html';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'toml':
        return 'ini';
      case 'sh':
      case 'bash':
        return 'shell';
      default:
        return 'plaintext';
    }
  }

  async function loadContent(path: string): Promise<string | null> {
    const seeded = typeof tab.data?.content === 'string' ? tab.data.content : null;
    if (seeded != null) return seeded;

    const artifact = path.match(/^(?:.*\/)?([^/]+)\/(scope|notes|timeline)$/);
    if (artifact) {
      const name = artifact[1];
      const kind = artifact[2];
      try {
        if (kind === 'scope') return (await api.getScope(name)).scope;
        if (kind === 'notes') return (await api.getNotes(name)).notes;
        if (kind === 'timeline') return (await api.getTimeline(name)).timeline;
      } catch {
        // Fall through to the workspace file bridge.
      }
    }

    return readProjectFile(path);
  }

  onMount(() => {
    if (!browser || !container) return;
    let disposed = false;

    import('monaco-editor').then(async (monaco) => {
      if (disposed || !container) return;

      const voidC = token('--nil-void', '#0a0908');
      const ink = token('--nil-ink', '#efe9e0');
      const ink3 = token('--nil-ink-3', '#736a5f');
      const raised = token('--nil-raised', '#1c1916');
      const line = token('--nil-line', '#2a2622');

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

      const path = typeof tab.data?.path === 'string' ? tab.data.path : tab.label;
      editor = monaco.editor.create(container, {
        value: '',
        language: languageOf(path),
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

      editor.onDidChangeModelContent(() => {
        const value = editor?.getValue() ?? '';
        tabsStore.patchData(tab.id, { path, content: value });
        const current = tabsStore.tabs.find((t) => t.id === tab.id);
        if (current && !current.dirty) tabsStore.markDirty(tab.id, true);
      });

      const text = await loadContent(path);
      if (disposed) return;
      if (text != null) {
        editor.setValue(text);
        tabsStore.patchData(tab.id, { path, content: text });
        tabsStore.markDirty(tab.id, false);
        status = '';
      } else {
        status = 'This path is not readable from the workstation yet.';
      }
    });

    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent<{ path?: string; ok?: boolean }>).detail;
      const current = typeof tab.data?.path === 'string' ? tab.data.path : tab.label;
      if (detail?.path !== current) return;
      status = detail.ok
        ? 'Saved'
        : 'Could not write this path from the workstation.';
    };
    window.addEventListener('nil:file-saved', onSaved);

    return () => {
      disposed = true;
      window.removeEventListener('nil:file-saved', onSaved);
      editor?.dispose();
    };
  });
</script>

<div class="wrap">
  {#if status}
    <p class="status">{status}</p>
  {/if}
  <div class="editor-tab" bind:this={container} data-tab={tab.id}></div>
</div>

<style>
  .wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--nil-void);
    min-height: 0;
  }
  .status {
    margin: 0;
    padding: 6px var(--s-3);
    border-bottom: 1px solid var(--nil-line);
    font: var(--t-micro)/1.4 var(--font-ui);
    color: var(--nil-ink-3);
    flex-shrink: 0;
  }
  .editor-tab {
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
</style>
