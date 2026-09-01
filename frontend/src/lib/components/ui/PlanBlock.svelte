<script lang="ts">
  import type { AgentPlanStep } from '$lib/stores/agentStore';

  let { plan = [] }: { plan: AgentPlanStep[] } = $props();

  function getStatusIcon(status: string) {
    switch (status) {
      case 'done': return '✅';
      case 'running': return '🔄';
      case 'pending': return '⏳';
    }
  }

  function getStatusClass(status: string) {
    return `plan-step--${status}`;
  }
</script>

<div class="plan-block" role="region" aria-label="Agent plan">
  <div class="plan-header">
    <span class="plan-title">Plan</span>
    <span class="plan-progress">{plan.filter(s => s.status === 'done').length} / {plan.length}</span>
  </div>

  <ol class="plan-steps">
    {#each plan as step, i}
      <li class="plan-step {getStatusClass(step.status)}" role="listitem">
        <span class="plan-step-icon" aria-hidden="true">{getStatusIcon(step.status)}</span>
        <div class="plan-step-content">
          <span class="plan-step-label">{step.label}</span>
          {#if step.detail}
            <span class="plan-step-detail">{step.detail}</span>
          {/if}
        </div>
        {#if step.status === 'running'}
          <span class="plan-step-spinner" aria-hidden="true"></span>
        {/if}
      </li>
    {/each}
  </ol>

  {#if plan.length === 0}
    <div class="plan-empty">
      <p>No plan yet</p>
      <span>Agent will create a plan when started</span>
    </div>
  {/if}
</div>

<style>
  .plan-block {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
  }

  .plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    background: var(--surface-hover);
    border-bottom: 1px solid var(--surface-border);
  }

  .plan-title {
    font-size: var(--font-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
  }

  .plan-progress {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .plan-steps {
    list-style: none;
    margin: 0;
    padding: var(--space-1) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .plan-step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: var(--radius-control);
    transition: background var(--spring-snappy);
  }

  .plan-step:hover {
    background: var(--surface-hover);
  }

  .plan-step--done {
    opacity: 0.7;
  }

  .plan-step--running {
    background: var(--accent-soft);
  }

  .plan-step--pending {
    opacity: 0.5;
  }

  .plan-step-icon {
    font-size: 14px;
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  .plan-step-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .plan-step-label {
    font-size: var(--font-xs);
    font-weight: 400;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .plan-step-detail {
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .plan-step-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--surface-border);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .plan-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    gap: var(--space-1);
    color: var(--text-tertiary);
    text-align: center;
  }

  .plan-empty p {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .plan-empty span {
    font-size: var(--font-2xs);
  }
</style>