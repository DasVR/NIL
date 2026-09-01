<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore } from '$lib/stores/agentStore';
  import Icon from '@iconify/svelte';
  import ToolBlock from '$lib/components/ui/ToolBlock.svelte';
  import PlanBlock from '$lib/components/ui/PlanBlock.svelte';

  let blocks = $derived(agentStore.blocks);
  let plan = $derived(agentStore.plan);

  onMount(() => {
    // Scroll to bottom when new blocks added
    const container = document.querySelector('.running-blocks');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div class="ai-strip-running">
  <div class="running-header">
    <div class="running-status">
      <span class="status-indicator running"></span>
      <span class="status-text">Agent running...</span>
      <span class="status-cost">~$0.003 this run</span>
    </div>
    <button class="running-cancel-btn" onclick={() => agentStore.cancel()} aria-label="Cancel">
      <Icon icon="ph:x-bold" width="16" height="16" />
      <span>Cancel</span>
    </button>
  </div>

  <div class="running-plan">
    <PlanBlock {plan} />
  </div>

  <div class="running-blocks" role="log" aria-live="polite">
    {#each blocks as block}
      <ToolBlock {block} />
    {/each}
    {#if blocks.length === 0}
      <div class="running-empty">
        <Icon icon="ph:gear-six-bold" width="24" height="24" />
        <p>Waiting for agent...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-strip-running {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
    overflow: hidden;
  }

  .running-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    flex-shrink: 0;
  }

  .running-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-indicator.running {
    background: var(--accent-primary);
    animation: pulse 1.5s var(--spring-bouncy) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }

  .status-text {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
  }

  .status-cost {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .running-cancel-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-card);
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .running-cancel-btn:hover {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: var(--color-abyss-0);
  }

  .running-plan {
    flex-shrink: 0;
  }

  .running-blocks {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-right: var(--space-1);
  }

  .running-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 120px;
    gap: var(--space-2);
    color: var(--text-tertiary);
    text-align: center;
  }

  .running-empty p {
    font-size: var(--font-xs);
    color: var(--text-secondary);
  }
</style>