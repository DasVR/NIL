<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState, MODEL_OPTIONS, type ComposerMode, type Effort } from '$lib/stores/appState.svelte.ts';
  import Icon from '@iconify/svelte';
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
  const efforts: { id: Effort; label: string }[] = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
  ];

  let modelMenuOpen = $state(false);
  let modelWrap: HTMLElement | undefined = $state();
  const activeModel = $derived(MODEL_OPTIONS.find((m) => m.id === appState.selectedModel) ?? MODEL_OPTIONS[0]);

  function pickModel(id: string) {
    appState.selectedModel = id;
    modelMenuOpen = false;
  }

  function onDocClick(e: MouseEvent) {
    if (modelMenuOpen && modelWrap && !modelWrap.contains(e.target as Node)) {
      modelMenuOpen = false;
    }
  }

  function onDocKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && modelMenuOpen) modelMenuOpen = false;
  }

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

  // Chip dismissal: shrink + fade together, never an instant disappearance.
  function chipExit(node: HTMLElement) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      duration: reduced ? 80 : 140,
      easing: cubicIn,
      css: (t: number) => `opacity: ${t}; transform: scale(${0.85 + t * 0.15});`,
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

<svelte:window onclick={onDocClick} onkeydown={onDocKeydown} />

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
  {#if appState.contextChips.length > 0}
    <div class="context-chips" role="group" aria-label="Attached context">
      {#each appState.contextChips as chip (chip.id)}
        <span class="context-chip" out:chipExit>
          <Icon icon="ph:file-bold" width="11" height="11" />
          <span class="context-chip-label">{chip.path}{chip.line ? `:${chip.line}` : ''}</span>
          <button
            type="button"
            class="context-chip-remove"
            aria-label={`Remove ${chip.path} from context`}
            onclick={() => appState.removeContextChip(chip.id)}
          >
            <Icon icon="ph:x-bold" width="9" height="9" />
          </button>
        </span>
      {/each}
    </div>
  {/if}
  <div class="toolbar">
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
            data-cuelume-toggle="tick"
            onclick={() => (appState.composerMode = m.id)}
          >{m.label}</button>
        </span>
      {/each}
    </div>

    <div class="model-wrap" bind:this={modelWrap}>
      <button
        type="button"
        class="nil-lift nil-halo model-chip"
        aria-haspopup="menu"
        aria-expanded={modelMenuOpen}
        aria-label={`Model: ${activeModel.name}. Open model picker`}
        onclick={() => (modelMenuOpen = !modelMenuOpen)}
      >
        <Icon icon="ph:cpu-bold" width="12" height="12" />
        {activeModel.name}
        <Icon icon="ph:caret-down-bold" width="10" height="10" />
      </button>

      {#if modelMenuOpen}
        <div class="model-picker" role="menu">
          <div class="model-picker-label">Model</div>
          {#each MODEL_OPTIONS as m}
            {@const active = m.id === appState.selectedModel}
            <button type="button" class="model-option" class:active role="menuitem" onclick={() => pickModel(m.id)}>
              <span class="model-option-text">
                <span class="model-option-name">{m.name}</span>
                <span class="model-option-desc">{m.description}</span>
              </span>
              {#if active}<Icon icon="ph:check-bold" width="13" height="13" />{/if}
            </button>
          {/each}
          <div class="model-picker-divider"></div>
          <div class="model-picker-label">Effort</div>
          <div class="effort-segment" role="group" aria-label="Effort">
            {#each efforts as e}
              {@const active = appState.effort === e.id}
              <button
                type="button"
                class="effort-option"
                class:active
                aria-pressed={active}
                onclick={() => (appState.effort = e.id)}
              >{e.label}</button>
            {/each}
          </div>
          <button type="button" class="model-more" disabled title="More models — coming soon">
            More models
          </button>
        </div>
      {/if}
    </div>
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
    <button
      type="button"
      class="nil-lift nil-halo mic"
      disabled
      aria-label="Voice input (coming soon)"
      title="Voice input — coming soon"
    >
      <Icon icon="ph:waveform-bold" width="14" height="14" />
    </button>
    <button
      class="nil-lift nil-halo send"
      type="button"
      onclick={send}
      disabled={!input.trim() || agentRun.running || gated}
      data-cuelume-press
      data-cuelume-release="whisper"
    >
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

  .context-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .context-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 22px;
    padding: 0 6px 0 8px;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-chip);
    background: var(--nil-raised);
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-machine);
  }

  .context-chip-label {
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .context-chip-remove {
    display: grid;
    place-items: center;
    width: 14px;
    height: 14px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }

  .context-chip-remove:hover {
    color: var(--nil-ink);
    background: var(--nil-void);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-2);
  }

  .modes {
    display: flex;
    gap: 4px;
  }

  .model-wrap {
    position: relative;
  }

  .model-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 22px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
    transition: color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }

  .model-chip:hover {
    color: var(--nil-ink);
    background: var(--nil-raised);
  }

  .model-picker {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    z-index: var(--z-overlay);
    width: 240px;
    padding: var(--s-2);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-panel);
    box-shadow: var(--lift-2);
    color: var(--nil-ink);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .model-picker-label {
    padding: 4px 6px 2px;
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }

  .model-picker-divider {
    height: 1px;
    background: var(--nil-line);
    margin: 6px 2px;
  }

  .model-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-2);
    padding: 6px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--nil-ink);
    text-align: left;
    cursor: pointer;
    transition: background-color var(--dur-flip) var(--ease-out);
  }

  .model-option:hover {
    background: var(--nil-raised);
  }

  .model-option.active {
    color: var(--nil-ink);
  }

  .model-option-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .model-option-name {
    font: 500 var(--t-meta)/1.2 var(--font-ui);
  }

  .model-option-desc {
    font: var(--t-micro)/1.2 var(--font-ui);
    color: var(--nil-ink-3);
  }

  .effort-segment {
    display: flex;
    gap: 2px;
    padding: 2px;
    margin: 0 2px;
    border-radius: var(--radius-control);
    background: var(--nil-void);
  }

  .effort-option {
    flex: 1;
    height: 22px;
    border: none;
    border-radius: calc(var(--radius-control) - 2px);
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
    transition: background-color var(--dur-flip) var(--ease-out),
                color var(--dur-flip) var(--ease-out);
  }

  .effort-option.active {
    background: var(--nil-raised);
    color: var(--nil-ink);
    box-shadow: 0 0 0 1px var(--nil-line-hot) inset;
  }

  .model-more {
    margin-top: 4px;
    padding: 6px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--nil-ink-3);
    font: var(--t-meta)/1 var(--font-ui);
    text-align: left;
    cursor: not-allowed;
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
