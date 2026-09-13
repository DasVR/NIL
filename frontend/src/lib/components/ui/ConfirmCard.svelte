<script lang="ts">
  interface Props {
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    title = 'Continue?',
    body = '',
    confirmLabel = 'Continue',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  }: Props = $props();
</script>

<div class="card" role="alertdialog" aria-label={title} aria-modal="true">
  <h2>{title}</h2>
  {#if body}
    <p>{body}</p>
  {/if}
  <div class="actions">
    <button class="nil-lift nil-halo ghost" type="button" onclick={onCancel}>{cancelLabel}</button>
    <button class="nil-lift nil-halo nil-pulse go" type="button" onclick={onConfirm}>{confirmLabel}</button>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-4);
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-card);
    box-shadow: var(--lift-1);
  }
  h2 { margin: 0; font: 500 var(--t-lead)/var(--lh-tight) var(--font-ui); color: var(--nil-ink); }
  p { margin: 0; font: var(--t-body)/var(--lh-body) var(--font-ui); color: var(--nil-ink-2); }
  .actions { display: flex; justify-content: flex-end; gap: var(--s-2); }
  .ghost, .go {
    height: 28px;
    padding: 0 var(--s-3);
    border-radius: var(--r-field);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
  .ghost {
    border: 1px solid var(--nil-line);
    background: transparent;
    color: var(--nil-ink-2);
  }
  .go {
    border: 1px solid var(--nil-line-hot);
    background: var(--nil-raised);
    color: var(--nil-ink);
  }
</style>
