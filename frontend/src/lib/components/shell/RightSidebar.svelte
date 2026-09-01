<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';
  import Icon from '@iconify/svelte';

  interface RightSidebarProps {
    open?: boolean;
    width?: number;
    onToggle?: () => void;
    onResize?: (w: number) => void;
  }

  let { open = $bindable(true), width = $bindable(320), onToggle, onResize }: RightSidebarProps = $props();

  let activeTab = $state<'findings' | 'timeline' | 'evidence' | 'context'>('findings');
  let dragStartX = 0;
  let startWidth = 0;
  let resizing = $state(false);

  let findings = $state([
    {
      id: 'f1',
      title: 'SQL Injection in Login Endpoint',
      severity: 'critical' as const,
      cvss: '9.1',
      date: '2026-08-28',
      description: 'The login endpoint does not properly sanitize user input, allowing SQL injection.',
      evidence: 'POST /api/login { "username": "admin\'--\" }',
      remediation: 'Use parameterized queries and input validation.',
    },
    {
      id: 'f2',
      title: 'Missing Rate Limiting on API',
      severity: 'medium' as const,
      cvss: '5.3',
      date: '2026-08-27',
      description: 'API endpoints lack rate limiting, allowing brute force attacks.',
      evidence: '1000 requests/minute to /api/users',
      remediation: 'Implement rate limiting (e.g., 60 req/min per IP).',
    },
    {
      id: 'f3',
      title: 'Outdated OpenSSL Version',
      severity: 'low' as const,
      cvss: '3.7',
      date: '2026-08-25',
      description: 'Server runs OpenSSL 1.1.1 which has known vulnerabilities.',
      evidence: 'OpenSSL 1.1.1k detected on port 443',
      remediation: 'Upgrade to OpenSSL 3.0+ or apply vendor patches.',
    },
  ]);

  function handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    dragStartX = e.clientX;
    startWidth = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleResizeMove(e: MouseEvent) {
    if (!resizing) return;
    const delta = dragStartX - e.clientX; // Right sidebar resizes opposite
    const newWidth = Math.max(240, Math.min(500, startWidth + delta));
    width = newWidth;
    if (onResize) onResize(newWidth);
  }

  function handleResizeEnd() {
    resizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  onMount(() => {
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  });

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'var(--color-danger)';
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-info)';
      case 'info': return 'var(--text-tertiary)';
      default: return 'var(--surface-border)';
    }
  }

  function getSeverityLabel(severity: string) {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }
</script>

<aside 
  class="right-sidebar {open ? '' : 'collapsed'} {resizing ? 'resizing' : ''}" 
  style:width={width}px
  style:right={open ? '0' : '-' + width + 'px'}
  aria-label="Inspector"
