#version 300 es
// ============================================================
// NIL — cold open
// One fullscreen triangle, one fragment shader, no geometry.
// Four movements, driven entirely by uTime:
//   0.0–2.4s  METAL   raking light reveals anisotropic brushed steel
//   1.7–3.1s  DITHER  the wordmark resolves out of the metal (Bayer 8x8)
//   2.5–4.1s  GLASS   a refractive slab settles into the app-shell rect
//   4.0–4.8s  HANDOFF alpha falls, DOM shell takes over underneath
// ============================================================
precision highp float;

uniform vec2      uRes;      // drawing buffer size in device px
uniform float     uTime;     // seconds since first frame
uniform float     uDpr;      // capped device pixel ratio
uniform float     uReduced;  // 1.0 = prefers-reduced-motion → jump to final frame
uniform float     uDots;     // 1.0 = punch the wordmark through a dot-matrix grid
uniform sampler2D uMark;     // wordmark alpha mask, fitted to viewport

out vec4 frag;

// ---------------- noise ----------------
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i),               hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0,1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.02; a *= 0.5; }
  return s;
}

// ---------------- ordered dither ----------------
// Compact recursive Bayer. Sampled in device-INDEPENDENT pixels so the
// pattern stays visible on retina instead of dissolving into grey.
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// ---------------- sdf ----------------
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// ---------------- brushed metal ----------------
// Anisotropy is the whole trick: noise stretched ~90:1 along X reads as
// machined strokes. Isotropic noise here would look like concrete.
float brushHeight(vec2 uv) {
  vec2 q = vec2(uv.x * 6.0, uv.y * 520.0);
  return fbm(q) * 0.6 + fbm(q * 3.1) * 0.4;
}

vec3 metal(vec2 uv, float t) {
  float e  = 1.0 / uRes.y;
  float h  = brushHeight(uv);
  float hx = brushHeight(uv + vec2(e, 0.0));
  float hy = brushHeight(uv + vec2(0.0, e));
  // Normal is deliberately lopsided — steep across the grain, flat along it.
  vec3  n  = normalize(vec3((h - hx) * 40.0, (h - hy) * 6.0, 1.0));

  float sweep = mix(-1.4, 1.6, smoothstep(0.0, 1.0, t));
  vec3  L = normalize(vec3(sweep - uv.x * 2.0 + 1.0, 0.35, 0.55));
  vec3  H = normalize(L + vec3(0.0, 0.0, 1.0));

  float spec = pow(max(dot(n, H), 0.0), 90.0);
  float diff = max(dot(n, L), 0.0);
  float fres = pow(1.0 - max(n.z, 0.0), 3.0);

  // Zone A identity accent (--brand-ember-500, see tokens.css): the raking
  // light itself carries the one named exception to "color means risk." Kept
  // to a partial mix so the metal still reads neutral off-highlight — this is
  // a glint, not a tint wash. Never do this outside Zone A.
  vec3 emberLight = vec3(0.741, 0.341, 0.176);
  vec3 specCol = mix(vec3(1.0), emberLight, 0.5);

  vec3 col = vec3(0.055, 0.062, 0.068) + diff * 0.10 + spec * 0.85 * specCol + fres * 0.06;

  // The raking highlight band. This is what makes it read as a lit surface
  // rather than a texture.
  float streak = pow(max(0.0, 1.0 - abs(uv.x - (sweep * 0.5 + 0.5)) * 2.2), 6.0);
  return col + streak * (0.10 + h * 0.22) * mix(vec3(1.0), emberLight, 0.35);
}

