<script lang="ts">
  import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
  import NilIcon, { type NilIconName } from '$lib/ui/NilIcon.svelte';
  import { droplet } from '$lib/motion/droplet';
  import DitherWipe from '$lib/ui/DitherWipe.svelte';
  import { engagementFiles, workspace } from '$lib/stores/workspace.svelte.ts';
  import { focusTrap } from '$lib/a11y/focusTrap';
  import { shortcutLabel } from '$lib/shortcuts';

  interface Props {
    open?: boolean;
    onToggle?: (open: boolean) => void;
  }

  interface PaletteRow {
    id: string;
    label: string;
    hint?: string;
    icon: NilIconName;
    section: string;
    shortcut?: string;
    run: () => void;
  }

  let { open = false, onToggle }: Props = $props();

  let inputRef: HTMLInputElement | undefined = $state();
  let selectedIndex = $state(0);

  // Created once so the attachment identity is stable; it arms on mount of the
  // dialog, moves focus to the search field, and hands focus back on close.
  const trap = focusTrap({ initial: () => inputRef });

  const uid = $props.id();
  const listboxId = `${uid}-listbox`;
  const statusId = `${uid}-status`;

  function optionId(row: PaletteRow): string {
    return `${uid}-opt-${row.id}`;
  }
  function sectionId(section: string): string {
    return `${uid}-sec-${section.toLowerCase().replace(/\W+/g, '-')}`;
  }

  function fileScore(path: string, label: string, q: string): number {
    const p = path.toLowerCase();
    const l = label.toLowerCase();
    if (l === q || p === q) return 0;
    if (l.startsWith(q) || p.endsWith(`/${q}`)) return 1;
    if (l.includes(q)) return 2;
    if (p.includes(q)) return 3;
    return 4;
  }

  const rows = $derived.by(() => {
    const q = paletteStore.query.trim().toLowerCase();
    const out: PaletteRow[] = [];

    if (q) {
      const files = engagementFiles()
        .filter((f) => f.path.toLowerCase().includes(q) || f.label.toLowerCase().includes(q))
        .sort((a, b) => fileScore(a.path, a.label, q) - fileScore(b.path, b.label, q) || a.path.length - b.path.length)
        .slice(0, 12);
      for (const file of files) {
        out.push({
          id: `file:${file.id}`,
          label: file.label,
          hint: file.path,
          icon: 'file',
          section: 'Files',
          run: () => {
            workspace.openFile(file.path);
            paletteStore.closePalette();
          },
        });
      }
    }

    const cmds = q
      ? paletteStore.commands.filter((c) =>
          c.label.toLowerCase().includes(q)
          || c.shortcut?.toLowerCase().includes(q)
          || (c.section ?? '').toLowerCase().includes(q),
        )
      : paletteStore.commands;
    for (const cmd of cmds) {
      out.push({
        id: `cmd:${cmd.id}`,
        label: cmd.label,
        icon: cmd.icon || 'command',
        section: cmd.section ?? 'General',
        shortcut: cmd.shortcut,
        run: () => paletteStore.executeCommand(cmd.id),
      });
    }
    return out;
  });

  function groupRows(items: PaletteRow[]) {
    const map = new Map<string, PaletteRow[]>();
    for (const row of items) {
      const list = map.get(row.section) ?? [];
      list.push(row);
      map.set(row.section, list);
    }
    return Array.from(map.entries()).map(([section, commands]) => ({ section, commands }));
  }

  let grouped = $derived(groupRows(rows));

  const activeRow = $derived(rows[selectedIndex]);

  // Screen-reader summary of the result set. Only re-announces when the count
  // or the query changes, so arrowing through rows stays quiet (the active
  // option is already spoken via aria-activedescendant).
  const resultSummary = $derived.by(() => {
    const n = rows.length;
    if (n === 0) return 'No results';
    const noun = n === 1 ? 'result' : 'results';
    const q = paletteStore.query.trim();
    return q ? `${n} ${noun} for ${q}` : `${n} ${noun}`;
  });

  function close() {
    if (onToggle) onToggle(false);
    else paletteStore.closePalette();
  }

  function handleKeydown(e: KeyboardEvent) {
    const last = Math.max(0, rows.length - 1);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, last);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        selectedIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        selectedIndex = last;
        break;
      case 'Enter':
        e.preventDefault();
        activeRow?.run();
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }

  // Escape anywhere inside the dialog closes it, not only from the input, so
  // the behaviour matches the global keymap whichever element has focus.
  function handleDialogKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    close();
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    paletteStore.query = target.value;
    selectedIndex = 0;
  }

  $effect(() => {
    if (!open) return;
    selectedIndex = 0;
  });

  // Keep the active option in view while arrowing through a long result list.
  $effect(() => {
    const row = activeRow;
    if (!open || !row) return;
    document.getElementById(optionId(row))?.scrollIntoView({ block: 'nearest' });
  });
</script>

