<script lang="ts">
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import { droplet } from '$lib/motion/droplet';

  const effort = ['low', 'medium', 'high'] as const;
</script>

<div class="settings-pane">
  <h3>Agent</h3>
  <p class="settings-description">
    Models come from the API provider list. Mode prompts ship with the harness. The picker is sent with each turn. The harness still uses the enabled provider until it reads that field.
  </p>
  <div class="settings-group">
    <h4>Models</h4>
    {#each workspace.models as m (m.id)}
      <button
        class="settings-row pick nil-halo"
        type="button"
        aria-pressed={m.id === workspace.modelId}
        {@attach droplet}
        onclick={() => (workspace.modelId = m.id)}
      >
        <span class="copy">
          <span class="mode">{m.name}</span>
          <span class="desc">{m.description}</span>
        </span>
        {#if m.id === workspace.modelId}
          <span class="check"><NilIcon name="check" size={16} /></span>
        {/if}
      </button>
    {/each}
  </div>
  <div class="settings-group">
    <h4>Effort</h4>
    <div class="effort" role="group" aria-label="Effort">
      {#each effort as level}
        <button
          class="eff nil-halo"
          class:on={workspace.effort === level}
          type="button"
          onclick={() => (workspace.effort = level)}
        >{level}</button>
      {/each}
    </div>
  </div>
  <div class="settings-group">
    <h4>Modes</h4>
    <div class="settings-row">
      <span class="mode">hunt</span>
      <span>Recon and evidence</span>
    </div>
    <div class="settings-row">
      <span class="mode">exploit</span>
      <span>Confirm findings with in-scope proofs</span>
    </div>
    <div class="settings-row">
      <span class="mode">chat</span>
      <span>Questions against the engagement</span>
    </div>
    <div class="settings-row">
      <span class="mode">code</span>
      <span>Payloads and scripts</span>
    </div>
    <div class="settings-row">
      <span class="mode">report</span>
      <span>Write-up from findings</span>
    </div>
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font: 600 var(--t-micro)/1 var(--font-ui); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--nil-line); font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); gap: var(--s-3); }
  .settings-row span.mode { font-family: var(--font-machine); color: var(--nil-ink-2); }
  .pick {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }
  .copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .desc { font: var(--t-micro)/1.3 var(--font-ui); color: var(--nil-ink-3); }
  .check { color: var(--nil-ink); display: grid; place-items: center; }
  .effort { display: flex; gap: 6px; }
  .eff {
    height: 24px;
    padding: 0 8px;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
  }
  .eff.on { color: var(--nil-ink); border-color: var(--nil-line-hot); background: var(--nil-raised); }
</style>
