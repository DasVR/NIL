<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { appState } from '$lib/stores/appState';
  import { terminalStore } from '$lib/stores/terminalStore';
  import { tabsStore } from '$lib/stores/tabsStore';

  interface Props {
    tab: { id: string; type: string; label: string; dirty: boolean };
  }

  let { tab }: Props = $props();

  let container: HTMLDivElement;
  let terminal: any;
  let fitAddon: any;
  let webglAddon: any;
  let ptyConnected = $state(false);

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

    terminal = new Terminal({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.45,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#050507',
        foreground: '#e8e8e6',
        cursor: '#452a84',
        selectionBackground: 'rgba(169, 177, 240, 0.3)',
        black: '#0a0a0c',
        red: '#ff5c5c',
        green: '#5cff8a',
        yellow: '#ffb454',
        blue: '#5cb8ff',
        magenta: '#a9b1f0',
        cyan: '#5cb8ff',
        white: '#e8e8e6',
        brightBlack: '#3a3a36',
        brightRed: '#ff5c5c',
        brightGreen: '#5cff8a',
        brightYellow: '#ffb454',
        brightBlue: '#5cb8ff',
        brightMagenta: '#a9b1f0',
        brightCyan: '#5cb8ff',
        brightWhite: '#f5f2ec',
      },
      allowTransparency: true,
      convertEol: true,
      scrollback: 10000,
    });

    fitAddon = new FitAddon();
    webglAddon = new WebglAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webglAddon);

    terminal.open(container);
    fitAddon.fit();

    // Connect to PTY via Tauri
    if ((window as any).__TAURI__) {
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

        terminal.onResize(({ cols, rows }: any) => {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        });

        terminalStore.setTerminal(terminal);
        terminalStore.setWebSocket(ws);
      } catch (err) {
        console.error('Failed to connect PTY:', err);
        terminal.writeln('\r\n\x1b[33m[!] PTY connection failed. Run "npm run tauri dev" for full terminal.\x1b[0m\r\n');
        terminal.writeln('$ ');
      }
    } else {
      terminal.writeln('\r\n\x1b[33m[!] Not running in Tauri. Run "npm run tauri dev" for full terminal.\x1b[0m\r\n');
      terminal.writeln('$ ');
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
    background: var(--color-abyss-0);
    overflow: hidden;
  }

  .terminal-tab :global(.xterm) {
    background: var(--color-abyss-0) !important;
  }

  .terminal-tab :global(.xterm-viewport) {
    background: var(--color-abyss-0) !important;
  }

  .terminal-tab :global(.xterm-screen) {
    background: var(--color-abyss-0) !important;
  }

  .terminal-tab :global(.xterm-helpers) {
    background: var(--color-abyss-0) !important;
  }

  .terminal-tab :global(.xterm-cursor) {
    background: var(--accent-primary) !important;
  }

  .terminal-tab :global(.xterm-cursor.blink) {
    animation: xterm-cursor-blink 1s step-end infinite;
  }

  @keyframes xterm-cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
</style>