// ---------------- scene ----------------
// Everything beneath the glass. Written as a function so the glass pass can
// resample it at an offset — that IS the refraction. There is no second pass.
vec3 scene(vec2 uv, vec2 px, float tMetal, float tDither) {
  vec3 col = metal(uv, tMetal);

  float mark = texture(uMark, vec2(uv.x, 1.0 - uv.y)).a;

  // Dot-matrix grid, carried over from the DasDev wordmark study.
  if (uDots > 0.5) {
    vec2 g = fract(px / (6.0 * uDpr)) - 0.5;
    mark *= 1.0 - smoothstep(0.30, 0.42, length(g));
  }

  // Ordered dithering as EMERGENCE: the threshold falls over time, so the
  // mark precipitates out of the noise instead of cross-fading in.
  float rise = smoothstep(0.0, 1.0, tDither);
  float lit  = step(bayer8(px / uDpr), clamp(mark * rise * 1.35 - (1.0 - rise) * 0.2, 0.0, 1.0));

  return mix(col, col + vec3(0.62, 0.60, 0.58) * mark, lit * 0.9);
}

void main() {
  vec2  px = gl_FragCoord.xy;
  vec2  uv = px / uRes;
  float t  = uReduced > 0.5 ? 5.0 : uTime;

  float tMetal  = smoothstep(0.5, 2.4, t);
  float tDither = smoothstep(1.7, 3.1, t);
  float tGlass  = smoothstep(2.5, 4.1, t);
  float tOut    = smoothstep(4.0, 4.8, t);

  vec3 col = scene(uv, px, tMetal, tDither);

  // ---------------- liquid glass ----------------
  // Screen-space, like every "real" glass material on a 2D compositor:
  // bend the sampled UV near the edge, split it per channel, add a rim.
  vec2  ar   = vec2(uRes.x / uRes.y, 1.0);
  vec2  p    = (uv - 0.5) * ar;
  float ease = tGlass * tGlass * (3.0 - 2.0 * tGlass);

  // The slab starts as a thin sliver below frame and grows into the panel rect.
  vec2  halfSize = mix(vec2(0.62, 0.02), vec2(0.42, 0.30), ease);
  float d = sdRoundBox(p - vec2(0.0, mix(-0.55, 0.0, ease)), halfSize, 0.035);

  float inside = smoothstep(0.004, -0.004, d);
  float edge   = smoothstep(0.030, 0.0, abs(d));

  // Derivatives must be computed in uniform control flow — never inside an
  // `if (tGlass > 0)` branch, or the gradient is undefined at the boundary.
  vec2 grad = normalize(vec2(dFdx(d), dFdy(d)) + vec2(1e-6));
  float bend = inside * (1.0 - smoothstep(0.0, 0.14, -d)) * 0.055;

  vec3 refr;
  refr.r = scene(uv - grad * bend * 1.00, px, tMetal, tDither).r;
  refr.g = scene(uv - grad * bend * 1.12, px, tMetal, tDither).g;
  refr.b = scene(uv - grad * bend * 1.26, px, tMetal, tDither).b;

  // "Liquid": a slow field displacing the interior so the slab never reads flat.
  refr += (fbm(uv * 3.0 + vec2(0.0, t * 0.28)) - 0.5) * 0.05 * inside;

  vec3 glassCol = mix(refr, refr * 0.82 + vec3(0.10, 0.11, 0.12), 0.45);
  glassCol += edge * 0.28;                                                    // rim
  glassCol += pow(max(0.0, 1.0 - abs(uv.y - 0.68) * 6.0), 3.0) * inside * 0.05; // sheen

  col = mix(col, glassCol, inside * tGlass);

  // ---------------- grain, vignette, banding ----------------
  col += (hash21(px + fract(t) * 91.7) - 0.5) * 0.028;
  col *= 1.0 - 0.42 * pow(length((uv - 0.5) * vec2(1.1, 1.0)), 2.2);

  // Second, invisible use of dithering: 1/255 of ordered noise on the final
  // color kills 8-bit banding across the dark gradient. Cheap, always worth it.
  col += (bayer8(px) - 0.5) / 255.0;

  // Hand off to the DOM by falling out on alpha, not by fading to black.
  float a = 1.0 - tOut;
  frag = vec4(col * a, a); // premultiplied
}
