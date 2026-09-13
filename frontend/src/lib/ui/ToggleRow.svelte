<script lang="ts">
  interface Props {
    checked?: boolean;
    label: string;
    description?: string;
    onChange?: (next: boolean) => void;
  }

  let { checked = false, label, description, onChange }: Props = $props();
</script>

<div class="row nil-row-host" class:on={checked}>
  <div class="info">
    <span class="label">{label}</span>
    {#if description}
      <span class="desc">{description}</span>
    {/if}
  </div>
  <label class="toggle">
    <input
      type="checkbox"
      {checked}
      onchange={(e) => onChange?.(e.currentTarget.checked)}
    />
    <span class="knob"></span>
  </label>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    padding: var(--s-3) 0;
    border-bottom: 1px solid var(--nil-line);
    background: transparent;
  }
  .info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .label {
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink-2);
    transform: scale(1);
    transform-origin: left center;
    transition: color var(--dur-flip) var(--ease-pop),
                transform var(--dur-flip) var(--ease-pop);
  }
  .row.on .label {
    color: var(--nil-ink);
    transform: scale(1.04);
  }
  .desc { font: var(--t-micro)/1.4 var(--font-ui); color: var(--nil-ink-3); }

  .toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .knob {
    position: absolute;
    inset: 0;
    background: var(--nil-line);
    border-radius: 10px;
    cursor: pointer;
    transition: background var(--dur-flip) var(--ease-pop);
  }
  .knob::before {
    content: "";
    position: absolute;
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background: var(--nil-ink-3);
    border-radius: 50%;
    transition: transform var(--dur-flip) var(--ease-pop),
                background var(--dur-flip) var(--ease-pop);
  }
  .toggle input:checked + .knob { background: var(--nil-ink-2); }
  .toggle input:checked + .knob::before {
    transform: translateX(16px);
    background: var(--nil-void);
  }
  .toggle input:focus-visible + .knob {
    outline: 2px solid var(--nil-halo);
    outline-offset: 2px;
  }
</style>
