<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import * as agentStore from '$lib/stores/agentStore';
  import AIStripComposer from '$lib/components/shell/AIStripComposer.svelte';
  import AIStripRunning from '$lib/components/shell/AIStripRunning.svelte';
  import AIStripReview from '$lib/components/shell/AIStripReview.svelte';
  import { spring } from 'svelte/motion';
  import Icon from '@iconify/svelte';

  interface AIStripProps {
    state?: 'collapsed' | 'composer' | 'running' | 'review';
    onStateChange?: (s: 'collapsed' | 'composer' | 'running' | 'review') => void;
  }

  let { state = $bindable('collapsed'), onStateChange }: AIStripProps = $props();

  const height = spring(0, { stiffness: 0.15, damping: 0.25 });

  function updateHeight() {
    switch (state) {
      case 'collapsed': height.set(0); break;
      case 'composer': height.set(120); break;
      case 'running': height.set(200); break;
      case 'review': height.set(300); break;
    }
  }

  $effect(() => { updateHeight(); });

  function handleDragStart(e: MouseEvent) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = $height;
    
    function onMove(e: MouseEvent) {
      const delta = startY - e.clientY;
      const newHeight = Math.max(0, Math.min(400, startHeight + delta));
      height.set(newHeight);
    }
    
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      
      // Snap to nearest state
      const h = $height;
      if (h < 60) state = 'collapsed';
      else if (h < 160) state = 'composer';
      else if (h < 250) state = 'running';
      else state = 'review';
    }
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function toggle() {
    const states: typeof state[] = ['collapsed', 'composer', 'running', 'review'];
    const idx = states.indexOf(state);
    state = states[(idx + 1) % states.length];
  }

  onMount(() => {
    // Sync with appState - just set initial state
    state = appState.aiStripState;
  });
</script>

<aside 
  class="ai-strip" 
  style:height={$height}px
  style:transform="translateY({Math.max(0, 200 - $height)}px)"
  aria-label="AI Assistant"
>
  <div class="ai-strip-handle" onmousedown={handleDragStart} aria-label="Drag to resize" role="separator" tabIndex={0}>
    <div class="ai-strip-handle-bar"></div>
    <span class="ai-strip-handle-label">AI Strip</span>
    <Icon icon="ph:drag-handle-vertical-bold" width="16" height="16" />
  </div>

  <div class="ai-strip-content" style:opacity={$height > 0 ? 1 : 0} style:pointer-events={$height > 0 ? 'auto' : 'none'}>
    {#if state === 'composer'}
      <AIStripComposer />
    {:else if state === 'running'}
      <AIStripRunning />
    {:else if state === 'review'}
      <AIStripReview />
    {/if}
  </div>
</aside>

<style>
  .ai-strip {
    position: fixed;
    bottom: var(--statusbar-h);
    left: 0;
    right: 0;
    background: var(--ai-strip-bg);
    border-top: 1px solid var(--ai-strip-border);
    backdrop-filter: blur(var(--glass-2-blur)) saturate(1.55);
    -webkit-backdrop-filter: blur(var(--glass-2-blur)) saturate(1.55);
    z-index: var(--z-sticky);
    overflow: hidden;
    transition: transform var(--spring-smooth);
  }

  .ai-strip-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 28px;
    cursor: row-resize;
    background: transparent;
    color: var(--text-tertiary);
    font-size: var(--font-2xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    user-select: none;
    transition: color var(--spring-snappy);
  }

  .ai-strip-handle:hover {
    color: var(--accent-primary);
  }

  .ai-strip-handle-bar {
    width: 32px;
    height: 3px;
    border-radius: 2px;
    background: var(--surface-border);
  }

  .ai-strip-handle:hover .ai-strip-handle-bar {
    background: var(--accent-primary);
  }

  .ai-strip-content {
    height: calc(100% - 28px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: opacity var(--spring-smooth);
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-strip { transition: none; }
    .ai-strip-content { transition: none; }
  }

  :global(html.reduce-motion) .ai-strip { transition: none; }
  :global(html.reduce-motion) .ai-strip-content { transition: none; }
</style>