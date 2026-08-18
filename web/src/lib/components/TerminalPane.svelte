<script>
  import { onMount } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import { appState } from '$lib/stores.svelte';
  import '@xterm/xterm/css/xterm.css';

  let { height = '100%' } = $props();
  let host;
  let term;
  let seen = 0;
  let fit;

  function getFontSize() {
    return Number(localStorage.getItem('finn.terminal.fontSize')) || 13;
  }

  onMount(() => {
    fit = new FitAddon();
    term = new Terminal({
      theme: {
        background: '#050507',
        foreground: '#e0e0e0',
        cursor: '#00d992',
        cursorAccent: '#050507',
        selectionBackground: 'rgba(0, 217, 146, 0.25)',
        black: '#1a1a1a',
        red: '#ff453a',
        green: '#00d992',
        yellow: '#ff9f0a',
        blue: '#64d2ff',
        magenta: '#bf5af2',
        cyan: '#5ac8fa',
        white: '#e0e0e0'
      },
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      fontSize: getFontSize(),
      lineHeight: 1.4,
      cursorBlink: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: true,
      convertEol: true
    });
    term.loadAddon(fit);
    term.open(host);
    fit.fit();

    const observer = new ResizeObserver(() => {
      fit.fit();
    });
    observer.observe(host);

    const tick = setInterval(() => {
      while (seen < appState.termLines.length) {
        term.writeln(appState.termLines[seen]);
        seen += 1;
      }
    }, 250);

    const onStorage = (e) => {
      if (e.key === 'finn.terminal.fontSize') {
        term.options.fontSize = Number(e.newValue) || 13;
        fit.fit();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(tick);
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
      term.dispose();
    };
  });
</script>

<section class="terminal-pane" role="region" aria-label="Terminal" style="height: {height}">
  <div class="terminal-host" bind:this={host}></div>
</section>

<style>
  .terminal-pane {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--abyss);
    position: relative;
  }

  .terminal-host {
    flex: 1;
    padding: 6px 12px;
    overflow: hidden;
  }

  .terminal-host :global(.xterm) {
    height: 100%;
  }

  .terminal-host :global(.xterm-viewport) {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  .terminal-host :global(.xterm-viewport::-webkit-scrollbar) {
    width: 6px;
  }

  .terminal-host :global(.xterm-viewport::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
</style>
