<script lang="ts">
  /**
   * NIL identity monogram — Zone A only (cold open, lock screen, session
   * handoff, report export cover). See .cursor/rules/00-nil-design-language.mdc
   * Law 1 and .cursor/rules/40-nil-gpu.mdc.
   *
   * This replaces the two orphaned, unimported "ThinkingLogo" components
   * (components/ui/ThinkingLogo.svelte, components/effects/ThinkingLogo.svelte)
   * and the ThinkingOrbs canvas particle effect. Neither was ever wired into
   * the app — the real "agent is working" indicator already exists and is
   * correct: SCANLINE, live in ToolBlock.svelte / AgentStream.svelte /
   * StatusBar.svelte. This component is NOT that indicator. It is the app's
   * identity mark for the four Zone A moments, nothing else — do not import
   * it into workstation chrome (Zone B) or the stream/findings/terminal
   * (Zone C); those stay greyscale and use SCANLINE for "working".
   *
   * States are deliberately narrow: idle (resting mark), active (a Zone A
   * transition is in flight — session handoff, report export rendering),
   * resolved (transition complete, one-shot settle). There is no "thinking"
   * or "streaming" state here; that vocabulary belongs to the agent stream.
   */
  import { onMount } from 'svelte';

  interface Props {
    state?: 'idle' | 'active' | 'resolved';
    size?: number;
  }

  let { state: markState = 'idle', size = 32 }: Props = $props();

  let reducedMotion = $state(false);

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches || document.documentElement.classList.contains('reduce-motion');
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches || document.documentElement.classList.contains('reduce-motion');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });
</script>

<div
  class="nil-monogram nil-monogram--{markState}"
  class:reduced={reducedMotion}
  style:width="{size}px"
  style:height="{size}px"
  aria-label="NIL"
  role="img"
>
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="n-shape">
      <rect x="4" y="4" width="6" height="24" rx="1" />
      <rect x="22" y="4" width="6" height="24" rx="1" />
      <path d="M10 4 L16 4 L22 28 L16 28 Z" />
    </g>
  </svg>
</div>

<style>
  .nil-monogram {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: visible;
  }

  .nil-monogram svg {
    width: 100%;
    height: 100%;
  }

  /* Idle: resting ink mark. No motion, no glow — this is the default state
     for the vast majority of the time this mark is on screen. */
  .n-shape > * {
    fill: var(--nil-ink-2);
    transition: fill var(--dur-panel) var(--ease-out);
  }

  /* Active: a Zone A transition is in flight. This is the one sanctioned
     use of --brand-ember-* outside a shader — a resting ember fill plus the
     SCANLINE sweep convention, reused here instead of inventing a new
     primitive. Never do this in Zone B/C; use SCANLINE + ink there instead. */
  .nil-monogram--active .n-shape > * {
    fill: var(--brand-ember-500);
  }
  .nil-monogram--active:not(.reduced) {
    overflow: clip;
  }
  .nil-monogram--active:not(.reduced)::after {
    content: '';
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    block-size: 1px;
    background: linear-gradient(90deg, transparent, var(--brand-ember-300), transparent);
    animation: nil-monogram-scan 1.4s var(--ease-mono) infinite;
  }

  /* Resolved: one-shot settle from ember back to ink. Bounded and single-fire
     (not a loop), scoped to this Zone A component only — motion.css's ten
     primitives govern Zone B/C, not Zone A DOM elements (see 10-nil-motion.mdc
     scope note), so a one-shot keyframe here is not the bug that rule exists
     to prevent. */
  .nil-monogram--resolved .n-shape > * {
    fill: var(--nil-ink);
  }
  .nil-monogram--resolved:not(.reduced) .n-shape > * {
    animation: nil-monogram-resolve var(--dur-stage) var(--ease-out);
  }

  @keyframes nil-monogram-scan {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  @keyframes nil-monogram-resolve {
    0% { fill: var(--brand-ember-500); }
    100% { fill: var(--nil-ink); }
  }

  /* prefers-reduced-motion: jump to the final frame, composition still
     shown, motion removed — see 40-nil-gpu.mdc lifecycle item 8. */
  .reduced.nil-monogram--active .n-shape > * {
    fill: var(--brand-ember-500);
  }
  .reduced.nil-monogram--resolved .n-shape > * {
    fill: var(--nil-ink);
  }
</style>
