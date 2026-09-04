<script lang="ts">
  import frag from './coldopen.frag?raw';

  interface Props {
    /** Fires when the shell should take over. Always fires — on success, skip, or bail. */
    onbooted: () => void;
    /** Wordmark mask. Rasterize your dot-matrix SVG here for the real thing. */
    mark?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  }
  let { onbooted, mark = defaultMark }: Props = $props();

  const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  let visible = $state(true);
  let finish = $state<() => void>(() => onbooted());

  function defaultMark(c: CanvasRenderingContext2D, w: number, h: number) {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const size = Math.min(w * 0.26, h * 0.42);
    c.font = `500 ${size}px "Inter Tight", Inter, system-ui, sans-serif`;
    c.fillText('NIL', w / 2, h * 0.46);
  }

  // Attachment, not onMount — teardown is guaranteed and colocated.
  function coldopen(canvas: HTMLCanvasElement) {
    let raf = 0;
    let gl: WebGL2RenderingContext | null = null;
    let finished = false;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finishOnce = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      visible = false;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
      onbooted();
    };
    finish = finishOnce;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') finishOnce();
    };
    addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', finishOnce);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); finishOnce(); });

    gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: false,
      powerPreference: 'high-performance', desynchronized: true
    });
    if (!gl) { finishOnce(); return cleanup; }

    const compile = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src.trim());
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('[coldopen]', gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) { finishOnce(); return cleanup; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[coldopen]', gl.getProgramInfoLog(prog));
      finishOnce(); return cleanup;
    }
    gl.useProgram(prog);

    const U = (n: string) => gl!.getUniformLocation(prog, n);
    const uRes = U('uRes'), uTime = U('uTime'), uDpr = U('uDpr'),
          uReduced = U('uReduced'), uDots = U('uDots');

    const markCanvas = document.createElement('canvas');
    const tex = gl.createTexture();
    let dpr = 1;

    const resize = () => {
      if (!gl) return;
      dpr = Math.min(devicePixelRatio || 1, 2);           // capped: 3x buys nothing here
      const w = Math.floor(innerWidth * dpr), h = Math.floor(innerHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);

      markCanvas.width = w; markCanvas.height = h;
      mark(markCanvas.getContext('2d')!, w, h);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, markCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(U('uMark'), 0);
    };
    addEventListener('resize', resize, { passive: true });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);         // premultiplied
    resize();

    let t0 = 0, frames = 0, slow = 0;

    const draw = (now: number) => {
      if (finished || !gl) return;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;

      // Perf gate — a stuttering boot screen is worse than none.
      frames++;
      if (frames > 6 && frames < 60 && t / frames > 0.022) slow++;
      if (slow > 20) return finishOnce();

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uReduced, reduced ? 1 : 0);
      gl.uniform1f(uDots, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (t > 4.9) return finishOnce();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    function cleanup() {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', onKey);
      removeEventListener('resize', resize);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
    }
    return cleanup;
  }
</script>

<!--
  The shell mounts, lays out, and loads data UNDERNEATH this. The canvas is a
  cover, not a gate — if the shader never starts, the app is already usable.
-->
{#if visible}
  <canvas class="coldopen" {@attach coldopen}></canvas>
  <button class="skip" type="button" onclick={() => finish()}>Skip</button>
{/if}

<style>
  .coldopen {
    position: fixed; inset: 0; inline-size: 100%; block-size: 100%;
    display: block; z-index: var(--z-overlay);
  }
  .skip {
    position: fixed; inset-block-end: var(--s-5); inset-inline-end: var(--s-5);
    z-index: calc(var(--z-overlay) + 1);
    font: var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick); text-transform: uppercase;
    color: var(--nil-ink-3); background: none; border: 0; cursor: pointer;
    padding: var(--s-2); transition: color var(--dur-flip) var(--ease-out);
  }
  .skip:hover { color: var(--nil-ink-2); }
  .skip:focus-visible { outline: 2px solid var(--nil-halo); outline-offset: 2px; }
</style>
