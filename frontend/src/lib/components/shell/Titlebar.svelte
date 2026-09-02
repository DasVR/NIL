<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import LiquidMetal from '$lib/components/ui/LiquidMetal.svelte';
  import ThinkingLogo from '$lib/components/ui/ThinkingLogo.svelte';
  import WindowControls from '$lib/components/ui/WindowControls.svelte';

  interface TitlebarProps {
    agentState?: 'idle' | 'thinking' | 'streaming' | 'done';
  }

  let { agentState = 'idle' }: TitlebarProps = $props();

  let dragging = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;

  function handleMouseDown(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement) return;
    if (e.target instanceof HTMLDivElement && e.target.classList.contains('titlebar-drag')) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return;
    if (window.__TAURI__?.window) {
      window.__TAURI__.window.current().dragMove?.();
    }
  }

  function handleMouseUp() {
    dragging = false;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });
</script>

<header class="titlebar" onmousedown={handleMouseDown} role="banner" aria-label="Window title bar">
  <LiquidMetal />
  
  <div class="titlebar-left titlebar-drag" title="Drag to move window">
    <span class="titlebar-brand">
      <svg class="titlebar-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor"/>
        <path d="M10 12h12M10 16h8M10 20h12" stroke="var(--color-cream)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span class="titlebar-title">NIL</span>
    </span>
    <span class="titlebar-divider" aria-hidden="true"></span>
    <span class="titlebar-context">Workspace</span>
  </div>

  <div class="titlebar-center titlebar-drag" title="Drag to move window">
    <!-- Empty center for drag -->
  </div>

  <div class="titlebar-right">
    <ThinkingLogo state={agentState} />
    <WindowControls />
  </div>
</header>

<style>
  .titlebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--titlebar-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--window-titlebar-bg);
    border-bottom: 1px solid var(--window-border);
    z-index: var(--z-sticky);
    -webkit-app-region: drag;
  }

  .titlebar-left,
  .titlebar-center,
  .titlebar-right {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .titlebar-left {
    gap: 10px;
    min-width: 200px;
  }

  .titlebar-center {
    flex: 1;
    justify-content: center;
  }

  .titlebar-right {
    gap: 8px;
  }

  .titlebar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .titlebar-logo {
    width: 20px;
    height: 20px;
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .titlebar-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--step-1);
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .titlebar-divider {
    width: 1px;
    height: 16px;
    background: var(--surface-border);
    margin: 0 8px;
  }

  .titlebar-context {
    font-size: var(--step--1);
    color: var(--text-tertiary);
    font-weight: 400;
  }
</style>