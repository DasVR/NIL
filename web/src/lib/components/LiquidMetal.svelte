<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Props
  export let intensity: number = 0.22;        // 0.0 to 1.0
  export let speed: number = 1.0;              // animation speed
  export let color1: string = '#00d992';       // primary accent
  export let color2: string = '#050507';       // secondary dark
  export let interactive: boolean = true;       // mouse reaction

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext | null;
  let animationId: number;
  let mouseX: number = 0.5;
  let mouseY: number = 0.5;
  let time: number = 0;

  // Vertex shader — full-screen quad
  const VERT = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader — liquid metal effect
  const FRAG = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_intensity;
    uniform float u_speed;
    uniform vec3 u_color1;
    uniform vec3 u_color2;

    // Simplex noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float sum = 0.0;
      float amp = 1.0;
      float freq = 1.0;
      for(int i = 0; i < 5; i++) {
        sum += amp * snoise(p * freq);
        freq *= 2.0;
        amp *= 0.5;
      }
      return sum;
    }

    float metaball(vec2 p, vec2 center, float radius) {
      float d = length(p - center);
      return radius / d;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      uv.x *= aspect;

      float t = u_time * u_speed * 0.5;

      // Liquid distortion
      vec2 p = uv;
      p.x += fbm(uv * 3.0 + t * 0.3) * u_intensity * 0.3;
      p.y += fbm(uv * 3.0 + t * 0.2 + 100.0) * u_intensity * 0.3;

      // Mouse interaction
      vec2 mouse = u_mouse;
      mouse.x *= aspect;
      float mouseDist = length(p - mouse);
      float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * u_intensity;
      p += (mouse - p) * mouseInfluence * 0.2;

      // Metallic sheen
      float metal = fbm(p * 4.0 + t * 0.1);
      metal = metal * 0.5 + 0.5;

      // Liquid pools
      float pool1 = metaball(p, vec2(0.3 + sin(t*0.4)*0.2, 0.5 + cos(t*0.3)*0.15), 0.15 + sin(t)*0.05);
      float pool2 = metaball(p, vec2(0.7 + cos(t*0.35)*0.2, 0.4 + sin(t*0.45)*0.15), 0.12 + cos(t*0.7)*0.04);
      float pool3 = metaball(p, vec2(0.5 + sin(t*0.25)*0.1, 0.7 + cos(t*0.5)*0.1), 0.1);

      float pools = clamp(pool1 + pool2 + pool3, 0.0, 1.0);
      pools = smoothstep(0.3, 0.8, pools);

      // Specular highlights
      float spec = pow(metal, 8.0) * pools;

      // Color mixing
      vec3 base = mix(u_color2, u_color1, metal * 0.4 + pools * 0.6);
      vec3 highlight = vec3(1.0, 1.0, 1.0) * spec * 0.8;
      vec3 ambient = u_color2 * 0.3;

      vec3 color = base + highlight + ambient;

      // Add subtle scanlines
      float scanline = sin(uv.y * u_resolution.y * 0.8) * 0.03 + 0.97;
      color *= scanline;

      // Vignette
      float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - vec2(aspect * 0.5, 0.5)));
      color *= vignette * 0.5 + 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [0, 0, 0];
  }

  function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  function resize() {
    if (!canvas || !gl) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render() {
    if (!gl) return;
    time += 0.016;

    gl.clearColor(0.02, 0.02, 0.04, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouseX, mouseY);
    gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
    gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speed);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color1'), rgb1[0], rgb1[1], rgb1[2]);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color2'), rgb2[0], rgb2[1], rgb2[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationId = requestAnimationFrame(render);
  }

  let program: WebGLProgram;

  onMount(() => {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vertShader || !fragShader) return;

    program = createProgram(gl, vertShader, fragShader);
    if (!program) return;

    gl.useProgram(program);

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    resize();
    render();

    window.addEventListener('resize', resize);

    if (interactive) {
      const handleMouse = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
      };
      canvas.addEventListener('mousemove', handleMouse);
      return () => canvas.removeEventListener('mousemove', handleMouse);
    }
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    if (gl) {
      gl.deleteProgram(program);
      gl = null;
    }
  });
</script>

<canvas
  bind:this={canvas}
  class="liquid-metal-canvas"
  style="width: 100%; height: 100%; display: block;"
></canvas>

<style>
  .liquid-metal-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .liquid-metal-canvas {
      display: none;
    }
  }
</style>