>
  <div class="right-sidebar-header">
    <div class="right-sidebar-tabs" role="tablist">
      <button 
        class="right-sidebar-tab {activeTab === 'findings' ? 'active' : ''}" 
        role="tab" 
        aria-selected={activeTab === 'findings'}
        onclick={() => activeTab = 'findings'}
      >
        <Icon icon="ph:flag-bold" width="14" height="14" />
        <span>Findings</span>
        <span class="tab-badge">{findings.length}</span>
      </button>
      <button 
        class="right-sidebar-tab {activeTab === 'timeline' ? 'active' : ''}" 
        role="tab" 
        aria-selected={activeTab === 'timeline'}
        onclick={() => activeTab = 'timeline'}
      >
        <Icon icon="ph:clock-bold" width="14" height="14" />
        <span>Timeline</span>
      </button>
      <button 
        class="right-sidebar-tab {activeTab === 'evidence' ? 'active' : ''}" 
        role="tab" 
        aria-selected={activeTab === 'evidence'}
        onclick={() => activeTab = 'evidence'}
      >
        <Icon icon="ph:folder-bold" width="14" height="14" />
        <span>Evidence</span>
      </button>
      <button 
        class="right-sidebar-tab {activeTab === 'context' ? 'active' : ''}" 
        role="tab" 
        aria-selected={activeTab === 'context'}
        onclick={() => activeTab = 'context'}
      >
        <Icon icon="ph:brain-bold" width="14" height="14" />
        <span>Context</span>
      </button>
    </div>
    <div class="right-sidebar-actions">
      <button class="icon-btn" aria-label="Refresh" title="Refresh">
        <Icon icon="ph:arrows-clockwise-bold" width="16" height="16" />
      </button>
      <button class="icon-btn" aria-label="Filter" title="Filter">
        <Icon icon="ph:funnel-bold" width="16" height="16" />
      </button>
    </div>
  </div>

  <div class="right-sidebar-divider"></div>

  <div class="right-sidebar-content">
    {#if activeTab === 'findings'}
      <div class="findings-list">
        {#each findings as finding}
          <FindingCard 
            {finding}
            onExplain={() => console.log('Explain:', finding.id)}
            onDraft={() => console.log('Draft:', finding.id)}
          />
        {/each}
        {#if findings.length === 0}
          <div class="empty-state">
            <Icon icon="ph:flag-bold" width="32" height="32" />
            <p>No findings yet</p>
            <span>Run a scan to discover issues</span>
          </div>
        {/if}
      </div>
    {:else if activeTab === 'timeline'}
      <div class="timeline-list">
        <div class="timeline-empty">
          <Icon icon="ph:clock-bold" width="32" height="32" />
          <p>No timeline events</p>
          <span>Activity will appear here</span>
        </div>
      </div>
    {:else if activeTab === 'evidence'}
      <div class="evidence-list">
        <div class="timeline-empty">
          <Icon icon="ph:folder-bold" width="32" height="32" />
          <p>No evidence collected</p>
          <span>Artifacts from tool runs appear here</span>
        </div>
      </div>
    {:else if activeTab === 'context'}
      <div class="context-view">
        <div class="timeline-empty">
          <Icon icon="ph:brain-bold" width="32" height="32" />
          <p>No context loaded</p>
          <span>Select a target to load context</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="right-sidebar-resize-handle" 
    onmousedown={handleResizeStart}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleResizeStart(e as unknown as MouseEvent); } }}
    aria-label="Resize inspector"
    role="separator"
    tabIndex={0}
  ></div>
</aside>

<style>
  .right-sidebar {
    position: fixed;
    top: var(--titlebar-h);
    right: 0;
    bottom: var(--statusbar-h);
    background: var(--sidebar-bg);
    border-left: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    z-index: var(--z-sticky);
    transition: width var(--spring-snappy), right var(--spring-snappy);
    overflow: hidden;
  }

  .right-sidebar.collapsed {
    width: 0 !important;
    right: 0 !important;
    border-left: none;
  }

  .right-sidebar.resizing {
    transition: none;
  }

  .right-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--row-h);
    padding: 0 var(--space-2);
    border-bottom: 1px solid var(--sidebar-border);
    flex-shrink: 0;
  }

  .right-sidebar-tabs {
    display: flex;
    gap: 2px;
    flex: 1;
    overflow-x: auto;
  }

  .right-sidebar-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-tertiary);
    font-size: var(--font-xs);
    font-weight: 400;
    cursor: pointer;
    white-space: nowrap;
    transition: color var(--spring-snappy), background var(--spring-snappy);
  }

  .right-sidebar-tab:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }

  .right-sidebar-tab.active {
    color: var(--accent-primary);
    background: var(--accent-soft);
  }

  .tab-badge {
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
  }

  .right-sidebar-tab.active .tab-badge {
    background: var(--color-cream);
  }

  .right-sidebar-actions {
    display: flex;
    gap: 2px;
  }

  .right-sidebar-divider {
    height: 1px;
    background: var(--sidebar-border);
    margin: 0 var(--space-2);
  }

  .right-sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--space-2);
  }

  .findings-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .timeline-empty,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    gap: var(--space-2);
    color: var(--text-tertiary);
    text-align: center;
    padding: var(--space-6);
  }

  .timeline-empty p,
  .empty-state p {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .timeline-empty span,
  .empty-state span {
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .right-sidebar-resize-handle {
    position: absolute;
    top: 0;
    left: -4px;
    bottom: 0;
    width: 8px;
    cursor: col-resize;
    background: transparent;
    z-index: 10;
    transition: background var(--spring-snappy);
  }

  .right-sidebar-resize-handle:hover {
    background: var(--accent-primary);
  }
</style>