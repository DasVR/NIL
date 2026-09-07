<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';
  import ApprovalBlock from '$lib/components/ui/ApprovalBlock.svelte';
  import { cubicIn } from 'svelte/easing';

  interface Props {
    inputEl?: HTMLTextAreaElement;
  }

  let { inputEl = $bindable() }: Props = $props();

  let input = $state('');
  const modes: { id: ComposerMode; label: string }[] = [
    { id: 'hunt', label: 'hunt' },
    { id: 'exploit', label: 'exploit' },
    { id: 'chat', label: 'chat' },
    { id: 'code', label: 'code' },
    { id: 'report', label: 'report' },
  ];

  const pending = $derived(agentRun.pendingApproval);
  const gated = $derived(Boolean(pending));

  const placeholder = $derived(
    gated
      ? 'Allow or deny the pending command'
      : appState.composerMode === 'exploit'
        ? 'Name the in-scope finding to confirm'
        : 'Describe the next step',
  );

  // Gate resolution exit: element-out = --dur-enter (160ms) + --ease-in, opacity +
  // translateY only (Law 3). Reduced motion keeps the opacity fade at 80ms, per the
  // motion.css contract (state stays legible, travel is killed).
  function gateExit(node: HTMLElement) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = reduced ? 80 : 160;
    return {
      duration: t0,
      easing: cubicIn,
      css: (t: number) =>
        `opacity: ${t};${reduced ? '' : ` transform: translateY(${(1 - t) * 4}px);`}`,
    };
  }

  function send() {
    const text = input.trim();
    if (!text || gated) return;
    agentRun.sendMessage(text, appState.activeEngagementId || 'default', appState.composerMode);
    input = '';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }
</script>

<div class="composer nil-scan" data-state={agentRun.running ? 'working' : undefined}>
  <!-- Charter amendment 2026-09-07: Law 3 exception. The goo surface applies ONLY
       to chip background layers (.chip-bg). Labels live in the buttons above the
       filtered layer and are never blurred. -->
  <svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
    <defs>
      <filter id="nil-goo-surface">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
  <div class="modes" role="group" aria-label="Agent mode">
    {#each modes as m}
      {@const active = appState.composerMode === m.id}
      <span class="chip-slot">
        <i class="chip-bg" data-on={active} aria-hidden="true"></i>
        <button
          type="button"
          class="nil-halo chip"
          class:on={active}
          aria-pressed={active}
          onclick={() => (appState.composerMode = m.id)}
        >{m.label}</button>
      </span>
    {/each}
  </div>
  {#if pending}
    <div class="gate-host" out:gateExit>
      <ApprovalBlock step={pending} />
    </div>
  {/if}
  <div class="row">
    <span class="gt" aria-hidden="true">&gt;</span>
    <textarea
      id="agent-composer"
      bind:this={inputEl}
      bind:value={input}
      onkeydown={onKey}
      rows="1"
      aria-label="Agent input"
      placeholder={placeholder}
      disabled={gated}
    ></textarea>
    <button class="nil-lift nil-halo send" type="button" onclick={send} disabled={!input.trim() || agentRun.running || gated}>
      Send <kbd aria-hidden="true">↵</kbd>
    </button>
  </div>
</div>

<style>
  .composer {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    padding: var(--s-2) var(--s-3);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-1);
    flex-shrink: 0;
    transition: border-color var(--dur-flip) var(--ease-out);
    position: relative;
    isolation: isolate;
  }

  .composer:focus-within {
    border-color: var(--nil-line-hot);
  }

  /* Charter amendment 2026-09-07 — Law 1 exception (single sanctioned use):
     a 1px chromatic dispersion ring exists ONLY under :focus-within on the command
     deck, to disambiguate input capture in low light. Never rendered at rest;
     compositor-driven rotation via @property; static ring under reduced motion. */
  @property --prism-angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }
  .composer::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-panel);
    padding: 1px; /* the ring's width */
    background: conic-gradient(from var(--prism-angle),
      #00f0ff, #7000ff, #ffaa00, #4d7cff, #00f0ff);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity var(--dur-flip) var(--ease-out);
    animation: nil-prism-spin 6s linear infinite;
    animation-play-state: paused;
    will-change: transform;
    pointer-events: none;
  }
  .composer:focus-within::before {
    opacity: 1;
    animation-play-state: running;
  }
  @keyframes nil-prism-spin {
    to { --prism-angle: 360deg; }
  }
  @media (prefers-reduced-motion: reduce) {
    .composer::before { animation: none; } /* static ring; focus stays legible */
  }

  .modes {
    display: flex;
    gap: 4px;
  }

  .chip-slot {
    position: relative;
    display: inline-flex;
  }

  /* Filtered background layer — the ONLY thing the goo surface touches. */
  .chip-bg {
    position: absolute;
    inset: 0;
    border: 1px solid transparent;
    border-radius: var(--r-chip);
    filter: url(#nil-goo-surface);
    pointer-events: none;
    transition: border-color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }
  .chip-bg[data-on="true"] {
    border-color: var(--nil-line-hot);
    background: var(--nil-raised);
  }

  /* Labels sit above the filtered layer, unblurred. */
  .chip {
    position: relative;
    height: 22px;
    padding: 0 8px;
    border: none;
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    cursor: pointer;
    transition: color var(--dur-flip) var(--ease-out),
                transform var(--dur-flip) var(--ease-out);
  }

  .chip:active {
    transform: scale(0.96); /* tactile micro-press */
  }

  .chip.on {
    color: var(--nil-ink);
  }

  .row {
    display: flex;
    align-items: flex-end;
    gap: var(--s-2);
  }

  .gt {
    font: var(--t-body)/1.6 var(--font-machine);
    color: var(--nil-ink-3);
    padding-block-end: 2px;
  }

  textarea {
    flex: 1;
    min-height: 28px;
    max-height: 96px;
    padding: 6px 0;
    border: 0;
    background: transparent;
    color: var(--nil-ink);
    font: var(--t-body)/1.45 var(--font-ui);
    resize: none;
    outline: none;
  }

  textarea:disabled { color: var(--nil-ink-3); }

  .send {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .send:disabled { opacity: 0.4; cursor: not-allowed; }

  .send kbd {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-2); /* AA on --nil-raised; hints are control information */
  }
</style>
