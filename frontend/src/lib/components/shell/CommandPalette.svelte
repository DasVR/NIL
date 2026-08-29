<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Command {
    id: string;
    label: string;
    icon?: string;
    hint?: string;
    category?: string;
    action: () => void;
  }

  interface CommandPaletteProps {
    open?: boolean;
    commands?: Command[];
    onClose?: () => void;
    className?: string;
  }

  let {
    open = false,
    commands = [],
    onClose = () => {},
    className = ''
  }: CommandPaletteProps = $props();

  let query = $state('');
  let listEl = $state<HTMLUListElement | undefined>();
  let activeIndex = $state(0);

  const filtered = $derived(
    query
      ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
      : commands
  );

  function run(cmd: Command) {
    cmd.action();
    onClose();
    query = '';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      query = '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      run(filtered[activeIndex]);
    }
  }

  $effect(() => {
    if (!listEl) return;
    const active = listEl.children[activeIndex];
    active?.scrollIntoView({ block: 'nearest' });
  });
</script>

{#if open}
  <div
    class="command-palette-overlay {className}"
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    onclick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div class="command-palette" role="presentation" onkeydown={onKey}>
      <div class="command-palette__search">
        <Icon icon="ph:magnifying-glass-bold" aria-hidden="true" />
        <input
          type="text"
          placeholder="Type a command…"
          bind:value={query}
          aria-label="Filter commands"
        />
        <kbd class="command-palette__kbd">esc</kbd>
      </div>
      <ul class="command-palette__list" bind:this={listEl} role="listbox">
        {#each filtered as cmd, i (cmd.id)}
          <li>
            <button
              class="command-palette__item {i === activeIndex ? 'command-palette__item--active' : ''}"
              role="option"
              aria-selected={i === activeIndex}
              onclick={() => run(cmd)}
            >
              {#if cmd.icon}
                <Icon icon={cmd.icon} aria-hidden="true" />
              {/if}
              <span class="command-palette__label">{cmd.label}</span>
              {#if cmd.hint}
                <span class="command-palette__hint">{cmd.hint}</span>
              {/if}
            </button>
          </li>
        {/each}
        {#if filtered.length === 0}
          <li class="command-palette__empty">No commands match "{query}"</li>
        {/if}
      </ul>
    </div>
  </div>
{/if}

<style>
  .command-palette-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay);
    backdrop-filter: blur(6px);
    display: grid;
    place-items: start center;
    padding: var(--space-16) var(--space-4) 0;
    z-index: var(--z-overlay);
  }
  .command-palette {
    width: min(640px, 100%);
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    animation: palette-in var(--spring-calm) 1;
  }
  @keyframes palette-in {
    from {
      transform: translateY(-6px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  .command-palette__search {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text-tertiary);
  }
  .command-palette__search input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font: var(--type-ui);
    font-size: var(--font-md);
    outline: none;
  }
  .command-palette__kbd {
    font: var(--type-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 2px 6px;
  }
  .command-palette__list {
    list-style: none;
    margin: 0;
    padding: var(--space-1);
    max-height: 320px;
    overflow-y: auto;
  }
  .command-palette__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    height: var(--row-height);
    padding: 0 var(--space-3);
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
  }
  .command-palette__item--active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .command-palette__label {
    flex: 1;
  }
  .command-palette__hint {
    font: var(--type-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }
  .command-palette__empty {
    padding: var(--space-4);
    text-align: center;
    color: var(--text-tertiary);
    font: var(--type-ui);
  }
</style>
