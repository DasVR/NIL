---
name: nil-components
description: NIL component primitives spec — bits-ui + our tokens. Buttons, inputs, cards, command palette, toasts, icons.
---

# NIL Components — Primitives Spec

All components built on **bits-ui** (headless) + **NIL tokens** from `app.css`. No Tailwind utility classes in components — use CSS custom properties.

---

## Button

```svelte
<script>
  import { Button as BitButton } from 'bits-ui';
  import { createEventDispatcher } from 'svelte';
  
  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let loading = false;
  export let disabled = false;
  
  const dispatch = createEventDispatcher();
</script>

<BitButton.Root 
  class="nil-button nil-button--{variant} nil-button--{size} {loading ? 'loading' : ''} {disabled ? 'disabled' : ''}"
  disabled={disabled}
  on:click={() => dispatch('click')}
>
  <BitButton.Text><slot /></BitButton.Text>
  {#if loading}
    <Spinner class="nil-button__spinner" />
  {/if}
</BitButton.Root>

<style>
  .nil-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--font-sans);
    font-weight: 500;
    border-radius: var(--radius-control);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color var(--spring-snappy),
                border-color var(--spring-snappy),
                color var(--spring-snappy),
                transform var(--spring-snappy);
  }
  
  /* Variants */
  .nil-button--primary {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
  }
  .nil-button--primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  .nil-button--primary:active:not(:disabled) {
    transform: scale(0.97);
  }
  
  .nil-button--secondary {
    background: var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border-color: var(--btn-secondary-border);
  }
  .nil-button--secondary:hover:not(:disabled) {
    background: var(--surface-hover);
  }
  
  .nil-button--ghost {
    background: var(--btn-ghost-bg);
    color: var(--btn-secondary-text);
  }
  .nil-button--ghost:hover:not(:disabled) {
    background: var(--btn-ghost-hover);
  }
  
  .nil-button--danger {
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
  }
  .nil-button--danger:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  
  /* Sizes */
  .nil-button--sm { padding: 6px 12px; font-size: var(--text-sm); height: 28px; }
  .nil-button--md { padding: 8px 16px; font-size: var(--text-sm); height: 36px; }
  .nil-button--lg { padding: 10px 20px; font-size: var(--text-base); height: 44px; }
  
  /* States */
  .nil-button:disabled,
  .nil-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .nil-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-abyss-0), 0 0 0 4px var(--accent-primary);
  }
  
  .nil-button__spinner {
    width: 16px; height: 16px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

---

## Input

```svelte
<script>
  import { Input as BitInput, Label as BitLabel } from 'bits-ui';
  export let label: string;
  export let type = 'text';
  export let placeholder = '';
  export let value = $bindable('');
  export let error: string;
</script>

<div class="nil-input-group">
  {#if label}
    <BitLabel.Root class="nil-input__label"><slot name="label">{label}</slot></BitLabel.Root>
  {/if}
  <BitInput.Root class="nil-input-wrapper">
    <BitInput.Text 
      class="nil-input"
      type={type}
      placeholder={placeholder}
      bind:value
      aria-invalid={!!error}
      aria-describedby={error ? 'error' : undefined}
    />
  </BitInput.Root>
  {#if error}
    <span id="error" class="nil-input__error">{error}</span>
  {/if}
</div>

<style>
  .nil-input-group { display: flex; flex-direction: column; gap: 4px; }
  .nil-input__label {
    font-size: var(--text-micro);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }
  .nil-input-wrapper { position: relative; }
  .nil-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-control);
    padding: 8px 12px;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    color: var(--input-text);
    transition: border-color var(--spring-snappy), box-shadow var(--spring-snappy);
  }
  .nil-input::placeholder { color: var(--input-placeholder); }
  .nil-input:hover:not(:disabled) { border-color: var(--surface-hover); }
  .nil-input:focus {
    outline: none;
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 20%, transparent);
  }
  .nil-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .nil-input[aria-invalid="true"] { border-color: var(--color-danger); }
  .nil-input__error { font-size: var(--text-xs); color: var(--color-danger); }
</style>
```

---

## Card (Glass)

```svelte
<script>
  export let tier: 1 | 2 | 3 | 4 = 2;
  export let padded = true;
  export let interactive = false;
</script>

<article class="nil-card nil-card--tier{tier} {padded ? 'padded' : ''} {interactive ? 'interactive' : ''}">
  <div class="nil-card__edge" />
  <slot />
</article>

