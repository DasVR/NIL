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
        // Ink-derived, reusing the workstation severity ramp for ANSI semantics
        // instead of a brand palette — see 00-nil-design-language.mdc Law 1.
        theme: {
          background: '#08090a',
          foreground: '#e8e6e3',
          cursor: '#e8e6e3',
          cursorAccent: '#08090a',
          selectionBackground: 'rgba(232, 230, 227, 0.16)',
          black: '#08090a',
          red: '#e5484d',
          green: '#9aa0a4',
          yellow: '#e8833a',
          blue: '#5c9ead',
          magenta: '#6b7175',
          cyan: '#9aa0a4',
          white: '#e8e6e3',
          brightBlack: '#3a4043',
          brightRed: '#f2666b',
          brightGreen: '#b5bcc1',
          brightYellow: '#f0a563',
          brightBlue: '#7fb8cf',
          brightMagenta: '#9aa0a4',
          brightCyan: '#b5bcc1',
          brightWhite: '#f5f4f1'
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
