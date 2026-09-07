<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import Icon from '@iconify/svelte';

  interface TargetNode {
    id: string;
    name: string;
    type: 'engagement' | 'domain' | 'host' | 'network' | 'finding' | 'timeline';
    status?: 'active' | 'paused' | 'completed';
    ports?: number[];
    findings?: number;
    children?: TargetNode[];
    expanded?: boolean;
  }

  interface FlatRow {
    node: TargetNode;
    engagementId: string;
    depth: number;
    /** rails[i] = the 1px guide hairline at depth level i continues past this row. */
    rails: boolean[];
    hasChildren: boolean;
    expanded: boolean;
  }

  let targets = $derived<TargetNode[]>(
    appState.engagements.map(eng => ({
      id: eng.name,
      name: eng.name,
      type: 'engagement',
      status: 'active',
      findings: eng.findings_count,
      expanded: true,
      children: [
        {
          id: `${eng.name}-findings`,
          name: 'findings',
          type: 'finding',
          findings: eng.findings_count,
        },
        {
          id: `${eng.name}-timeline`,
          name: 'timeline',
          type: 'timeline',
        },
      ],
    }))
  );

  // Expansion is UI state, not data: user toggles live here so re-deriving
  // `targets` from appState never resets them. Membership = flipped from default.
  let toggled = $state<Set<string>>(new Set());

  function isExpanded(node: TargetNode, depth: number): boolean {
    return (node.expanded ?? depth === 0) !== toggled.has(node.id);
  }

  function flatten(
    nodes: TargetNode[],
    engagementId: string,
    depth: number,
    rails: boolean[],
    out: FlatRow[]
  ) {
    nodes.forEach((node, idx) => {
      const lastSibling = idx === nodes.length - 1;
      const hasChildren = Boolean(node.children?.length);
      const expanded = hasChildren && isExpanded(node, depth);
      out.push({ node, engagementId, depth, rails, hasChildren, expanded });
      if (expanded && node.children) {
        flatten(node.children, engagementId, depth + 1, [...rails, !lastSibling], out);
      }
    });
  }

  const rows = $derived.by(() => {
    const out: FlatRow[] = [];
    flatten(targets, '', 0, [], out);
    // Leaves inherit their root engagement's id (visible rows are depth-ordered).
    let current = '';
    for (const r of out) {
      if (r.depth === 0) current = r.node.id;
      r.engagementId = current;
    }
    return out;
  });

  function toggleExpand(row: FlatRow) {
    const next = new Set(toggled);
    if (next.has(row.node.id)) next.delete(row.node.id);
    else next.add(row.node.id);
    toggled = next;
  }

  function selectRow(row: FlatRow) {
    // Honesty: leaves are views onto their engagement — selecting one selects
    // the engagement, never a synthetic `${name}-findings` id.
    appState.activeEngagementId = row.engagementId;
    appState.activeTargetId = row.node.id;
  }

  // ── WAI tree mechanics ────────────────────────────────────────────────
  let focusId = $state<string | null>(null);
  let treeEl: HTMLElement | undefined = $state();

  function focusRow(id: string) {
    focusId = id;
    treeEl?.querySelector<HTMLElement>(`[data-row-id="${id}"]`)?.focus();
  }

  function parentRowOf(index: number): FlatRow | null {
    for (let i = index - 1; i >= 0; i--) {
      if (rows[i].depth < rows[index].depth) return rows[i];
    }
    return null;
  }

  function onKeydownTree(e: KeyboardEvent) {
    const rowEl = (e.target as HTMLElement).closest<HTMLElement>('[data-row-id]');
    if (!rowEl) return;
    const id = rowEl.dataset.rowId!;
    const index = rows.findIndex((r) => r.node.id === id);
    if (index < 0) return;
    const row = rows[index];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index + 1 < rows.length) focusRow(rows[index + 1].node.id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) focusRow(rows[index - 1].node.id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (row.hasChildren && !row.expanded) toggleExpand(row);
        else if (row.hasChildren && row.expanded && index + 1 < rows.length) {
          focusRow(rows[index + 1].node.id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (row.hasChildren && row.expanded) toggleExpand(row);
        else {
          const parent = parentRowOf(index);
          if (parent) focusRow(parent.node.id);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectRow(row);
        break;
    }
  }

  function getIcon(type: TargetNode['type']) {
    switch (type) {
      case 'engagement': return 'ph:briefcase-bold';
      case 'domain': return 'ph:globe-bold';
      case 'host': return 'ph:server-bold';
      case 'network': return 'ph:network-bold';
      case 'finding': return 'ph:flag-bold';
      case 'timeline': return 'ph:clock-bold';
    }
  }
</script>

<div
  class="target-tree"
  role="tree"
  aria-label="Targets"
  bind:this={treeEl}
  onkeydown={onKeydownTree}
>
  {#each rows as row (row.node.id)}
    {@const selected = row.node.id === appState.activeTargetId}
    <div
      class="tree-row"
      class:selected
      data-row-id={row.node.id}
      data-depth={row.depth}
      role="treeitem"
      aria-level={row.depth + 1}
      aria-expanded={row.hasChildren ? row.expanded : undefined}
      aria-selected={selected}
      tabindex={row.node.id === (focusId ?? rows[0]?.node.id) ? 0 : -1}
      style:--indent={row.depth}
      onclick={() => { focusId = row.node.id; selectRow(row); }}
    >
      <!-- Guide rails: rendered only where an ancestor branch continues.
           No continuation, no hairline — guides never bleed into dead space. -->
      {#each row.rails as continues, i}
        {#if continues}
          <span class="rail" aria-hidden="true" style:left="calc(var(--s-2) + {i} * var(--s-4) + 9.5px)"></span>
        {/if}
      {/each}

      {#if row.hasChildren}
        <button
          class="expand"
          type="button"
          tabindex="-1"
          aria-label={row.expanded ? `Collapse ${row.node.name}` : `Expand ${row.node.name}`}
          onclick={(e) => { e.stopPropagation(); toggleExpand(row); }}
        >
          <span class="caret" class:open={row.expanded}>
            <Icon icon="ph:caret-right-bold" width="10" height="10" />
          </span>
        </button>
      {:else}
        <!-- Fixed spacer: leaf labels stay on the same text axis as parents. -->
        <span class="expand-spacer" aria-hidden="true"></span>
      {/if}

      {#if row.node.status}
        <span class="status" data-status={row.node.status} title={row.node.status}></span>
      {:else}
        <span class="status-spacer" aria-hidden="true"></span>
      {/if}

      <span class="node-icon" data-tier={row.node.type}>
        <Icon icon={getIcon(row.node.type)} width="13" height="13" />
      </span>

      <span class="node-name" data-tier={row.node.type}>{row.node.name}</span>

      {#if row.node.ports}
        <span class="node-ports">{row.node.ports.join(', ')}</span>
      {/if}

      {#if row.node.findings !== undefined && row.node.findings > 0}
        <span class="node-badge">{row.node.findings}</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .target-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--space-1) 0;
  }

  .tree-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--row-h); /* 28px workstation density */
    padding: 0 var(--space-2) 0 calc(var(--space-2) + var(--indent) * var(--s-4));
    border-radius: var(--radius-control);
    cursor: pointer;
    contain: layout style; /* branch fold/unfold never recalculates the tree */
    transition: background-color var(--dur-flip) var(--ease-out),
                color var(--dur-flip) var(--ease-out);
  }

  .tree-row:hover {
    background: var(--sidebar-item-hover);
  }

  /* Selected: monochrome surface + left accent hairline. Never a saturated
     tint — risk color belongs to findings only (Law 1). */
  .tree-row.selected {
    background: var(--sidebar-item-active);
    color: var(--sidebar-item-active-text);
    box-shadow: inset 2px 0 0 var(--nil-line-hot);
  }

  .tree-row:focus-visible {
    outline: 2px solid var(--nil-halo);
    outline-offset: -2px;
  }

  .rail {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--nil-line);
    pointer-events: none;
  }

  .expand {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }

  .expand:hover {
    color: var(--nil-ink);
    background: var(--nil-raised);
  }

  /* Binary state via GPU transform only: right = collapsed, down = expanded. */
  .caret {
    display: grid;
    place-items: center;
    transition: transform var(--dur-flip) var(--ease-out);
  }
  .caret.open { transform: rotate(90deg); }

  .expand-spacer {
    width: 20px;
    flex-shrink: 0;
  }

  /* Status: monochrome ink — engagement state is not risk (Law 1). */
  .status {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--nil-ink-2);
  }
  .status[data-status="paused"] { background: var(--nil-ink-3); }
  .status[data-status="completed"] { background: var(--nil-ink-4); }

  .status-spacer {
    width: 5px;
    flex-shrink: 0;
    margin-inline: 0;
  }

  .node-icon {
    display: grid;
    place-items: center;
    color: var(--nil-ink-3);
    flex-shrink: 0;
  }
  .node-icon[data-tier="engagement"] { color: var(--nil-ink-2); }
  .tree-row.selected .node-icon { color: var(--nil-ink); }

  /* Tier hierarchy through ink and tracking, not color. */
  .node-name {
    flex: 1;
    min-width: 0;
    font: var(--t-body)/1 var(--font-ui);
    color: var(--nil-ink-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .node-name[data-tier="engagement"] {
    font-weight: 600;
    font-size: var(--t-meta);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink);
  }
  .tree-row.selected .node-name { color: var(--nil-ink); }

  .node-ports {
    font: var(--t-meta)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    color: var(--nil-ink-3);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Findings count: real data, monochrome pill, tabular figure. */
  .node-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: var(--radius-badge);
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    color: var(--nil-ink-2);
    font: 600 var(--t-micro)/1 var(--font-machine);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
</style>
