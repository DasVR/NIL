<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState';
  import Icon from '@iconify/svelte';
  import { createEventDispatcher } from 'svelte';

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

  let targets = $state<TargetNode[]>([
    {
      id: 'acme-corp',
      name: 'acme-corp',
      type: 'engagement',
      status: 'active',
      children: [
        {
          id: 'api.acme.com',
          name: 'api.acme.com',
          type: 'domain',
          ports: [80, 443, 8080],
          findings: 3,
          children: [
            { id: 'api-findings', name: 'findings', type: 'finding', findings: 3 },
            { id: 'api-timeline', name: 'timeline', type: 'timeline' },
          ],
        },
        {
          id: 'db.acme.com',
          name: 'db.acme.com',
          type: 'host',
          ports: [3306, 5432],
          findings: 1,
          children: [
            { id: 'db-findings', name: 'findings', type: 'finding', findings: 1 },
          ],
        },
        {
          id: 'internal-net',
          name: 'internal-net',
          type: 'network',
          children: [
            { id: 'internal-findings', name: 'findings', type: 'finding', findings: 0 },
          ],
        },
      ],
    },
  ]);

  function toggleExpand(node: TargetNode) {
    node.expanded = !node.expanded;
    // Force reactivity
    targets = targets;
  }

  function handleSelect(node: TargetNode, e: Event) {
    e.stopPropagation();
    appState.activeTargetId = node.id;
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

  function getStatusColor(status?: TargetNode['status']) {
    switch (status) {
      case 'active': return 'var(--color-success)';
      case 'paused': return 'var(--color-warning)';
      case 'completed': return 'var(--text-tertiary)';
      default: return 'transparent';
    }
  }

  function renderNode(node: TargetNode, depth = 0): string {
    const indent = depth * 16;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded ?? (depth === 0);
    const isActive = node.id === appState.activeTargetId;

    return `
      <div 
        class="tree-node ${isActive ? 'active' : ''}" 
        style="padding-left: ${indent + 8}px"
        data-id="${node.id}"
      >
        <div class="tree-node-row" data-id="${node.id}" data-depth="${depth}">
          ${hasChildren ? `
            <button 
              class="tree-expand" 
              data-id="${node.id}"
              aria-expanded="${isExpanded}"
              aria-label="${isExpanded ? 'Collapse' : 'Expand'}"
            >
              <Icon icon="${isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}" width="12" height="12" />
            </button>
          ` : '<span class="tree-expand-placeholder"></span>'}
          
          <div class="tree-node-status" style="background: ${getStatusColor(node.status)}"></div>
          
          <Icon icon="${getIcon(node.type)}" width="14" height="14" class="tree-node-icon" />
          
          <span class="tree-node-name">${node.name}</span>
          
          ${node.ports ? `<span class="tree-node-ports">${node.ports.join(', ')}</span>` : ''}
          
          ${node.findings !== undefined && node.findings > 0 ? `<span class="tree-node-badge">${node.findings}</span>` : ''}
        </div>
        
        ${hasChildren && isExpanded ? `
          <div class="tree-children">
            ${node.children!.map(child => renderNode(child, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
</script>

<div class="target-tree" role="tree" aria-label="Targets">
  {#each targets as target}
    {@html renderNode(target)}
  {/each}
</div>

<style>
  .target-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--space-1) 0;
  }

  .tree-node {
    transition: background var(--spring-snappy);
  }

  .tree-node-row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--row-h);
    padding: 0 var(--space-2);
    border-radius: var(--radius-control);
    cursor: pointer;
    transition: background var(--spring-snappy), color var(--spring-snappy);
  }

  .tree-node-row:hover {
    background: var(--sidebar-item-hover);
  }

  .tree-node.active .tree-node-row {
    background: var(--sidebar-item-active);
    color: var(--sidebar-item-active-text);
  }

  .tree-expand {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--spring-snappy), background var(--spring-snappy);
  }

  .tree-expand:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }

  .tree-expand-placeholder {
    width: 20px;
    flex-shrink: 0;
  }

  .tree-node-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tree-node-icon {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .tree-node.active .tree-node-icon {
    color: var(--sidebar-item-active-text);
  }

  .tree-node-name {
    flex: 1;
    min-width: 0;
    font-size: var(--font-xs);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tree-node-ports {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .tree-node-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: var(--radius-badge);
    background: var(--accent-primary);
    color: var(--color-abyss-0);
    font-size: var(--font-2xs);
    font-weight: 600;
    flex-shrink: 0;
  }

  .tree-node.active .tree-node-badge {
    background: var(--color-cream);
  }

  .tree-children {
    overflow: hidden;
  }

  /* Collapsed sidebar - show only icons */
  :global(.sidebar.collapsed) .tree-node-name,
  :global(.sidebar.collapsed) .tree-node-ports,
  :global(.sidebar.collapsed) .tree-node-badge,
  :global(.sidebar.collapsed) .tree-expand {
    display: none;
  }

  :global(.sidebar.collapsed) .tree-node-row {
    justify-content: center;
    padding: 0 8px;
  }

  :global(.sidebar.collapsed) .tree-node-status {
    display: none;
  }
</style>