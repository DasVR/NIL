<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState } from '$lib/stores/appState.svelte.ts';

  type Mode = 'hunt' | 'chat' | 'code' | 'report';

  interface Props {
    inputEl?: HTMLTextAreaElement;
  }

  let { inputEl = $bindable() }: Props = $props();

  let input = $state('');
  let mode = $state<Mode>('hunt');

  const modes: { id: Mode; label: string }[] = [
    { id: 'hunt', label: 'hunt' },
    { id: 'chat', label: 'chat' },
    { id: 'code', label: 'code' },
    { id: 'report', label: 'report' },
  ];

  function send() {
    const text = input.trim();
    if (!text) return;
    agentRun.sendMessage(text, appState.activeEngagementId || 'default', mode);
    input = '';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }
</script>

<div class="composer">
  <div class="modes" role="group" aria-label="Agent mode">
    {#each modes as m}
      <button
        type="button"
        class="nil-halo chip"
        class:on={mode === m.id}
        aria-pressed={mode === m.id}
        onclick={() => (mode = m.id)}
      >{m.label}</button>
    {/each}
  </div>
  <div class="row">
    <span class="gt" aria-hidden="true">&gt;</span>
    <textarea
      id="agent-composer"
      bind:this={inputEl}
      bind:value={input}
      onkeydown={onKey}
      rows="1"
      aria-label="Agent input"
      placeholder="Describe the next step"
    ></textarea>
    <button class="nil-lift nil-halo send" type="button" onclick={send} disabled={!input.trim() || agentRun.running}>
      Send
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
  }

  .modes {
    display: flex;
    gap: 4px;
  }

  .chip {
    height: 22px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-3);
    font: 500 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    cursor: pointer;
  }

  .chip.on {
    color: var(--nil-ink);
    border-color: var(--nil-line-hot);
    background: var(--nil-raised);
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

  textarea::placeholder { color: var(--nil-ink-4); }

  .send {
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
</style>