{#if open}
  <!-- Pointer-only light-dismiss. tabindex="-1" keeps this invisible
       full-viewport button out of the Tab cycle; keyboard users close with Escape. -->
  <button
    type="button"
    class="palette-overlay"
    aria-label="Close command palette"
    tabindex="-1"
    onclick={close}
  ></button>
  <div
    class="palette-window"
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    tabindex="-1"
    onkeydown={handleDialogKeydown}
    {@attach trap}
  >
    <DitherWipe mode="dissolve" />
    <div class="palette-header">
      <div class="palette-search">
        <NilIcon name="search" size={16} />
        <input
          bind:this={inputRef}
          type="text"
          role="combobox"
          bind:value={paletteStore.query}
          oninput={handleInput}
          onkeydown={handleKeydown}
          placeholder="Type a command or search files..."
          aria-label="Command palette search"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeRow ? optionId(activeRow) : undefined}
          autocomplete="off"
          spellcheck="false"
        />
        <kbd class="palette-hint" aria-hidden="true">{shortcutLabel('Mod+K')}</kbd>
      </div>
    </div>

    <div id={statusId} class="visually-hidden" role="status" aria-live="polite">{resultSummary}</div>

    <div class="palette-results">
      {#if rows.length === 0}
        <div class="palette-empty">
          <NilIcon name="search" size={16} />
          <p>No commands found</p>
          <span>Try a different search</span>
        </div>
      {:else}
        <div id={listboxId} role="listbox" aria-label="Commands and files">
          {#each grouped as group (group.section)}
            <div class="palette-group" role="group" aria-labelledby={sectionId(group.section)}>
              <div id={sectionId(group.section)} class="palette-section-header" role="presentation">{group.section}</div>
              {#each group.commands as cmd}
                {@const globalIdx = rows.indexOf(cmd)}
                <!-- Focus stays on the search input (aria-activedescendant pattern above);
                     these rows are never independently focusable, so no tabindex/keydown here. -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_interactive_supports_focus -->
                <div
                  class="palette-item nil-row-host"
                  class:selected={globalIdx === selectedIndex}
                  role="option"
                  aria-selected={globalIdx === selectedIndex}
                  id={optionId(cmd)}
                  {@attach droplet}
                  onclick={() => cmd.run()}
                >
                  <div class="palette-item-main">
                    <NilIcon name={cmd.icon} size={16} />
                    <span class="palette-item-copy">
                      <span class="palette-item-label">{cmd.label}</span>
                      {#if cmd.hint}
                        <span class="palette-item-hint">{cmd.hint}</span>
                      {/if}
                    </span>
                  </div>
                  {#if cmd.shortcut}
                    <kbd class="palette-item-shortcut">{shortcutLabel(cmd.shortcut)}</kbd>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .palette-overlay {
    display: block;
    position: fixed;
    inset: 0;
    width: 100%;
    border: none;
    padding: 0;
    cursor: default;
    background: color-mix(in oklab, var(--nil-void) 72%, transparent);
    z-index: var(--z-modal);
  }

  .palette-window {
    position: fixed;
    top: 12vh;
    left: 50%;
    transform: translateX(-50%);
    width: 640px;
    max-width: calc(100vw - 32px);
    background: var(--nil-raised);
    border-radius: var(--r-panel);
    border: 1px solid var(--nil-line-hot);
    box-shadow: var(--lift-3);
    z-index: var(--z-modal);
    overflow: hidden;
  }

  .palette-header {
    padding: var(--s-3) var(--s-4);
    border-bottom: 1px solid var(--nil-line);
  }

  .palette-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .palette-search :global(svg) {
    position: absolute;
    left: 14px;
    color: var(--nil-ink-3);
    flex-shrink: 0;
    z-index: 1;
  }

  .palette-search input {
    width: 100%;
    height: 32px;
    padding: 0 14px 0 42px;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: var(--t-body)/1 var(--font-ui);
    transition: border-color var(--dur-flip) var(--ease-out);
  }

  .palette-search input:focus {
    border-color: var(--nil-line-hot);
  }
  .palette-search input:focus-visible {
    outline: 2px solid var(--nil-halo);
    outline-offset: 2px;
  }

  .palette-hint {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
    padding: 2px 6px;
    border-radius: var(--r-chip);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
  }

  .palette-results {
    max-height: 480px;
    overflow-y: auto;
    padding: var(--s-2);
  }

  .palette-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    padding: var(--s-2) var(--s-3);
    border-radius: var(--r-field);
    cursor: pointer;
  }

  .palette-item:hover,
  .palette-item.selected {
    background: transparent;
  }

  .palette-item.selected {
    outline: 1px solid var(--nil-line-hot);
  }

  .palette-item-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .palette-item-label {
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .palette-item-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .palette-item-hint {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .palette-item-shortcut {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-3);
    padding: 2px 6px;
    border-radius: var(--r-chip);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .palette-section-header {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    padding: var(--s-2) var(--s-3) var(--s-1);
    pointer-events: none;
    user-select: none;
  }

  .palette-group + .palette-group > .palette-section-header {
    margin-top: var(--s-2);
    border-top: 1px solid var(--nil-line);
    padding-top: var(--s-3);
  }

  .palette-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--s-8);
    gap: var(--s-2);
    color: var(--nil-ink-3);
    text-align: center;
  }

  .palette-empty p {
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink-2);
  }

  .palette-empty span {
    font: var(--t-micro)/1 var(--font-ui);
  }
</style>