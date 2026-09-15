<script lang="ts">
  import { droplet } from '$lib/motion/droplet';

  interface Props {
    checked?: boolean;
    label: string;
    description?: string;
    onChange?: (next: boolean) => void;
  }

  let { checked = false, label, description, onChange }: Props = $props();

  const uid = $props.id();
  const inputId = `${uid}-switch`;
  const labelId = `${uid}-label`;
  const descId = `${uid}-desc`;
</script>

<!-- The whole row is the <label>, so clicking the copy toggles too. The input
     is a native checkbox exposed as a switch: its name is the label text only
     (aria-labelledby), the description rides along as aria-describedby, so a
     screen reader hears "YOLO mode, switch, off" rather than the whole row. -->
<label class="row nil-row-host" class:on={checked} for={inputId} {@attach droplet}>
  <span class="info">
    <span class="label" id={labelId}>{label}</span>
    {#if description}
      <span class="desc" id={descId}>{description}</span>
    {/if}
  </span>
  <span class="toggle">
    <input
      id={inputId}
      type="checkbox"
      role="switch"
      {checked}
      aria-labelledby={labelId}
      aria-describedby={description ? descId : undefined}
      onchange={(e) => onChange?.(e.currentTarget.checked)}
    />
    <span class="knob" aria-hidden="true"></span>
  </span>
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    padding: var(--s-3) 0;
    border-bottom: 1px solid var(--nil-line);
    background: transparent;
    cursor: pointer;
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
    /* --dur-flip (90ms) is tuned for an instant state flip, not a 16px
       slide — at that duration the overshoot in --ease-pop has no time to
       visually resolve, so it reads as a snap instead of a settle.
       --dur-enter (160ms) gives the same curve room to actually play out. */
    transition: transform var(--dur-enter) var(--ease-pop),
                background var(--dur-enter) var(--ease-pop);
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
