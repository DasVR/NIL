<script>
  import { onMount } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import { appState } from '$lib/stores.svelte';
  import '@xterm/xterm/css/xterm.css';

  let host;
  let term;
  let seen = 0;

  onMount(() => {
    const fit = new FitAddon();
    term = new Terminal({
      theme: { background: '#050507', foreground: '#e0e0e0', cursor: '#00d992' },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      convertEol: true
    });
    term.loadAddon(fit);
    term.open(host);
    fit.fit();
    const tick = setInterval(() => {
      while (seen < appState.termLines.length) {
        term.writeln(appState.termLines[seen]);
        seen += 1;
      }
    }, 250);
    return () => {
      clearInterval(tick);
      term.dispose();
    };
  });
</script>

<div class="term" bind:this={host}></div>

<style>
  .term {
    height: 160px;
    background: #050507;
    border-top: 1px solid #1c1c28;
    padding: 0.3rem;
  }
</style>
