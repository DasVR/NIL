<script lang="ts">
  // Props
  export let title: string = 'Finn Pentest Harness';
  export let icon: string = '🔒';
  export let active: boolean = true;
  export let maximized: boolean = false;
  export let onMinimize: () => void = () => {};
  export let onMaximize: () => void = () => {};
  export let onClose: () => void = () => {};

  let windowRef: HTMLElement;
  let isDragging: boolean = false;
  let dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Traffic light colors (macOS style)
  const trafficLights = [
    { color: '#ff5f57', hover: '#ff3b30', action: onClose },
    { color: '#febc2e', hover: '#ff9500', action: onMinimize },
    { color: '#28c840', hover: '#34c759', action: onMaximize },
  ];

  function handleMouseDown(e: MouseEvent) {
    // Only drag from title bar
    if ((e.target as HTMLElement).closest('.title-bar')) {
      isDragging = true;
      const rect = windowRef.getBoundingClientRect();
      dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    windowRef.style.left = `${x}px`;
    windowRef.style.top = `${y}px`;
    windowRef.style.transform = 'none';
  }

  function handleMouseUp() {
    isDragging = false;
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  onDestroy(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  import { onMount, onDestroy } from 'svelte';
</script>

<div
  bind:this={windowRef}
  class="macos-window"
  class:active
  class:maximized
  style="position: absolute; top: 50px; left: 50px;"
  on:mousedown={handleMouseDown}
  role="application"
  aria-label={title}
>
  <!-- Glass background layers -->
  <div class="glass-bg"></div>
  <div class="glass-border"></div>

  <!-- Title Bar -->
  <div class="title-bar">
    <!-- Traffic Lights -->
    <div class="traffic-lights" role="toolbar" aria-label="Window controls">
      {#each trafficLights as light, i}
        <button
          class="traffic-light"
          style="background-color: {light.color};"
          on:click={(e) => { e.stopPropagation(); light.action(); }}
          aria-label={['Close', 'Minimize', 'Maximize'][i]}
          tabindex="0"
        >
          <span class="traffic-icon">
            {#if i === 0}
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M2 2L6 6M6 2L2 6" stroke="rgba(0,0,0,0.4)" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            {:else if i === 1}
              <svg width="8" height="8" viewBox="0 0 8 2" fill="none">
                <rect y="0.5" width="8" height="1" rx="0.5" fill="rgba(0,0,0,0.4)"/>
              </svg>
            {:else}
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
              </svg>
            {/if}
          </span>
        </button>
      {/each}
    </div>

    <!-- Title -->
    <div class="window-title">
      <span class="window-icon">{icon}</span>
      <span class="window-title-text">{title}</span>
    </div>

    <!-- Spacer for symmetry -->
    <div class="title-spacer"></div>
  </div>

  <!-- Content Area -->
  <div class="window-content">
    <slot>
      <!-- Default content -->
      <div class="placeholder-content">
        <p>Finn Pentest Harness Window</p>
      </div>
    </slot>
  </div>
</div>

<style>
  .macos-window {
    display: flex;
    flex-direction: column;
    min-width: 320px;
    min-height: 200px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 22px 70px 4px rgba(0, 0, 0, 0.56),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(5, 5, 7, 0.75);
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    cursor: default;
    user-select: none;
    z-index: 10;
  }

  .macos-window.active {
    box-shadow:
      0 25px 80px 6px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  .macos-window.maximized {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0;
  }

  /* Glass background layer */
  .glass-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 40%,
      rgba(0, 0, 0, 0.1) 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Glass border glow */
  .glass-border {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 0;
  }

  /* Title Bar */
  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 16px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: grab;
    position: relative;
    z-index: 1;
  }

  .title-bar:active {
    cursor: grabbing;
  }

  /* Traffic Lights */
  .traffic-lights {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .traffic-light {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .traffic-light:hover {
    transform: scale(1.15);
  }

  .traffic-light:active {
    transform: scale(0.95);
  }

  .traffic-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .macos-window.active .traffic-light:hover .traffic-icon,
  .macos-window:hover .traffic-icon {
    opacity: 1;
  }

  /* Window Title */
  .window-title {
    display: flex;
    align-items: center;
    gap: 6px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .window-icon {
    font-size: 12px;
    opacity: 0.8;
  }

  .window-title-text {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: -0.01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .title-spacer {
    width: 52px;
  }

  /* Content Area */
  .window-content {
    flex: 1;
    overflow: auto;
    position: relative;
    z-index: 1;
  }

  /* Scrollbar styling */
  .window-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .window-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .window-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  .window-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Placeholder */
  .placeholder-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .macos-window,
    .traffic-light,
    .traffic-icon {
      transition: none !important;
    }
  }

  /* Dark mode is default, but support light override */
  @media (prefers-color-scheme: light) {
    .macos-window {
      background: rgba(245, 245, 247, 0.8);
    }
    .window-title-text {
      color: rgba(0, 0, 0, 0.9);
    }
    .title-bar {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.2) 100%
      );
    }
  }
</style>
