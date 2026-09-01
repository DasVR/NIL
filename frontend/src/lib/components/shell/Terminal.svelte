<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface TerminalProps {
    className?: string;
    autoFocus?: boolean;
  }

  let { className = '', autoFocus = true }: TerminalProps = $props();

  let container: HTMLDivElement;
  let term: any;

  onMount(() => {
    if (!browser || !container) return;

    Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
      import('@xterm/addon-webgl')
    ]).then(([{ Terminal: XTerm }, { FitAddon }, { WebglAddon }]) => {
      term = new XTerm({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        theme: {
          background: '#050507',
          foreground: '#c9c8d0',
          cursor: '#a9b1f0',
          cursorAccent: '#050507',
          selectionBackground: 'rgba(169, 177, 240, 0.22)',
          black: '#050507',
          red: '#fe6f69',
          green: '#00d992',
          yellow: '#e8c468',
          blue: '#a9b1f0',
          magenta: '#c98ef4',
          cyan: '#7fd8e0',
          white: '#c9c8d0',
          brightBlack: '#4a4760',
          brightRed: '#ff8c85',
          brightGreen: '#2ff0ad',
          brightYellow: '#f2d489',
          brightBlue: '#c6ccff',
          brightMagenta: '#dcA5ff',
          brightCyan: '#9ff0f5',
          brightWhite: '#f2f1f7'
        }
      });

      const fit = new FitAddon();
      term.loadAddon(fit);

      try {
        const webgl = new WebglAddon();
        term.loadAddon(webgl);
      } catch {
        /* WebGL may be unavailable; core terminal still works */
      }

      term.open(container);
      fit.fit();

      term.writeln('\x1b[35mNIL\x1b[0m · terminal-first coding agent');
      term.writeln('\x1b[90mpress \x1b[0m\x1b[33m⌘K\x1b[0m\x1b[90m for commands · \x1b[0m\x1b[33m⌘J\x1b[0m\x1b[90m for AI strip\x1b[0m');
      term.write('\x1b[36m❯\x1b[0m ');

      term.onData((data: string) => {
        term.write(data);
      });

      if (autoFocus) {
        container.querySelector('.xterm')?.dispatchEvent(new Event('click'));
      }
    });

    return () => {
      term?.dispose();
    };
  });
</script>

<link rel="stylesheet" href="/_app/immutable/assets/xterm.css" />

<div
  class="terminal {className}"
  bind:this={container}
  role="region"
  aria-label="Terminal"
></div>

<style>
  .terminal {
    flex: 1;
    min-height: 0;
    background: var(--surface-0);
    font: var(--type-mono);
    height: 100%;
    padding: var(--space-3);
  }
  .terminal :global(.xterm) {
    height: 100%;
  }
</style>
