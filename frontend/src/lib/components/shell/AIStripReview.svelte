<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore } from '$lib/stores/agentStore';
  import Icon from '@iconify/svelte';
  import DiffBlock from '$lib/components/ui/DiffBlock.svelte';
  import ApprovalBlock from '$lib/components/ui/ApprovalBlock.svelte';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';

  let blocks = $derived(agentStore.blocks);
  let pendingApproval = $derived(agentStore.pendingApproval);
  let findings = $derived(agentStore.findings);

  onMount(() => {
    const container = document.querySelector('.review-blocks');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div class="ai-strip-review">
  <div class="review-header">
    <div class="review-title">Review Changes</div>
    <div class="review-actions">
      <button class="icon-btn" aria-label="Accept all" title="Accept All (Cmd+Shift+A)">
        <Icon icon="ph:check-bold" width="16" height="16" />
      </button>
      <button class="icon-btn" aria-label="Reject all" title="Reject All (Cmd+Shift+R)">
        <Icon icon="ph:x-bold" width="16" height="16" />
      </button>
    </div>
  </div>

  <div class="review-blocks" role="log" aria-live="polite">
    {#if pendingApproval}
      <ApprovalBlock {pendingApproval} />
    {/if}

    {#each blocks as block}
      {#if block.type === 'diff'}
        <DiffBlock block={{
          id: block.id,
          file: block.file || 'untitled',
          oldContent: block.oldContent || '',
          newContent: block.newContent || '',
          language: block.language
        }} />
      {:else if block.type === 'finding'}
        <FindingCard 
          finding={{
            id: block.id,
            title: block.finding?.title || 'Finding',
            severity: block.finding?.severity || 'info',
            cvss: block.finding?.cvss || '0.0',
            date: block.finding?.date || new Date().toISOString().split('T')[0],
            description: block.finding?.description || block.output || '',
            evidence: block.finding?.evidence || '',
            remediation: block.finding?.remediation || ''
          }}
        />
      {/if}
    {/each}

    {#if !pendingApproval && blocks.length === 0}
      <div class="review-empty">
        <Icon icon="ph:clipboard-text-bold" width="24" height="24" />
        <p>No changes to review</p>
        <span>Agent output will appear here</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-strip-review {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
    overflow: hidden;
  }

  .review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    flex-shrink: 0;
  }

  .review-title {
    font-size: var(--font-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
  }

  .review-actions {
    display: flex;
    gap: 2px;
  }

  .review-blocks {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-right: var(--space-1);
  }

  .review-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    gap: var(--space-2);
    color: var(--text-tertiary);
    text-align: center;
  }

  .review-empty p {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .review-empty span {
    font-size: var(--font-2xs);
  }
</style>