<style>
  .nil-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
    position: relative;
  }
  .nil-card--tier1 { backdrop-filter: blur(32px) saturate(1.55); background: rgba(10,10,12,0.45); }
  .nil-card--tier2 { backdrop-filter: blur(24px) saturate(1.55); background: rgba(10,10,14,0.55); }
  .nil-card--tier3 { backdrop-filter: blur(16px) saturate(1.55); background: rgba(16,16,22,0.65); }
  .nil-card--tier4 { backdrop-filter: blur(12px) saturate(1.55); background: rgba(22,22,30,0.72); }
  
  .nil-card__edge {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    background: var(--glass-edge);
    -webkit-mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  
  .nil-card.padded { padding: 16px; }
  .nil-card.interactive {
    cursor: pointer;
    transition: background-color var(--spring-snappy), border-color var(--spring-snappy), transform var(--spring-snappy);
  }
  .nil-card.interactive:hover { background: var(--surface-hover); border-color: var(--accent-primary); }
  .nil-card.interactive:active { transform: scale(0.99); }
</style>
```

---

## Command Palette (cmdk-svelte)

```svelte
<script>
  import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from 'cmdk-svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let open = $bindable(false);
  export let items: { id: string; label: string; shortcut?: string; action: () => void; section?: string }[] = [];
  const dispatch = createEventDispatcher();
  
  function handleSelect(item) {
    item.action();
    open = false;
    dispatch('select', item);
  }
</script>

<Command {open} on:close={() => open = false}>
  <CommandInput placeholder="Search commands..." class="nil-command-input" />
  <CommandList class="nil-command-list">
    {#each [...new Set(items.map(i => i.section).filter(Boolean))] as section}
      <CommandGroup heading={section}>
        {#each items.filter(i => i.section === section) as item}
          <CommandItem on:select={() => handleSelect(item)}>
            <span class="nil-command-item__label">{item.label}</span>
            {#if item.shortcut}
              <kbd class="nil-command-item__shortcut">{item.shortcut}</kbd>
            {/if}
          </CommandItem>
        {/each}
      </CommandGroup>
    {/each}
    {#each items.filter(i => !i.section) as item}
      <CommandItem on:select={() => handleSelect(item)}>
        <span class="nil-command-item__label">{item.label}</span>
        {#if item.shortcut}
          <kbd class="nil-command-item__shortcut">{item.shortcut}</kbd>
        {/if}
      </CommandItem>
    {/each}
    <CommandEmpty>No commands found</CommandEmpty>
  </CommandList>
</Command>

<style>
  .nil-command-input {
    width: 100%; padding: 12px 16px;
    background: var(--surface-input);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel) var(--radius-panel) 0 0;
    font-family: var(--font-sans); font-size: var(--text-base);
    color: var(--text-primary);
  }
  .nil-command-input:focus { outline: none; border-color: var(--accent-primary); }
  .nil-command-list { max-height: 400px; overflow-y: auto; background: var(--surface-panel); border: 1px solid var(--surface-border); border-top: none; border-radius: 0 0 var(--radius-panel) var(--radius-panel); }
  .nil-command-item__label { font-size: var(--text-sm); }
  .nil-command-item__shortcut { font-family: var(--font-mono); font-size: var(--text-micro); color: var(--text-faint); }
</style>
```

---

## Toast (svelte-sonner + cuelume)

```svelte
<script>
  import { Toaster, toast } from 'svelte-sonner';
  import { playSound } from 'cuelume';
  
  export function notify(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    playSound(type === 'error' ? 'error' : type === 'success' ? 'success' : 'notification');
    toast[type](message, { class: 'nil-toast' });
  }
</script>

<Toaster 
  theme="dark"
  position="bottom-right"
  toastOptions={{
    class: 'nil-toast',
    duration: 4000,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-panel)',
      backdropFilter: 'blur(24px) saturate(1.55)',
      color: 'var(--text-primary)',
    },
    success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-abyss-0)' } },
    error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-abyss-0)' } },
  }}
/>
```

---

## Icons

| Package | Use For |
|---------|---------|
| `lucide-svelte` | Primary UI icons (2px stroke, 24px) |
| `morphicons` | Transitions (sidebar active, tool toggles) |
| `reicon` | Extended set (2700+), outline + filled |

```svelte
<!-- Example -->
<script>
  import { Folder, File, Terminal, Settings, ChevronRight } from 'lucide-svelte';
  import { morph } from 'morphicons';
</script>

<Folder class="nil-icon" size={16} />
<morph from="play" to="pause" class="nil-icon" size={20} duration={300} easing="spring-snappy" />

<style>
  .nil-icon { color: var(--text-secondary); flex-shrink: 0; }
  .nil-icon.primary { color: var(--accent-primary); }
  .nil-icon.danger { color: var(--color-danger); }
</style>
```

---

## Verification

Every component must:
1. Use only tokens from `app.css`
2. Pass `npm run check`
3. Work at 320px width
4. Have `prefers-reduced-motion` fallback
5. Have visible focus state (BorderBeam)
6. Use `@zag-js/svelte` for complex primitives (select, date-picker, slider, tabs)