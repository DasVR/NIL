<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { terminalStore } from '$lib/stores/terminalStore.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';

  interface Props {
    tab: { id: string; type: string; label: string; dirty: boolean };
  }

  let { tab }: Props = $props();

  let container: HTMLDivElement;
  let terminal: { write: (d: string) => void; writeln: (d: string) => void; open: (el: HTMLElement) => void; loadAddon: (a: unknown) => void; focus: () => void; dispose: () => void; onData: (cb: (d: string) => void) => void; onResize: (cb: (s: { cols: number; rows: number }) => void) => void } | undefined;
  let fitAddon: { fit: () => void } | undefined;
  let ptyConnected = $state(false);

  function token(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  onMount(() => {
    if (!browser) return;
    initTerminal();
  });

  async function initTerminal() {
    if (!container) return;

    const [{ Terminal }, { FitAddon }, { WebglAddon }] = await Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
      import('@xterm/addon-webgl')
    ]);

    const voidC = token('--nil-void', '#08090a');
    const panel = token('--nil-panel', '#0e1011');
    const ink = token('--nil-ink', '#e8e6e3');
    const ink2 = token('--nil-ink-2', '#9aa0a4');
    const ink3 = token('--nil-ink-3', '#6b7175');
    const ink4 = token('--nil-ink-4', '#3a4043');
    const critical = token('--sev-critical', '#e5484d');
    const high = token('--sev-high', '#e8833a');
    const medium = token('--sev-medium', '#d9b341');
    const low = token('--sev-low', '#5c9ead');

    terminal = new Terminal({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.45,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: voidC,
        foreground: ink,
        cursor: ink,
        selectionBackground: ink4,
        black: panel,
        red: critical,
        green: ink2,
        yellow: medium,
        blue: low,
        magenta: ink3,
        cyan: ink2,
        white: ink,
        brightBlack: ink4,
        brightRed: critical,
        brightGreen: ink2,
        brightYellow: high,
        brightBlue: low,
        brightMagenta: ink2,
        brightCyan: ink2,
        brightWhite: ink,
      },
      convertEol: true,
      scrollback: 10000,
    });

    fitAddon = new FitAddon();
    const webglAddon = new WebglAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webglAddon);

    terminal.open(container);
    fitAddon.fit();

    // Connect to PTY via Tauri
    if (window.__TAURI__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const port = await invoke<number>('pty_connect', { socketPath: '/tmp/nil-pty.sock' });
        
        const ws = new WebSocket(`ws://localhost:${port}`);
        ws.binaryType = 'arraybuffer';
        
        ws.onopen = () => {
          ptyConnected = true;
          terminalStore.setConnected(true);
        };
        
        ws.onmessage = (event) => {
          const data = new TextDecoder().decode(event.data);
          terminal.write(data);
        };
        
        ws.onclose = () => {
          ptyConnected = false;
          terminalStore.setConnected(false);
        };
        
        ws.onerror = (err) => {
          console.error('PTY WebSocket error:', err);
        };

        terminal.onData((data: string) => {
          ws.send(data);
        });

        terminal.onResize(({ cols, rows }: { cols: number; rows: number }) => {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        });

        terminalStore.setTerminal(terminal);
        terminalStore.setWebSocket(ws);
      } catch (err) {
        console.error('Failed to connect PTY:', err);
        terminal.writeln('PTY connection failed. Run npm run tauri dev for a live terminal.');
      }
    } else {
      terminal.writeln('Not running in Tauri. Run npm run tauri dev for a live terminal.');
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);

    return (): void => {
      resizeObserver.disconnect();
      terminal?.dispose();
      terminalStore.setTerminal(null);
    };
  }

  $effect(() => {
    if (tabsStore.activeTabId === tab.id && terminal) {
      terminal.focus();
    }
  });
</script>

<div class="terminal-tab" bind:this={container} tabindex="0"></div>

<style>
  .terminal-tab {
    width: 100%;
    height: 100%;
    background: var(--nil-void);
    overflow: hidden;
  }

  .terminal-tab :global(.xterm),
  .terminal-tab :global(.xterm-viewport),
  .terminal-tab :global(.xterm-screen) {
    background: var(--nil-void) !important;
  }
</style>