<script lang="ts">
  import { onMount } from 'svelte';

  interface DockItem {
    id: string;
    icon: string;
    label: string;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
  }

  export let items: DockItem[] = [
    { id: 'finder', icon: '📁', label: 'Finder' },
    { id: 'terminal', icon: '💻', label: 'Terminal', active: true },
    { id: 'browser', icon: '🌐', label: 'Browser' },
    { id: 'chat', icon: '💬', label: 'Chat', badge: 3 },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'trash', icon: '🗑️', label: 'Trash' },
  ];

  export let position: 'bottom' | 'left' | 'right' = 'bottom';
  export let magnification: number = 2.0;  // max scale on hover
  export let springStiffness: number = 300;   // spring physics
  export let springDamping: number = 25;      // spring damping

  let dockRef: HTMLElement;
  let mouseX: number = -1000;
  let mouseY: number = -1000;
  let scales: number[] = items.map(() => 1);
  let targetScales: number[] = items.map(() => 1);
  let velocities: number[] = items.map(() => 0);
  let animationId: number;
  let isHovered: boolean = false;

  // Spring physics simulation
  function updateSpring() {
    let needsUpdate = false;

    for (let i = 0; i < items.length; i++) {
      const force = (targetScales[i] - scales[i]) * springStiffness;
      velocities[i] += force * 0.016; // ~60fps
      velocities[i] *= (1 - springDamping * 0.001);
      scales[i] += velocities[i] * 0.016;

      // Snap to target if close enough
      if (Math.abs(targetScales[i] - scales[i]) > 0.001 || Math.abs(velocities[i]) > 0.001) {
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      scales = [...scales];
      animationId = requestAnimationFrame(updateSpring);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dockRef) return;
    const rect = dockRef.getBoundingClientRect();

    if (position === 'bottom') {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    } else {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    // Calculate target scales based on distance from mouse
    const iconWidth = 56; // base icon size + gap
    const centerOffset = iconWidth / 2;

    for (let i = 0; i < items.length; i++) {
      const iconCenter = i * iconWidth + centerOffset;
      const distance = Math.abs(mouseX - iconCenter);
      const maxDist = 150; // influence radius

      if (distance < maxDist && isHovered) {
        // Smooth falloff from center
        const t = 1 - distance / maxDist;
        const smoothT = t * t * (3 - 2 * t); // smoothstep
        targetScales[i] = 1 + (magnification - 1) * smoothT;
      } else {
        targetScales[i] = 1;
      }
    }

    cancelAnimationFrame(animationId);
    updateSpring();
  }

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
    targetScales = items.map(() => 1);
    cancelAnimationFrame(animationId);
    updateSpring();
  }

  onMount(() => {
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  });
</script>

<div
  bind:this={dockRef}
  class="dock-container"
  class:bottom={position === 'bottom'}
  class:left={position === 'left'}
  class:right={position === 'right'}
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  role="navigation"
  aria-label="Application dock"
>
  <div class="dock-glass"></div>
  <div class="dock-items" role="menubar">
    {#each items as item, i}
      <button
        class="dock-item"
        class:active={item.active}
        style="transform: scale({scales[i]});"
        on:click={() => item.onClick?.()}
        role="menuitem"
        aria-label={item.label}
        title={item.label}
      >
        <div class="dock-icon">{item.icon}</div>
        {#if item.badge && item.badge > 0}
          <span class="dock-badge">{item.badge}</span>
        {/if}
        {#if item.active}
          <div class="dock-indicator"></div>
        {/if}
        <!-- Tooltip -->
        <div class="dock-tooltip">
          {item.label}
        </div>
      </button>

      {#if i < items.length - 1 && items[i + 1]?.id === 'trash'}
        <div class="dock-separator"></div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .dock-container {
    position: fixed;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
  }

  .dock-container.bottom {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 20px;
  }

  .dock-container.left {
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    border-radius: 20px;
  }

  .dock-container.right {
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    border-radius: 20px;
  }

  /* Glass background */
  .dock-glass {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgba(20, 20, 25, 0.65);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    z-index: 0;
  }

  /* Dock items container */
  .dock-items {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    z-index: 1;
  }

  .dock-container.left .dock-items,
  .dock-container.right .dock-items {
    flex-direction: column;
  }

  /* Individual dock item */
  .dock-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: background-color 0.2s ease;
    will-change: transform;
    transform-origin: center bottom;
  }

  .dock-container.left .dock-item,
  .dock-container.right .dock-item {
    transform-origin: center left;
  }

  .dock-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .dock-item:active {
    transform: scale(0.95) !important;
  }

  /* Icon */
  .dock-icon {
    font-size: 28px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: filter 0.2s ease;
  }

  .dock-item:hover .dock-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  }

  /* Active indicator */
  .dock-indicator {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #00d992;
    box-shadow: 0 0 6px rgba(0, 217, 146, 0.6);
    transition: opacity 0.2s ease;
  }

  /* Badge */
  .dock-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #ff3b30;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Tooltip */
  .dock-tooltip {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.9);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 200;
  }

  .dock-container.left .dock-tooltip,
  .dock-container.right .dock-tooltip {
    bottom: auto;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%) translateX(-4px);
  }

  .dock-item:hover .dock-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .dock-container.left .dock-item:hover .dock-tooltip,
  .dock-container.right .dock-item:hover .dock-tooltip {
    transform: translateY(-50%) translateX(0);
  }

  /* Separator */
  .dock-separator {
    width: 1px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 4px;
  }

  .dock-container.left .dock-separator,
  .dock-container.right .dock-separator {
    width: 36px;
    height: 1px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .dock-item,
    .dock-icon,
    .dock-tooltip {
      transition: none !important;
      animation: none !important;
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .dock-container {
      padding: 6px 8px;
    }
    .dock-item {
      width: 44px;
      height: 44px;
    }
    .dock-icon {
      font-size: 22px;
    }
    .dock-tooltip {
      display: none;
    }
  }
</style>
