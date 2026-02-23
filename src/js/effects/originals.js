/**
 * Originals Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

register('flow', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.15;

  vec2 q = vec2(fbm(uv + t), fbm(uv + 1.0));
  vec2 r = vec2(fbm(uv + q + t), fbm(uv + q + 2.0));
  float f = fbm(uv + r);

  vec3 col = mix(vec3(0.1, 0.2, 0.4), vec3(0.9, 0.5, 0.2), f);
  col = mix(col, vec3(0.95), dot(q, q) * 0.4);

  fragColor = vec4(col, 1.0);
}`, { name: 'Flow Field', desc: 'Domain-warped noise' });

register('rain', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 col = vec3(0.02, 0.02, 0.06);

  for (float i = 0.0; i < 3.0; i++) {
    float scale = 25.0 + i * 12.0;
    float speed = 2.5 + i * 0.5;

    vec2 st = uv * vec2(scale, scale * 0.4);
    st.y += u_time * speed;

    vec2 id = floor(st);
    vec2 f = fract(st);
    float h = hash(id);

    float drop = smoothstep(0.0, 0.15, f.y) * smoothstep(0.5, 0.15, f.y);
    drop *= step(h, 0.25 + i * 0.08);

    col += vec3(0.3, 0.4, 0.5) * drop * (1.0 - i * 0.25) * 0.4;
  }

  // Lightning
  float lightning = step(0.997, hash(vec2(floor(u_time * 1.5), 0.0)));
  col += vec3(0.4, 0.4, 0.6) * lightning;

  fragColor = vec4(col, 1.0);
}`, { name: 'Rain', desc: 'Rainfall with lightning' });

register('lava', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.25;

  float d = 0.0;
  for (float i = 0.0; i < 7.0; i++) {
    float a = i * 0.898;
    vec2 center = vec2(sin(t + a), cos(t * 0.7 + a)) * 0.35;
    center.y += sin(t * 0.4 + i) * 0.12;
    d += 0.025 / (length(uv - center) + 0.008);
  }

  vec3 col = mix(vec3(0.7, 0.1, 0.0), vec3(1.0, 0.7, 0.0), smoothstep(0.6, 2.5, d));
  col = mix(vec3(0.15, 0.0, 0.0), col, smoothstep(0.35, 0.6, d));

  fragColor = vec4(col, 1.0);
}`, { name: 'Lava Lamp', desc: 'Metaball blobs' });

register('neongrid', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;
  float horizon = 0.5;
  vec3 col = vec3(0.0);

  if (uv.y < horizon) {
    float depth = (horizon - uv.y) / horizon;
    float z = 1.0 / (depth + 0.001);
    float x = (uv.x - 0.5) * z * 2.0;

    float gz = mod(z + t * 3.0, 1.0);
    float gx = mod(x, 1.0);

    float lineZ = smoothstep(0.05, 0.0, abs(gz - 0.5) - 0.47);
    float lineX = smoothstep(0.05, 0.0, abs(gx - 0.5) - 0.47);
    float grid = max(lineZ, lineX) * exp(-depth * 0.5);

    col = grid * vec3(0.8, 0.0, 0.9);
  } else {
    float skyT = (uv.y - horizon) / (1.0 - horizon);
    col = mix(vec3(0.15, 0.0, 0.2), vec3(0.0, 0.0, 0.05), skyT);

    // Sun
    vec2 sunPos = vec2(0.5, 0.65);
    float sunDist = length(uv - sunPos);
    float sun = smoothstep(0.12, 0.11, sunDist);
    sun *= mix(1.0, step(0.5, fract(uv.y * 40.0)), smoothstep(0.04, 0.12, sunDist));

    col += sun * mix(vec3(1.0, 0.9, 0.2), vec3(1.0, 0.2, 0.5), smoothstep(0.0, 0.12, sunDist));
    col += vec3(1.0, 0.3, 0.5) * exp(-sunDist * 6.0) * 0.3;
  }

  col += vec3(0.8, 0.2, 0.9) * exp(-abs(uv.y - horizon) * 20.0) * 0.3;
  fragColor = vec4(col, 1.0);
}`, { name: 'Neon Grid', desc: 'Synthwave sunset' });

register('fireworks', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 6.0; i++) {
    float t = mod(u_time + i * 1.1, 2.5);
    float h = hash(vec2(i, floor((u_time + i * 1.1) / 2.5)));

    vec2 center = vec2((h - 0.5) * 1.2, 0.25 - t * 0.25);

    if (t > 0.8) {
      float explode = t - 0.8;
      for (float j = 0.0; j < 24.0; j++) {
        float angle = j * 6.28 / 24.0;
        float speed = 0.25 + hash(vec2(i, j)) * 0.15;
        vec2 pPos = center + vec2(cos(angle), sin(angle)) * speed * explode;
        pPos.y -= explode * explode * 0.4;

        vec3 hue = 0.5 + 0.5 * cos(6.28 * (h + vec3(0.0, 0.33, 0.67)));
        col += hue * smoothstep(0.015, 0.0, length(uv - pPos)) * (1.0 - explode * 0.6);
      }
    } else {
      vec2 rocket = vec2(center.x, -0.5 + t * 0.9);
      col += vec3(1.0, 0.7, 0.3) * smoothstep(0.015, 0.0, length(uv - rocket));
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Fireworks', desc: 'Procedural firework bursts' });

register('fractal', `
vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.1, 0.2);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

  // Zoom target: Seahorse valley
  vec2 target = vec2(-0.743643887037151, 0.131825904205330);
  float zoom = exp(mod(u_time * 0.3, 14.0));

  vec2 c = target + uv / zoom;
  vec2 z = vec2(0.0);
  float iter = 0.0;
  const float maxIter = 200.0;

  for (float i = 0.0; i < maxIter; i++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if (dot(z,z) > 4.0) { iter = i; break; }
    iter = i;
  }

  vec3 col = vec3(0.0);
  if (iter < maxIter - 1.0) {
    // Smooth iteration count
    float sl = iter - log2(log2(dot(z,z))) + 4.0;
    float t = sl / 50.0 + u_time * 0.02;
    col = palette(t);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Fractal Zoom', desc: 'Mandelbrot deep zoom' });

// aSS Original 3D Pipes - colorful modern raymarched pipes
register('pipes', `
#define MAX_STEPS 80
#define MAX_DIST 30.0
#define SURF_DIST 0.01

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h) - r;
}

float map(vec3 p) {
    vec3 id = floor(p / 2.0);
    vec3 q = mod(p, 2.0) - 1.0;

    float d = 1e10;

    // X-axis pipes
    if (hash(id.yz) > 0.3) {
        d = min(d, length(q.yz) - 0.08);
    }
    // Y-axis pipes
    if (hash(id.xz + 100.0) > 0.3) {
        d = min(d, length(q.xz) - 0.08);
    }
    // Z-axis pipes
    if (hash(id.xy + 200.0) > 0.3) {
        d = min(d, length(q.xy) - 0.08);
    }

    // Joints at intersections
    d = min(d, length(q) - 0.12);

    return d;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;

    float t = u_time * 0.3;
    vec3 ro = vec3(sin(t) * 4.0, 2.0 + sin(t * 0.7) * 2.0, t * 2.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    rd.xy *= rot(sin(t * 0.3) * 0.3);
    rd.xz *= rot(t * 0.2);

    float d0 = 0.0;
    vec3 col = vec3(0.02, 0.02, 0.05);

    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;

        if(dS < SURF_DIST) {
            // Normal calculation
            vec2 e = vec2(0.01, 0.0);
            vec3 n = normalize(vec3(
                map(p + e.xyy) - map(p - e.xyy),
                map(p + e.yxy) - map(p - e.yxy),
                map(p + e.yyx) - map(p - e.yyx)
            ));

            // Colorful gradient based on position
            vec3 id = floor(p / 2.0);
            vec3 pipeCol = 0.5 + 0.5 * cos(id.x * 0.5 + id.y * 0.7 + id.z * 0.3 + vec3(0, 2, 4) + t);

            // Lighting
            vec3 light = normalize(vec3(1.0, 1.0, -0.5));
            float diff = max(dot(n, light), 0.0) * 0.7 + 0.3;
            float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);

            col = pipeCol * diff + vec3(1.0) * spec * 0.4;

            // Distance fog
            col = mix(col, vec3(0.02, 0.02, 0.05), 1.0 - exp(-d0 * 0.08));
            break;
        }

        if(d0 > MAX_DIST) break;
    }

    fragColor = vec4(col, 1.0);
}`, { name: '3D Pipes', desc: 'Colorful raymarched pipe network' });

register('pipes_ag', `
#define MAX_STEPS 60
#define MAX_DIST 35.0
#define SURF_DIST 0.015

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    vec3 id = floor(p);
    p = fract(p) - 0.5;
    
    // Pipes
    float d1 = length(p.xy) - 0.1;
    float d2 = length(p.yz) - 0.1;
    float d3 = length(p.xz) - 0.1;
    float d = min(min(d1, d2), d3);
    
    // Add joints
    d = min(d, length(p) - 0.15);
    
    return d;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;
    
    vec3 ro = vec3(0.0, 0.0, u_time*2.0);
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));
    
    rd.xy *= rot(u_time*0.2);
    rd.xz *= rot(sin(u_time*0.1)*0.2);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        // Neon glow along the step
        float g = 0.005 / (0.001 + dS*dS);
        vec3 cell = floor(p);
        vec3 glowCol = 0.5 + 0.5*cos(cell.x*0.1 + cell.y*0.2 + cell.z*0.3 + u_time + vec3(0,2,4));
        col += glowCol * g * 0.02;
        
        if(d0 > MAX_DIST || dS < SURF_DIST) break;
    }
    
    col = mix(col, vec3(0.01, 0.0, 0.05), smoothstep(10.0, MAX_DIST, d0));
    fragColor = vec4(col, 1.0);
}`, { name: 'Cyberpipes', desc: 'Neon Cyberpunk Pipes -Antigravity' });

register('matrix_ag', `
#define MAX_STEPS 60
#define MAX_DIST 25.0

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

float map(vec3 p) {
    vec3 id = floor(p * 3.0);
    vec3 f = fract(p * 3.0) - 0.5;
    if (hash(id.xz) < 0.5) return 2.0;
    return (max(max(abs(f.x), abs(f.y)), abs(f.z)) - 0.3) / 3.0;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(sin(u_time * 0.3), -u_time * 3.0, cos(u_time * 0.2));
    vec3 rd = normalize(vec3(uv.x, uv.y - 0.5, 1.0));
    rd.xz *= rot(sin(u_time * 0.15) * 0.3);
    rd.xy *= rot(cos(u_time * 0.1) * 0.2);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        if (dS < 0.05) {
            vec3 id = floor(p * 3.0);
            float speed = 5.0 + hash(id.xz) * 5.0;
            float head = floor(mod(-u_time * speed + hash(id.xz + 12.3) * 100.0, 60.0) - 10.0);
            
            if (id.y >= head && id.y < head + 15.0) {
                float intensity = 1.0 - (id.y - head) / 15.0;
                vec3 glow = (id.y == head) ? vec3(0.8, 1.0, 0.8) : vec3(0.1, 0.8, 0.2);
                col += glow * intensity * (0.5 + 0.5 * hash(id.xy + floor(u_time * 15.0))) * 0.03 / (1.0 + dS*20.0);
            }
        }
        if(d0 > MAX_DIST) break;
    }
    col = mix(col, vec3(0.0), smoothstep(10.0, MAX_DIST, d0));
    col = pow(col, vec3(0.8));
    fragColor = vec4(col, 1.0);
}`, { name: 'Matrix 3D', desc: '3D Voxel Digital Rain -Antigravity' });

register('city_ag', `
#define MAX_STEPS 100
#define MAX_DIST 40.0
#define SURF_DIST 0.01

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

float map(vec3 p) {
    vec2 id = floor(p.xz);
    vec2 f = fract(p.xz) - 0.5;
    
    float h = hash21(id) * 3.0 + 0.5;
    
    vec3 bp = p;
    bp.y -= h * 0.5;
    float box = max(max(abs(f.x) - 0.35, abs(f.y) - 0.35), abs(bp.y) - h * 0.5);
    
    return min(p.y, box);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;
    
    vec3 ro = vec3(0.0, 2.0 + sin(u_time)*0.5, u_time*4.0);
    vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0));
    
    rd.xy *= rot(sin(u_time*0.5)*0.1);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        if(p.y > 0.0 && dS < 0.1) {
            vec2 id = floor(p.xz);
            float h = hash21(id);
            vec3 neon = clamp(0.5 + 0.5*cos(h*6.28 + vec3(0,1,2)), 0.0, 1.0);
            
            vec2 wp = fract(p.xz * 10.0);
            float w = step(0.9, wp.x) + step(0.9, wp.y);
            col += neon * w * 0.005;
        }
        
        if(d0 > MAX_DIST || dS < SURF_DIST) break;
    }
    
    vec3 p = ro + rd * d0;
    if(p.y < 0.01 && d0 < MAX_DIST) {
        vec2 grid = fract(p.xz);
        float line = step(0.95, grid.x) + step(0.95, grid.y);
        col += vec3(0.1, 0.8, 1.0) * line * exp(-d0*0.1);
    }
    
    col += vec3(0.8, 0.2, 0.6) * exp(-uv.y*3.0) * 0.5;
    col = mix(col, vec3(0.02, 0.0, 0.05), pow(min(d0/MAX_DIST, 1.0), 2.0));
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Voxel City', desc: 'Endless Neon Schematic City -Antigravity' });

register('fractal_ag', `
#define MAX_STEPS 80
#define MAX_DIST 10.0
#define SURF_DIST 0.001

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    vec3 w = p;
    float m = dot(w, w);
    vec4 trap = vec4(abs(w), m);
    float dz = 1.0;
    
    float power = 3.0 + 5.0 * (sin(u_time * 0.1) * 0.5 + 0.5);
    
    for(int i=0; i<5; i++) {
        float m2 = m * m;
        float m4 = m2 * m2;
        dz = power * pow(m, (power - 1.0) * 0.5) * dz + 1.0;
        
        float r = length(w);
        float b = power * acos(w.y / r);
        float a = power * atan(w.x, w.z);
        
        w = p + pow(r, power) * vec3(sin(b)*sin(a), cos(b), sin(b)*cos(a));
        
        trap = min(trap, vec4(abs(w), m));
        m = dot(w, w);
        if(m > 256.0) break;
    }
    
    return 0.25 * log(m) * sqrt(m) / dz;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;
    
    vec3 ro = vec3(0.0, 0.0, -2.5);
    ro.xz *= rot(u_time * 0.2);
    ro.yz *= rot(sin(u_time * 0.1) * 0.3);
    
    vec3 w = normalize(vec3(0.0) - ro);
    vec3 u = normalize(cross(w, vec3(0.0, 1.0, 0.0)));
    vec3 v = cross(u, w);
    vec3 rd = normalize(uv.x * u + uv.y * v + 1.5 * w);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        col += vec3(0.8, 0.3, 0.5) * 0.015 / (1.0 + dS * 10.0);
        
        if(d0 > MAX_DIST || abs(dS) < SURF_DIST) {
            vec3 nCol = 0.5 + 0.5*cos(float(i)*0.1 + vec3(0,2,4));
            col += nCol * 0.5;
            break;
        }
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Mandelbulb', desc: '3D Fractal Animation -Antigravity' });

register('lava_ag', `
#define MAX_STEPS 60
#define SURF_DIST 0.01

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}

float map(vec3 p) {
    vec3 p1 = p;
    vec3 p2 = p;
    
    p1.y += sin(u_time * 0.8 + p.x * 2.0) * 0.5;
    p2.y += cos(u_time * 0.5 + p.z * 1.5) * 0.5;
    
    float sphere1 = length(p1 - vec3(0.0, sin(u_time)*0.5, 0.0)) - 0.5;
    float sphere2 = length(p2 - vec3(sin(u_time*0.7)*0.6, cos(u_time*1.2)*0.4, cos(u_time*0.9)*0.5)) - 0.4;
    float sphere3 = length(p - vec3(cos(u_time*1.1)*0.7, -sin(u_time*0.4)*0.5, sin(u_time*1.3)*0.4)) - 0.6;
    
    float box = p.y + 1.0; 
    float ceil = 1.0 - p.y;
    
    float lava = smin(smin(sphere1, sphere2, 0.4), sphere3, 0.4);
    
    return smin(lava, min(box, ceil), 0.3);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
    
    vec3 ro = vec3(0.0, 0.0, -3.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    
    rd.xy *= rot(sin(u_time*0.2)*0.1);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        if (dS < 0.2) {
            vec3 glow = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.0), dS*5.0);
            col += glow * 0.03;
        }
        
        if(d0 > 10.0 || abs(dS) < SURF_DIST) break;
    }
    
    vec3 p = ro + rd * d0;
    vec2 e = vec2(0.01, 0.0);
    vec3 n = normalize(map(p) - vec3(map(p-e.xyy), map(p-e.yxy), map(p-e.yyx)));
    
    float diff = max(dot(n, normalize(vec3(1, 2, -1))), 0.0);
    col += vec3(1.0, 0.4, 0.0) * diff * 0.2;
    col *= 1.0 - length(uv) * 0.5;
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Molten Lava', desc: '3D Raymarched Lava Lamp -Antigravity' });

register('gyroid_ag', `
#define MAX_STEPS 80
#define MAX_DIST 40.0
#define SURF_DIST 0.01

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

float map(vec3 p) {
    p.z += u_time * 2.0;
    p.xy *= rot(p.z * 0.1);
    float scale = 3.0;
    vec3 q = p * scale;
    float gyroid = abs(dot(sin(q), cos(q.zxy))) / scale - 0.05;
    return max(gyroid, -(length(p.xy) - 3.0));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -2.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        vec3 glow = 0.5 + 0.5 * cos(p.z * 0.5 + p.x * 0.5 + u_time + vec3(0.0, 2.0, 4.0));
        col += glow * 0.005 / (0.01 + abs(dS));
        
        if(d0 > MAX_DIST || abs(dS) < SURF_DIST) break;
    }
    col *= exp(-0.08 * d0);
    fragColor = vec4(col, 1.0);
}`, { name: 'Quantum Gyroid', desc: 'Glowing Raymarched Math -Antigravity' });

register('wormhole_ag', `
#define MAX_STEPS 60
#define MAX_DIST 50.0

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

float map(vec3 p) { return -(length(p.xy) - 2.0 - sin(p.z * 0.5 + u_time)*0.5 - cos(p.x * 0.5)*0.5); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(sin(u_time)*0.5, cos(u_time*0.8)*0.5, u_time * 8.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    rd.xy *= rot(sin(u_time * 0.3) * 0.5);
    rd.xz *= rot(sin(u_time * 0.2) * 0.2);
    
    float d0 = 0.0;
    vec3 col = vec3(0.0);
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        if (dS < 0.1) {
            float a = atan(p.y, p.x);
            vec2 id = floor(vec2(a * 8.0, p.z * 2.0));
            vec3 neon = mix(vec3(0.1, 0.5, 1.0), vec3(0.9, 0.1, 0.8), hash(id));
            float pulse = sin(p.z * 0.5 - u_time * 5.0) * 0.5 + 0.5;
            col += neon * (step(0.9, fract(a * 8.0)) + step(0.9, fract(p.z * 2.0)) + pulse) * 0.02 / (1.0 + dS*dS*20.0);
        }
        if(d0 > MAX_DIST) break;
    }
    col *= exp(-0.03 * d0);
    fragColor = vec4(col, 1.0);
}`, { name: 'Wormhole Warp', desc: 'Hyperspace Tunnel -Antigravity' });

register('warp_ag', `
#define MAX_STEPS 60
#define MAX_DIST 50.0

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    float t = u_time * 2.0;
    
    for(float i=0.0; i<1.0; i+=0.05) {
        float z = fract(i - t*0.2);
        float size = 0.2;
        float fade = smoothstep(0.0, 0.5, z) * smoothstep(1.0, 0.8, z);
        
        vec2 p = uv * z * 20.0;
        p *= rot(z * 2.0 + t * 0.5);
        
        vec2 id = floor(p);
        vec2 f = fract(p) - 0.5;
        
        float h = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
        if(h > 0.9) {
            float star = smoothstep(size, 0.0, length(f));
            vec3 starCol = 0.5 + 0.5 * cos(h * 6.28 + vec3(0,2,4));
            col += starCol * star * fade * 2.0;
        }
        
        float dust = sin(p.x * 2.0) * cos(p.y * 2.0) * 0.5 + 0.5;
        col += vec3(0.1, 0.3, 0.6) * dust * fade * 0.05;
    }
    
    col += vec3(0.5, 0.8, 1.0) * smoothstep(0.2, 0.0, length(uv));
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Warp Drive', desc: 'Hyperspeed Star Warp -Antigravity' });

register('rain_ag', `
float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    float t = u_time * 0.5;
    vec3 col = vec3(0.0);
    
    for(float i=0.; i<30.; i++) {
        vec2 pos = vec2(hash12(vec2(i, 0.0)), hash12(vec2(i, 1.0))) * 2.0 - 1.0;
        pos.x += sin(t * 0.1 + i) * 0.1;
        
        float d = length(p - pos);
        float bokeh = smoothstep(0.1 + hash12(vec2(i))*0.05, 0.09, d) * smoothstep(0.0, 0.02, d);
        
        vec3 bokehCol = 0.5 + 0.5 * cos(hash12(vec2(i, 2.0)) * 6.28 + vec3(0,1,2));
        col += bokehCol * bokeh * 0.6;
    }
    
    col += vec3(0.1, 0.2, 0.4) * (1.0 - p.y * 0.5);
    
    vec2 grid = floor(p * 15.0);
    vec2 f = fract(p * 15.0) - 0.5;
    
    float dropDrop = fract(t * (0.5 + hash12(grid)) + hash12(grid + 5.0));
    f.y += dropDrop * 2.0 - 1.0;
    
    float drop = smoothstep(0.2, 0.0, length(f));
    
    if (drop > 0.0) {
        col = col * 0.4 + 0.6 * vec3(0.8, 0.9, 1.0) * drop;
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Cinematic Rain', desc: 'Raindrops on Glass -Antigravity' });

register('aurora_ag', `
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    vec3 ro = vec3(0.0, -1.0, -3.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    
    rd.xy *= rot(sin(u_time * 0.1) * 0.1);
    
    col += vec3(0.02, 0.05, 0.1) * (1.0 - uv.y);
    
    float t = u_time * 0.2;
    for(float i=1.0; i<40.0; i+=1.5) {
        float z = i * 0.1 + 1.0;
        vec2 p = uv * z;
        p.x += sin(p.y * 2.0 + t + i * 0.1) * 0.5;
        
        float ray = abs(sin(p.x * 5.0 + t * 2.0));
        ray = smoothstep(0.8, 1.0, ray) * exp(-p.y * 1.5 - 1.0);
        
        vec3 auroraCol = mix(vec3(0.0, 1.0, 0.5), vec3(0.5, 0.0, 1.0), sin(p.x * 2.0 + t)*0.5+0.5);
        col += auroraCol * ray * 0.3 / (z * 0.5);
    }
    
    float star = fract(sin(dot(floor(uv * 500.0), vec2(12.9898, 78.233))) * 43758.5453);
    col += vec3(1.0) * step(0.995, star) * (sin(u_time * 5.0 + star * 100.0) * 0.5 + 0.5);
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Aurora Borealis', desc: 'Volumetric Northern Lights -Antigravity' });

register('neongrid_ag', `
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    if (uv.y > 0.0) {
        float sun = length(uv - vec2(0.0, 0.2));
        float s = smoothstep(0.3, 0.28, sun);
        s *= step(0.02, mod(uv.y * 20.0 - u_time, 0.1)) + step(0.1, sun);
        col += mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 0.8, 0.0), uv.y * 2.0) * s;
        col += vec3(0.1, 0.0, 0.2) * (1.0 - uv.y) * (1.0 - s);
    } else {
        vec3 ro = vec3(0.0, 0.5, u_time * 2.0);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0));
        
        float d = -ro.y / rd.y;
        if (d > 0.0) {
            vec3 p = ro + rd * d;
            vec2 grid = fract(p.xz);
            float lines = step(0.9, grid.x) + step(0.9, grid.y);
            float distanceFade = exp(-d * 0.1);
            col += vec3(0.0, 1.0, 1.0) * lines * distanceFade;
            col += vec3(0.1, 0.0, 0.2) * distanceFade;
        }
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Synthwave Grid', desc: '1980s Retrowave -Antigravity' });

register('glplanet_ag', `
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float d = length(uv);
    if (d < 0.4) {
        float z = sqrt(0.16 - d*d);
        vec3 n = normalize(vec3(uv, z));
        
        float t = u_time * 0.5;
        float s = sin(t), c = cos(t);
        n.xz = vec2(n.x * c - n.z * s, n.x * s + n.z * c);
        
        float h = fbm(n.xy * 5.0 + n.z * 5.0);
        
        vec3 ocean = vec3(0.1, 0.4, 0.8) + h * 0.2;
        vec3 land = mix(vec3(0.2, 0.6, 0.2), vec3(0.8, 0.7, 0.5), smoothstep(0.4, 0.7, h));
        vec3 planetCol = mix(ocean, land, smoothstep(0.45, 0.55, h));
        
        float clouds = fbm(n.xz * 8.0 - u_time * 0.2);
        planetCol = mix(planetCol, vec3(1.0), smoothstep(0.4, 0.8, clouds) * 0.8);
        
        vec3 light = normalize(vec3(1.0, 0.5, 1.0));
        float diff = max(dot(vec3(uv, z)/0.4, light), 0.0);
        
        float edge = smoothstep(0.3, 0.4, d);
        
        col = planetCol * diff * 1.2;
        col += vec3(0.2, 0.5, 1.0) * edge * diff * 0.5;
    } else {
        float glow = exp(-(d - 0.4) * 20.0);
        vec3 lightDef = normalize(vec3(1.0, 0.5, 0.0));
        float side = dot(normalize(uv), lightDef.xy) * 0.5 + 0.5;
        col += vec3(0.2, 0.5, 1.0) * glow * side * 0.8;
        
        float star = fract(sin(dot(floor(uv * 300.0), vec2(12.9898, 78.233))) * 43758.5453);
        col += vec3(1.0) * step(0.99, star) * (0.5 + 0.5*sin(u_time * 5.0 + star*100.0));
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: '3D Planet', desc: 'Procedural Earth -Antigravity' });

register('hyperspace_ag', `
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float a = atan(uv.y, uv.x);
    float r = length(uv);
    
    float t = u_time * 4.0;
    float z = 1.0 / r;
    z -= t;
    a += sin(z * 0.1) + t * 0.1;
    
    float val = sin(a * 10.0) * cos(z * 2.0) + sin(z * 5.0 - a * 4.0);
    float glow = smoothstep(0.8, 1.0, val);
    
    vec3 neon = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 1.0), sin(z * 0.5)*0.5+0.5);
    col += neon * glow * r;
    
    float str = fract(sin(dot(floor(z), 78.233)) * 43758.5453);
    float lines = step(0.95, fract(a * 20.0 + str * 10.0));
    col += vec3(1.0) * lines * r * 2.0;
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Hyperspace', desc: 'Multidimensional Tunnel -Antigravity' });

register('timetunnel_ag', `
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float t = u_time;
    
    for (float i=0.0; i<4.0; i++) {
        float z = fract(i * 0.25 - t * 0.1);
        float scale = mix(10.0, 0.1, z);
        float fade = smoothstep(0.0, 0.2, z) * smoothstep(1.0, 0.6, z);
        
        vec2 p = uv * scale;
        p *= rot(t * (mod(i, 2.0) == 0.0 ? 1.0 : -1.0) * 0.5 + i);
        
        float r2 = length(p);
        float a2 = atan(p.y, p.x);
        
        float gear = smoothstep(0.5, 0.48, r2) - smoothstep(0.4, 0.38, r2);
        gear *= step(0.5, fract(a2 * 6.0 / 6.28 + sin(r2 * 10.0)*0.1));
        
        float hands = smoothstep(0.02, 0.0, abs(p.x)) * step(0.0, p.y) * step(p.y, 0.4);
        hands += smoothstep(0.02, 0.0, abs(p.y)) * step(0.0, p.x) * step(p.x, 0.3);
        
        vec3 gearCol = mix(vec3(0.8, 0.6, 0.2), vec3(0.3, 0.7, 0.9), i/4.0);
        col += gearCol * (gear + hands) * fade;
    }
    
    col += vec3(0.2, 0.4, 0.8) * exp(-r * 10.0) * (sin(t * 10.0) * 0.5 + 0.5);
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Time Tunnel', desc: 'Clockwork Dimensional Rift -Antigravity' });

register('helios_ag', `
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float r = length(uv);
    float t = u_time;
    
    if (r < 0.3) {
        vec3 p = vec3(uv * 3.0, sqrt(max(0.0, 0.09 - r*r))*3.0);
        float n = fbm(p.xy * 2.0 - vec2(0.0, t * 0.5));

        vec3 sunBase = vec3(1.0, 0.2, 0.0);
        vec3 sunHot = vec3(1.0, 0.8, 0.2);
        col = mix(sunBase, sunHot, smoothstep(0.3, 0.7, n));
        col *= smoothstep(0.1, 0.3, fbm(p.xy * 4.0 + t));
        col *= smoothstep(0.3, 0.25, r);
    } else {
        float angle = atan(uv.y, uv.x);
        float rays = fbm(vec2(angle * 5.0, r * 2.0 - t * 2.0));
        float corona = exp(-(r - 0.3) * 5.0);
        col += vec3(1.0, 0.5, 0.1) * rays * corona * 1.5;
        col += vec3(1.0, 0.3, 0.0) * exp(-(r - 0.3) * 3.0) * 0.5;
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Helios', desc: 'Volumetric Plasma Sun -Antigravity' });

register('fireflies_ag', `
void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float t = u_time;
    float r = length(p);
    col += vec3(0.02, 0.05, 0.03) * (1.0 - r);
    
    for (float i=0.0; i<60.0; i++) {
        float h1 = fract(sin(i * 12.9898) * 43758.5453);
        float h2 = fract(sin((i+10.0) * 78.233) * 43758.5453);
        float h3 = fract(sin((i+20.0) * 37.719) * 43758.5453);
        
        vec2 pos = vec2(
            sin(t * (0.2 + h1*0.5) + h2 * 6.28) * 0.8,
            cos(t * (0.3 + h2*0.4) + h3 * 6.28) * 0.5
        );
        
        float z = sin(t * 0.5 + h1 * 10.0) * 0.5 + 0.5;
        float size = mix(0.005, 0.02, z);
        
        float d = length(p - pos);
        float blink = sin(t * (2.0 + h3*5.0) + h1 * 10.0) * 0.5 + 0.5;
        blink = smoothstep(0.2, 0.8, blink);
        
        float glow = size / (d*d + 0.001);
        vec3 flyCol = mix(vec3(0.5, 1.0, 0.2), vec3(1.0, 0.8, 0.1), h2);
        
        col += flyCol * glow * blink * z * 0.02;
    }
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Fireflies', desc: 'Glowing Biome Swarm -Antigravity' });

register('electropaint_ag', `
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    
    float t = u_time * 0.2;
    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t*2.0), 
                  fbm(uv + 4.0 * q + vec2(8.3, 2.8) - t*1.5));
                  
    float f = fbm(uv + 4.0 * r);
    
    vec3 c1 = vec3(0.1, 0.0, 0.3);
    vec3 c2 = vec3(0.9, 0.2, 0.5);
    vec3 c3 = vec3(0.1, 0.8, 0.9);
    vec3 c4 = vec3(1.0, 1.0, 0.2);
    
    col = mix(c1, c2, clamp(r.x * 2.0, 0.0, 1.0));
    col = mix(col, c3, clamp(r.y * 2.0, 0.0, 1.0));
    col = mix(col, c4, clamp(f * f * 2.0, 0.0, 1.0));
    
    float edge = abs(fract(f * 10.0 + t * 5.0) - 0.5) * 2.0;
    col += vec3(1.0) * smoothstep(0.8, 1.0, edge) * f;
    
    col = smoothstep(0.0, 1.0, col);
    
    fragColor = vec4(col, 1.0);
}`, { name: 'Electropaint', desc: 'Fluid Flow Paint Simulation -Antigravity' });
