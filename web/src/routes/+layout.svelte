<script>
  import '../app.css';
  let { children } = $props();
</script>

<!-- SVG filter for liquid-glass accent (CSS-Tricks feTurbulence + feDisplacementMap) -->
<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <filter id="liquid-glass-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>

{@render children()}
