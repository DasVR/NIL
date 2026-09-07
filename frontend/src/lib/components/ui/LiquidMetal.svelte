<script lang="ts">
  import frag from '$lib/gl/liquidmetal.frag?raw';

  interface Props {
    paused?: boolean;
    /** True while a tool call is waiting on the practitioner — tempo only, never color. */
    pending?: boolean;
  }

  let { paused = false, pending = false }: Props = $props();

  // Zone B budget (.cursor/rules/40-nil-gpu.mdc): one context, ≤30fps,
  // ≤0.75x resolution scale, paused on blur/hidden/reduced-motion and
  // whenever an agent run is streaming.
  const FPS = 30;
  const FRAME = 1000 / FPS;

  function drawStaticFallback(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(232,230,227,0.06)');
    g.addColorStop(1, 'rgba(232,230,227,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Attachment, not onMount — teardown is guaranteed and colocated (see gl/ColdOpen.svelte).
  function liquidMetal(node: HTMLCanvasElement) {
    let raf = 0;
    let gl: WebGL2RenderingContext | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hidden = false;
    let dpr = 1;
    let last = 0;
    let t0 = 0;
    let frames = 0;
    let slow = 0;
    let bailed = false;
    let pointer = { x: -2, y: -2 };

    const onReduce = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      if (reduced && gl) drawOnce(performance.now());
    };
    const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
    reduceQuery.addEventListener('change', onReduce);

    const onVis = () => { hidden = document.hidden || !document.hasFocus(); };
    document.addEventListener('visibilitychange', onVis);
    addEventListener('blur', onVis);
    addEventListener('focus', onVis);

    const onPointerMove = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / Math.max(1, r.width);
      pointer.y = 1 - (e.clientY - r.top) / Math.max(1, r.height);
    };
    const onPointerLeave = () => { pointer.x = -2; pointer.y = -2; };
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerleave', onPointerLeave);

    const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

    const compile = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src.trim());
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('[liquidmetal]', gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uDpr: WebGLUniformLocation | null = null;
    let uReduced: WebGLUniformLocation | null = null;
    let uPointer: WebGLUniformLocation | null = null;
    let uPending: WebGLUniformLocation | null = null;

    function bailToFallback() {
      bailed = true;
      cancelAnimationFrame(raf);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
      ctx2d = node.getContext('2d');
      resize2d();
    }

    function resize2d() {
      if (!ctx2d) return;
      dpr = Math.min(devicePixelRatio || 1, 2) * 0.75;
      const w = node.offsetWidth, h = node.offsetHeight;
      node.width = Math.floor(w * dpr);
      node.height = Math.floor(h * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStaticFallback(ctx2d, w, h);
    }

    function resizeGl() {
      if (!gl) return;
      dpr = Math.min(devicePixelRatio || 1, 2) * 0.75; // Zone B: ≤0.75x resolution scale
      const w = Math.max(1, Math.floor(node.offsetWidth * dpr));
      const h = Math.max(1, Math.floor(node.offsetHeight * dpr));
      if (node.width === w && node.height === h) return;
      node.width = w; node.height = h;
      gl.viewport(0, 0, w, h);
    }

    function drawOnce(now: number) {
      if (!gl) return;
      resizeGl();
      gl.uniform2f(uRes, node.width, node.height);
      gl.uniform1f(uTime, reduced ? 0 : (now - t0) / 1000);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uReduced, reduced ? 1 : 0);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPending, pending ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (bailed || paused || hidden || reduced) return;
      if (now - last < FRAME) return;
      const delta = now - last;
      last = now;
      if (!t0) t0 = now;

      // Perf gate — sample the first ~60 frames; a stuttering titlebar
      // strip is worse than the flat gradient it replaces.
      frames++;
      if (frames > 6 && frames < 60 && delta > FRAME * 2.5) slow++;
      if (slow > 20) return bailToFallback();

      drawOnce(now);
    }

    gl = node.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: false,
      powerPreference: 'low-power', desynchronized: true,
    });

    if (gl) {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      const prog = vs && fs ? gl.createProgram()! : null;
      if (prog && vs && fs) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
      }
      if (!vs || !fs || !prog || !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        if (prog) console.error('[liquidmetal]', gl.getProgramInfoLog(prog));
        bailToFallback();
      } else {
        gl.useProgram(prog);
        uRes = gl.getUniformLocation(prog, 'uRes');
        uTime = gl.getUniformLocation(prog, 'uTime');
        uDpr = gl.getUniformLocation(prog, 'uDpr');
        uReduced = gl.getUniformLocation(prog, 'uReduced');
        uPointer = gl.getUniformLocation(prog, 'uPointer');
        uPending = gl.getUniformLocation(prog, 'uPending');
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        node.addEventListener('webglcontextlost', (e) => { e.preventDefault(); bailToFallback(); });
        resizeGl();
        drawOnce(performance.now());
        if (!reduced) raf = requestAnimationFrame(loop);
      }
    } else {
      bailToFallback();
    }

    return () => {
      cancelAnimationFrame(raf);
      reduceQuery.removeEventListener('change', onReduce);
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('blur', onVis);
      removeEventListener('focus', onVis);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerleave', onPointerLeave);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
    };
  }
</script>

<canvas class="liquid-metal-canvas" {@attach liquidMetal} aria-hidden="true"></canvas>

<style>
  .liquid-metal-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
