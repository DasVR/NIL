#version 300 es
// ============================================================
// NIL — titlebar liquid metal (Zone B: metered, ≤30fps, one strip)
// Anisotropic brushed-steel normal field lit by a single moving
// source — the pointer bends it when present, otherwise it drifts
// on its own so the strip is never dead. Cheaper cousin of the
// cold-open METAL movement (gl/coldopen.frag): fewer fbm octaves,
// no glass pass, no Zone A ember accent — this stays neutral steel,
// per "color means risk" (see .cursor/rules/40-nil-gpu.mdc, Zone A
// vs B). uPending nudges tempo only, never hue.
// ============================================================
precision highp float;

uniform vec2  uRes;      // drawing buffer size, device px, already ≤0.75x scaled
uniform float uTime;     // seconds since mount; frozen by the host while paused
uniform float uDpr;      // capped device pixel ratio
uniform float uReduced;  // 1.0 = prefers-reduced-motion → hold a single resting frame
uniform vec2  uPointer;  // uv-space pointer x/y; (-2,-2) sentinel = drive from time instead
uniform float uPending;  // 0..1 — waiting on an approval gate: a touch livelier, never louder

out vec4 frag;

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
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p *= 2.1; a *= 0.5; }
  return s;
}

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// Anisotropy is the whole trick: noise stretched hard along X reads as
// machined strokes, not concrete. Three octaves, not five — this runs
// under a titlebar for the life of the session, budget accordingly.
float brushHeight(vec2 uv) {
  vec2 q = vec2(uv.x * 10.0, uv.y * 160.0);
  return fbm(q) * 0.6 + fbm(q * 2.6) * 0.4;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  float t = uReduced > 0.5 ? 0.0 : uTime;
  float speed = mix(0.05, 0.085, uPending);

  float e  = 1.0 / uRes.y;
  float h  = brushHeight(uv);
  float hx = brushHeight(uv + vec2(e, 0.0));
  float hy = brushHeight(uv + vec2(0.0, e));
  vec3  n  = normalize(vec3((h - hx) * 34.0, (h - hy) * 5.0, 1.0));

  // Light source: bends toward the pointer when one is over the strip,
  // otherwise drifts on a slow autonomous sweep so it's never static.
  float drift  = fract(t * speed) * 2.4 - 0.7;
  float sweepX = uPointer.x > -1.5 ? uPointer.x * 2.4 - 0.7 : drift;
  vec3  L = normalize(vec3(sweepX - uv.x * 2.0 + 1.0, 0.4, 0.6));
  vec3  H = normalize(L + vec3(0.0, 0.0, 1.0));

  float spec = pow(max(dot(n, H), 0.0), 70.0);
  float diff = max(dot(n, L), 0.0) * 0.5 + 0.5;
  float fres = pow(1.0 - max(n.z, 0.0), 3.0);

  vec3 base = vec3(0.086, 0.090, 0.096);
  vec3 col  = base + diff * 0.05 + spec * 0.85 + fres * 0.05;

  float streak = pow(max(0.0, 1.0 - abs(uv.x - (sweepX * 0.5 + 0.5)) * 2.0), 5.0);
  col += streak * (0.08 + h * 0.16);

  // 1/255 ordered dither kills 8-bit banding on a near-black strip — cheap,
  // always worth it (see coldopen.frag).
  col += (bayer8(px / uDpr) - 0.5) / 96.0;

  float alpha = clamp(0.22 + spec * 0.9 + h * 0.12, 0.0, 1.0);
  frag = vec4(col * alpha, alpha); // premultiplied
}
