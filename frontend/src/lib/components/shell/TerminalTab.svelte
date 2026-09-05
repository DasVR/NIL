<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { terminalStore } from '$lib/stores/terminalStore.svelte.ts';
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
      // Ink-derived, reusing the workstation severity ramp for ANSI semantics
      // instead of a brand palette — see 00-nil-design-language.mdc Law 1.
      theme: {
        background: '#08090a',
        foreground: '#e8e6e3',
        cursor: '#e8e6e3',
        selectionBackground: 'rgba(232, 230, 227, 0.18)',
        black: '#0e1011',
        red: '#e5484d',
        green: '#9aa0a4',
        yellow: '#d9b341',
        blue: '#5c9ead',
        magenta: '#6b7175',
        cyan: '#9aa0a4',
        white: '#e8e6e3',
        brightBlack: '#3a4043',
        brightRed: '#f2666b',
        brightGreen: '#b5bcc1',
        brightYellow: '#e6c169',
        brightBlue: '#7fb8cf',
        brightMagenta: '#9aa0a4',
        brightCyan: '#b5bcc1',
        brightWhite: '#f5f4f1',
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