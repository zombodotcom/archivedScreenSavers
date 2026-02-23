/**
 * Afterdark Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

register('toasters', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;
  vec3 col = vec3(0.0, 0.0, 0.08);

  for (float i = 0.0; i < 10.0; i++) {
    float h = hash(vec2(i, 0.0));
    float speed = 0.12 + h * 0.08;

    vec2 pos = vec2(
      mod(h * 2.0 + u_time * speed, 2.2) - 0.3,
      mod(h * 3.0 - u_time * speed * 0.6, 1.6) - 0.3
    );

    vec2 p = uv - pos;

    // Toaster body
    float body = box(p, vec2(0.07, 0.045));
    float toaster = smoothstep(0.008, 0.0, body);

    // Slots
    float slot1 = box(p - vec2(-0.02, 0.025), vec2(0.012, 0.008));
    float slot2 = box(p - vec2(0.02, 0.025), vec2(0.012, 0.008));

    // Wings (flapping)
    float wing = sin(u_time * 8.0 + i * 2.0) * 0.5 + 0.5;
    float wingD = box(p - vec2(0.09, 0.015 + wing * 0.02), vec2(0.035, 0.004 + wing * 0.015));

    vec3 toasterCol = vec3(0.7, 0.65, 0.6) * toaster;
    toasterCol -= vec3(0.2) * smoothstep(0.005, 0.0, min(slot1, slot2));
    toasterCol += vec3(0.6, 0.55, 0.5) * smoothstep(0.005, 0.0, wingD);

    col += toasterCol;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Flying Toasters', desc: 'Berkeley Systems classic' });

register('starrynight', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  // City silhouette
  float building = 0.0;
  for (float i = 0.0; i < 20.0; i++) {
    float x = i / 20.0;
    float h = hash(vec2(i, 0.0)) * 0.2 + 0.05;
    float w = 0.03 + hash(vec2(i, 1.0)) * 0.02;
    if (abs(uv.x - x) < w && uv.y < h) {
      building = 1.0;
      // Windows
      vec2 winUV = fract(vec2((uv.x - x + w) / w * 3.0, uv.y / h * 8.0));
      if (winUV.x > 0.3 && winUV.x < 0.7 && winUV.y > 0.2 && winUV.y < 0.8) {
        if (hash(vec2(i, floor(uv.y / h * 8.0))) > 0.5) {
          col += vec3(1.0, 0.9, 0.5) * 0.3;
        }
      }
    }
  }

  if (building < 0.5) {
    // Stars appearing pixel by pixel
    vec2 starGrid = floor(uv * 100.0);
    float starH = hash(starGrid);
    float appear = step(starH, u_time * 0.02);
    if (starH > 0.98) {
      col = vec3(1.0) * appear;
    } else {
      col = vec3(0.0, 0.0, 0.02);
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Starry Night', desc: 'Cityscape with appearing stars' });

register('fish', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;

  // Ocean background
  vec3 col = mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 0.2, 0.4), uv.y);

  // Fish
  for (float i = 0.0; i < 8.0; i++) {
    float h = hash(vec2(i, 0.0));
    float speed = 0.1 + h * 0.1;
    float y = 0.2 + hash(vec2(i, 1.0)) * 0.6;

    float x = mod(h + u_time * speed, 1.5) - 0.25;
    vec2 p = uv - vec2(x, y);

    // Fish body (ellipse)
    float body = length(p * vec2(1.0, 2.0)) - 0.03;
    // Tail
    float tail = length((p - vec2(-0.03, 0.0)) * vec2(0.7, 1.5)) - 0.02;

    float fish = smoothstep(0.005, 0.0, min(body, tail));

    vec3 fishCol = 0.5 + 0.5 * cos(6.28 * (h + vec3(0.0, 0.33, 0.67)));
    col += fishCol * fish * 0.8;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Fish', desc: 'Swimming tropical fish' });

register('warp', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.5;

  float z = 1.0 / (1.0 - fract(t) + 0.01);
  vec2 p = uv * z;

  vec2 grid = abs(fract(p) - 0.5);
  float lines = smoothstep(0.47, 0.5, max(grid.x, grid.y));

  float fog = 1.0 - fract(t);
  vec3 col = vec3(0.2, 0.5, 1.0) * lines * fog;

  fragColor = vec4(col, 1.0);
}`, { name: 'Warp', desc: 'Grid tunnel fly-through' });

register('zot', `
// After Dark Zot! - lightning striking the screen
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0, 0.0, 0.02);

  float t = u_time;

  // Multiple lightning bolts at random intervals
  for (float i = 0.0; i < 3.0; i++) {
    float strikeTime = floor(t * 0.5 + i * 0.33);
    float strikePhase = fract(t * 0.5 + i * 0.33);

    if (strikePhase < 0.15) {
      float h = hash(vec2(strikeTime, i));
      float x = h * 0.8 + 0.1;

      // Lightning path
      float boltX = x;
      float brightness = 0.0;

      for (float y = 1.0; y >= 0.0; y -= 0.02) {
        // Zigzag
        boltX += (hash(vec2(y * 50.0 + strikeTime, i)) - 0.5) * 0.03;

        float d = abs(uv.x - boltX);
        if (uv.y < y && uv.y > y - 0.02) {
          brightness = max(brightness, smoothstep(0.02, 0.0, d));
        }
      }

      // Flash effect
      float flash = (1.0 - strikePhase / 0.15) * 0.3;
      col += vec3(0.8, 0.85, 1.0) * brightness * (1.0 - strikePhase / 0.15);
      col += vec3(0.3, 0.35, 0.5) * flash;
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Zot!', desc: 'Lightning striking the screen' });

register('spotlight', `
// After Dark / XScreenSaver Spotlight - searchlight sweeping
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time * 0.5;

  // Spotlight position
  vec2 spot = vec2(
    0.5 + sin(t) * 0.35,
    0.5 + sin(t * 1.3) * 0.35
  );

  // Spotlight cone
  float d = length(uv - spot);
  float light = smoothstep(0.3, 0.0, d);

  // Simulate desktop content being revealed
  vec2 grid = fract(uv * 10.0);
  float content = step(0.1, grid.x) * step(0.1, grid.y);
  content *= step(grid.x, 0.9) * step(grid.y, 0.9);

  // Icons
  vec2 iconGrid = floor(uv * 5.0);
  float isIcon = step(0.7, hash(iconGrid));

  vec3 desktop = vec3(0.0, 0.3, 0.5) * content;
  desktop += vec3(0.8) * isIcon * content;

  col = desktop * light;

  // Spotlight edge glow
  col += vec3(1.0, 0.95, 0.8) * smoothstep(0.25, 0.2, d) * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Spotlight', desc: 'Searchlight sweeping the screen' });

register('worms', `
// After Dark Worms - wriggling worm trails
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time;

  for (float i = 0.0; i < 8.0; i++) {
    float h = hash(vec2(i, 0.0));
    vec3 wormCol = 0.5 + 0.5 * cos(6.28 * (h + vec3(0.0, 0.33, 0.67)));

    // Worm head position
    vec2 head = vec2(
      0.5 + sin(t * (0.5 + h * 0.5) + i * 2.0) * 0.4,
      0.5 + sin(t * (0.7 + h * 0.3) + i * 1.5) * 0.4
    );

    // Draw worm segments (trail)
    for (float j = 0.0; j < 15.0; j++) {
      float segT = t - j * 0.05;
      vec2 seg = vec2(
        0.5 + sin(segT * (0.5 + h * 0.5) + i * 2.0) * 0.4,
        0.5 + sin(segT * (0.7 + h * 0.3) + i * 1.5) * 0.4
      );

      float d = length(uv - seg);
      float size = 0.015 * (1.0 - j / 15.0);
      col += wormCol * smoothstep(size, size * 0.5, d) * (1.0 - j / 15.0);
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Worms', desc: 'Wriggling worm trails' });

register('drain', `
// After Dark Down the Drain - desktop swirling
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = vec2(0.5);
  vec2 p = uv - center;

  float t = u_time * 0.5;
  float r = length(p);
  float a = atan(p.y, p.x);

  // Spiral distortion
  float spiral = a + r * 5.0 - t * 2.0;
  float drain = smoothstep(0.5, 0.0, r - t * 0.1);

  // Swirled coordinates
  float newA = a - (0.5 - r) * t * 0.5;
  vec2 swirled = vec2(cos(newA), sin(newA)) * r + center;

  // Desktop pattern
  vec2 grid = fract(swirled * 8.0);
  float pattern = step(0.1, grid.x) * step(0.1, grid.y);

  vec3 col = vec3(0.0, 0.3, 0.5) * pattern;

  // Drain hole
  float hole = smoothstep(0.05, 0.02, r - fract(t * 0.1) * 0.3);
  col *= 1.0 - hole;

  // Spiral lines
  float spiralLines = sin(spiral * 8.0) * 0.5 + 0.5;
  col += vec3(0.2, 0.3, 0.4) * spiralLines * drain * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Down the Drain', desc: 'Desktop swirling down' });

register('lissajous', `
// After Dark Lissajous - elegant mathematical curves
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  // Multiple Lissajous curves with different frequencies
  for (float i = 0.0; i < 5.0; i++) {
    float phase = i * 0.5 + u_time * 0.3;
    float freqX = 2.0 + i;
    float freqY = 3.0 + i * 0.7;

    // Draw the curve as a trail
    for (float t = 0.0; t < 100.0; t++) {
      float tt = t / 100.0 * 6.28318;
      vec2 pos = vec2(
        sin(freqX * tt + phase) * 0.35,
        sin(freqY * tt + phase * 1.3) * 0.35
      );

      float d = length(uv - pos);
      vec3 curveCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 1.5 + u_time);
      col += curveCol * smoothstep(0.008, 0.0, d) * 0.15;
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Lissajous', desc: 'Mathematical curve patterns' });

register('rose', `
// After Dark Rose - mathematical rose curves
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.2;

  // Rose curve: r = cos(k * theta)
  for (float curve = 0.0; curve < 3.0; curve++) {
    float k = 3.0 + curve + sin(t + curve) * 0.5; // Varying petal count
    float phase = curve * 2.0 + t;

    for (float i = 0.0; i < 200.0; i++) {
      float theta = i / 200.0 * 6.28318 * 2.0;
      float r = cos(k * theta + phase) * 0.4;
      vec2 pos = vec2(cos(theta), sin(theta)) * r;

      float d = length(uv - pos);
      vec3 roseCol = 0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + curve * 2.0 + theta);
      col += roseCol * smoothstep(0.006, 0.0, d) * 0.08;
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Rose', desc: 'Mathematical rose curves' });

register('clocks', `
// After Dark Clocks - floating analog clocks
float clockFace(vec2 p, float size, float time) {
  float d = length(p) - size;
  float face = smoothstep(0.01, 0.0, abs(d) - 0.005);

  // Hour markers
  for (float i = 0.0; i < 12.0; i++) {
    float angle = i / 12.0 * 6.28318;
    vec2 marker = vec2(cos(angle), sin(angle)) * size * 0.85;
    face += smoothstep(0.01, 0.0, length(p - marker) - 0.01);
  }

  // Hour hand
  float hourAngle = time / 12.0 * 6.28318 - 1.5708;
  vec2 hourDir = vec2(cos(hourAngle), sin(hourAngle));
  float hourHand = line(p, vec2(0.0), hourDir * size * 0.5);
  face += smoothstep(0.008, 0.0, hourHand);

  // Minute hand
  float minAngle = fract(time) * 6.28318 - 1.5708;
  vec2 minDir = vec2(cos(minAngle), sin(minAngle));
  float minHand = line(p, vec2(0.0), minDir * size * 0.75);
  face += smoothstep(0.005, 0.0, minHand);

  // Second hand
  float secAngle = fract(time * 60.0) * 6.28318 - 1.5708;
  vec2 secDir = vec2(cos(secAngle), sin(secAngle));
  float secHand = line(p, vec2(0.0), secDir * size * 0.8);
  face += smoothstep(0.003, 0.0, secHand) * 0.8;

  return face;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.02, 0.05);

  float t = u_time * 0.1;

  // Multiple floating clocks
  for (float i = 0.0; i < 6.0; i++) {
    float z = fract(hash(vec2(i, 0.0)) * 10.0 + t * 0.2);
    vec2 pos = vec2(
      sin(t * 0.5 + i * 2.0) * 0.5,
      cos(t * 0.3 + i * 1.5) * 0.4
    );

    float size = 0.08 + z * 0.12;
    vec2 clockPos = uv - pos;

    float clock = clockFace(clockPos, size, u_time * 0.02 + i);
    vec3 clockCol = 0.6 + 0.4 * cos(vec3(0.0, 2.0, 4.0) + i);
    col += clockCol * clock * (0.5 + z * 0.5);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Clocks', desc: 'Floating analog clocks' });

register('stringart', `
// After Dark String Art - thread art geometric patterns
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.3;
  int numLines = 40;

  // Create string art pattern between two shapes
  for (int i = 0; i < 40; i++) {
    float fi = float(i) / 40.0;

    // Points on a circle
    float angle1 = fi * 6.28318 + t;
    vec2 p1 = vec2(cos(angle1), sin(angle1)) * 0.4;

    // Points on another circle (offset)
    float angle2 = fi * 6.28318 * 2.0 - t * 0.7;
    vec2 p2 = vec2(cos(angle2), sin(angle2)) * 0.25;

    float d = line(uv, p1, p2);
    vec3 lineCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + fi * 6.28 + t);
    col += lineCol * smoothstep(0.003, 0.0, d) * 0.3;
  }

  // Second pattern
  for (int i = 0; i < 30; i++) {
    float fi = float(i) / 30.0;

    // Square points
    float side = floor(fi * 4.0);
    float pos = fract(fi * 4.0);
    vec2 p1;
    if (side == 0.0) p1 = vec2(-0.35 + pos * 0.7, -0.35);
    else if (side == 1.0) p1 = vec2(0.35, -0.35 + pos * 0.7);
    else if (side == 2.0) p1 = vec2(0.35 - pos * 0.7, 0.35);
    else p1 = vec2(-0.35, 0.35 - pos * 0.7);

    // Connect to center with rotation
    float angle = fi * 6.28318 + t * 0.5;
    vec2 p2 = vec2(cos(angle), sin(angle)) * 0.1;

    float d = line(uv, p1, p2);
    vec3 lineCol = 0.5 + 0.5 * cos(vec3(1.0, 3.0, 5.0) + fi * 3.0 - t);
    col += lineCol * smoothstep(0.002, 0.0, d) * 0.25;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'String Art', desc: 'Thread art patterns' });

register('satori', `
// After Dark Satori - Zen abstract meditation pattern
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.15;

  // Concentric rings with slow breathing
  float breath = sin(t) * 0.1 + 1.0;

  for (float i = 0.0; i < 8.0; i++) {
    float radius = (i + 1.0) * 0.05 * breath;
    float ring = abs(length(uv) - radius);
    float alpha = smoothstep(0.008, 0.0, ring);

    // Subtle color shift
    vec3 ringCol = vec3(0.3, 0.4, 0.5) + 0.2 * sin(i * 0.5 + t);
    col += ringCol * alpha * 0.5;
  }

  // Rotating yin-yang inspired pattern
  float angle = atan(uv.y, uv.x);
  float r = length(uv);

  float spiral = sin(angle * 2.0 + r * 10.0 - t * 2.0);
  spiral = smoothstep(0.0, 0.1, spiral) * smoothstep(0.4, 0.1, r);

  col += vec3(0.4, 0.5, 0.6) * spiral * 0.3;

  // Central glow
  float glow = exp(-r * 5.0);
  col += vec3(0.5, 0.6, 0.7) * glow * 0.4;

  // Outer fade
  col *= smoothstep(0.6, 0.3, r);

  fragColor = vec4(col, 1.0);
}`, { name: 'Satori', desc: 'Zen meditation pattern' });

register('gravity_ad', `
// After Dark Gravity - oscillating gravity simulation
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02);

  float t = u_time;

  // Simulate particles affected by oscillating gravity
  for (float i = 0.0; i < 30.0; i++) {
    // Initial conditions from hash
    vec2 startPos = vec2(hash(vec2(i, 0.0)) - 0.5, hash(vec2(i, 1.0)) - 0.5) * 0.8;
    vec2 startVel = vec2(hash(vec2(i, 2.0)) - 0.5, hash(vec2(i, 3.0)) - 0.5) * 0.2;

    // Oscillating gravity center
    vec2 gravCenter = vec2(sin(t * 0.5) * 0.3, cos(t * 0.7) * 0.3);

    // Simple gravity simulation (approximated)
    float phase = hash(vec2(i, 4.0)) * 6.28;
    vec2 pos = startPos;

    // Orbital motion approximation
    float orbitSpeed = 0.3 + hash(vec2(i, 5.0)) * 0.4;
    float orbitRadius = length(startPos - gravCenter) * 0.8;
    float angle = atan(startPos.y - gravCenter.y, startPos.x - gravCenter.x) + t * orbitSpeed;

    pos = gravCenter + vec2(cos(angle), sin(angle)) * orbitRadius;

    // Add some perturbation
    pos += vec2(sin(t * 2.0 + i), cos(t * 1.5 + i)) * 0.02;

    float d = length(uv - pos);
    vec3 particleCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 0.3);
    col += particleCol * smoothstep(0.02, 0.0, d);

    // Trail
    for (float tr = 1.0; tr < 5.0; tr++) {
      float trailAngle = angle - tr * 0.1 * orbitSpeed;
      vec2 trailPos = gravCenter + vec2(cos(trailAngle), sin(trailAngle)) * orbitRadius;
      float td = length(uv - trailPos);
      col += particleCol * smoothstep(0.015, 0.0, td) * (1.0 - tr / 5.0) * 0.3;
    }
  }

  // Draw gravity center
  float centerD = length(uv - vec2(sin(t * 0.5) * 0.3, cos(t * 0.7) * 0.3));
  col += vec3(1.0, 0.8, 0.5) * smoothstep(0.03, 0.0, centerD);

  fragColor = vec4(col, 1.0);
}`, { name: 'Gravity', desc: 'Oscillating gravity simulation' });

register('johnnycastaway', `
// After Dark Johnny Castaway - castaway on desert island
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Sky gradient (day/night cycle)
  float dayNight = sin(t * 0.05) * 0.5 + 0.5;
  vec3 dayCol = vec3(0.4, 0.7, 1.0);
  vec3 nightCol = vec3(0.05, 0.05, 0.15);
  vec3 skyCol = mix(nightCol, dayCol, dayNight);
  col = mix(skyCol, skyCol * 0.6, uv.y);

  // Sun/Moon
  vec2 sunPos = vec2(0.8, 0.75 + sin(t * 0.05) * 0.1);
  float sun = smoothstep(0.06, 0.04, length(uv - sunPos));
  vec3 sunCol = mix(vec3(0.9, 0.9, 0.7), vec3(1.0, 0.9, 0.3), dayNight);
  col += sunCol * sun;

  // Ocean
  float oceanY = 0.35 + sin(uv.x * 8.0 + t * 2.0) * 0.01;
  if (uv.y < oceanY) {
    vec3 oceanCol = mix(vec3(0.0, 0.2, 0.4), vec3(0.1, 0.4, 0.6), dayNight);
    float wave = sin(uv.x * 20.0 + t * 3.0) * 0.3 + 0.7;
    col = oceanCol * wave;
  }

  // Island (sand)
  vec2 islandCenter = vec2(0.5, 0.3);
  float islandDist = length((uv - islandCenter) * vec2(1.0, 2.5));
  float island = smoothstep(0.25, 0.2, islandDist);

  if (island > 0.0) {
    vec3 sandCol = vec3(0.9, 0.8, 0.5);
    col = mix(col, sandCol, island);
  }

  // Palm tree
  vec2 treeBase = vec2(0.55, 0.35);
  // Trunk
  float trunk = smoothstep(0.015, 0.01, abs(uv.x - treeBase.x - (uv.y - treeBase.y) * 0.1));
  trunk *= step(treeBase.y, uv.y) * step(uv.y, treeBase.y + 0.2);
  col = mix(col, vec3(0.4, 0.25, 0.1), trunk);

  // Palm fronds
  vec2 topTree = vec2(treeBase.x + 0.02, treeBase.y + 0.2);
  for (float i = 0.0; i < 5.0; i++) {
    float angle = (i / 5.0 - 0.5) * 2.5 + sin(t + i) * 0.1;
    vec2 frondDir = vec2(cos(angle + 1.57), sin(angle + 1.57));
    float frondDist = dot(uv - topTree, frondDir);
    float frondWidth = smoothstep(0.12, 0.0, frondDist) * 0.02;
    float frond = smoothstep(frondWidth, 0.0, abs(dot(uv - topTree, vec2(-frondDir.y, frondDir.x))));
    frond *= step(0.0, frondDist) * step(frondDist, 0.12);
    col = mix(col, vec3(0.1, 0.5, 0.1), frond * 0.8);
  }

  // Johnny (simple stick figure)
  vec2 johnnyPos = vec2(0.4 + sin(t * 0.3) * 0.05, 0.32);

  // Body
  float body = smoothstep(0.008, 0.004, abs(uv.x - johnnyPos.x));
  body *= step(johnnyPos.y, uv.y) * step(uv.y, johnnyPos.y + 0.06);

  // Head
  float head = smoothstep(0.02, 0.015, length(uv - (johnnyPos + vec2(0.0, 0.07))));

  // Arms (waving)
  float armAngle = sin(t * 3.0) * 0.5;
  vec2 armStart = johnnyPos + vec2(0.0, 0.04);
  vec2 leftArm = armStart + vec2(-0.03, 0.02 + sin(t * 3.0) * 0.01);
  vec2 rightArm = armStart + vec2(0.03, 0.02 + sin(t * 3.0 + 1.5) * 0.01);
  float arms = smoothstep(0.006, 0.002, line(uv, armStart, leftArm));
  arms += smoothstep(0.006, 0.002, line(uv, armStart, rightArm));

  // Legs
  vec2 legStart = johnnyPos;
  float legs = smoothstep(0.005, 0.002, line(uv, legStart, legStart + vec2(-0.015, -0.03)));
  legs += smoothstep(0.005, 0.002, line(uv, legStart, legStart + vec2(0.015, -0.03)));

  float johnny = max(max(body, head), max(arms, legs));
  col = mix(col, vec3(0.8, 0.6, 0.4), johnny);

  // SOS in sand (sometimes)
  if (mod(t, 20.0) > 10.0) {
    vec2 sosPos = vec2(0.3, 0.28);
    // Simple S
    float s1 = smoothstep(0.008, 0.004, length(uv - sosPos - vec2(0.0, 0.01)));
    float s2 = smoothstep(0.008, 0.004, length(uv - sosPos - vec2(0.0, -0.01)));
    // Simple O
    float o = smoothstep(0.012, 0.008, length(uv - sosPos - vec2(0.03, 0.0)));
    o *= smoothstep(0.004, 0.008, length(uv - sosPos - vec2(0.03, 0.0)));
    col = mix(col, vec3(0.6, 0.4, 0.2), (s1 + s2 + o) * island);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Johnny Castaway', desc: 'Castaway on desert island' });

register('daredevildan', `
// After Dark Daredevil Dan - motorcycle stunt jumper
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.1, 0.15, 0.3);  // Night sky

  float t = u_time;

  // Stars
  vec2 starGrid = floor(uv * 40.0);
  float star = step(0.97, hash(starGrid));
  col += vec3(1.0) * star * 0.5;

  // Ground
  if (uv.y < 0.2) {
    col = vec3(0.2, 0.15, 0.1);
  }

  // Ramp (left)
  vec2 ramp1Start = vec2(0.1, 0.2);
  vec2 ramp1End = vec2(0.3, 0.4);
  float ramp1 = step(ramp1Start.x, uv.x) * step(uv.x, ramp1End.x);
  float ramp1Y = mix(ramp1Start.y, ramp1End.y, (uv.x - ramp1Start.x) / (ramp1End.x - ramp1Start.x));
  ramp1 *= step(0.2, uv.y) * step(uv.y, ramp1Y);
  col = mix(col, vec3(0.5, 0.4, 0.3), ramp1);

  // Ramp (right)
  vec2 ramp2Start = vec2(0.7, 0.4);
  vec2 ramp2End = vec2(0.9, 0.2);
  float ramp2 = step(ramp2Start.x, uv.x) * step(uv.x, ramp2End.x);
  float ramp2Y = mix(ramp2Start.y, ramp2End.y, (uv.x - ramp2Start.x) / (ramp2End.x - ramp2Start.x));
  ramp2 *= step(0.2, uv.y) * step(uv.y, ramp2Y);
  col = mix(col, vec3(0.5, 0.4, 0.3), ramp2);

  // Buses to jump over
  for (float i = 0.0; i < 5.0; i++) {
    vec2 busPos = vec2(0.38 + i * 0.065, 0.2);
    float bus = step(busPos.x, uv.x) * step(uv.x, busPos.x + 0.05);
    bus *= step(busPos.y, uv.y) * step(uv.y, busPos.y + 0.08);

    // Bus windows
    float windows = step(busPos.x + 0.005, uv.x) * step(uv.x, busPos.x + 0.045);
    windows *= step(busPos.y + 0.05, uv.y) * step(uv.y, busPos.y + 0.07);

    col = mix(col, vec3(0.8, 0.7, 0.2), bus);  // Yellow bus
    col = mix(col, vec3(0.6, 0.8, 1.0), windows * bus);  // Windows
  }

  // Motorcycle trajectory (parabola)
  float jumpDuration = 3.0;
  float cycleT = mod(t, jumpDuration + 1.0);
  float jumpT = clamp(cycleT / jumpDuration, 0.0, 1.0);

  // Parabolic path
  float bikeX = mix(0.25, 0.75, jumpT);
  float bikeY = 0.35 + sin(jumpT * 3.14159) * 0.35;

  // Only show during jump
  if (cycleT < jumpDuration) {
    vec2 bikePos = vec2(bikeX, bikeY);

    // Motorcycle body
    float bike = smoothstep(0.025, 0.02, length((uv - bikePos) * vec2(1.0, 1.5)));

    // Wheels
    float wheel1 = smoothstep(0.015, 0.01, length(uv - bikePos - vec2(-0.02, -0.01)));
    float wheel2 = smoothstep(0.015, 0.01, length(uv - bikePos - vec2(0.02, -0.01)));

    // Rider
    float rider = smoothstep(0.015, 0.01, length(uv - bikePos - vec2(0.0, 0.02)));

    // Rotation based on trajectory
    float bikeAngle = (jumpT - 0.5) * 0.5;

    col = mix(col, vec3(0.8, 0.2, 0.2), bike);  // Red bike
    col = mix(col, vec3(0.1), wheel1 + wheel2);  // Black wheels
    col = mix(col, vec3(0.9, 0.7, 0.5), rider);  // Rider

    // Exhaust trail
    for (float i = 1.0; i < 10.0; i++) {
      float trailT = jumpT - i * 0.02;
      if (trailT > 0.0) {
        float trailX = mix(0.25, 0.75, trailT);
        float trailY = 0.35 + sin(trailT * 3.14159) * 0.35;
        float trail = smoothstep(0.01, 0.0, length(uv - vec2(trailX, trailY)));
        col += vec3(0.5, 0.5, 0.5) * trail * (1.0 - i / 10.0) * 0.3;
      }
    }
  }

  // Crowd (simple dots)
  for (float i = 0.0; i < 20.0; i++) {
    vec2 crowdPos = vec2(hash(vec2(i, 0.0)) * 0.15 + 0.05, 0.18);
    crowdPos.x += hash(vec2(i, 1.0)) * 0.1;
    float crowd = smoothstep(0.01, 0.005, length(uv - crowdPos));
    col = mix(col, vec3(0.8, 0.7, 0.6), crowd);
  }

  // Spotlights
  for (float i = 0.0; i < 3.0; i++) {
    vec2 lightPos = vec2(0.2 + i * 0.3, 0.0);
    vec2 toUv = uv - lightPos;
    float angle = atan(toUv.y, toUv.x);
    float beam = smoothstep(0.3, 0.0, abs(angle - 1.2 - sin(t + i) * 0.2));
    beam *= smoothstep(0.8, 0.0, length(toUv));
    col += vec3(1.0, 0.95, 0.8) * beam * 0.15;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Daredevil Dan', desc: 'Motorcycle stunt jumper' });

register('baddog', `
// After Dark Bad Dog - mischievous dog on screen
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.2, 0.5, 0.3);  // Green grass background

  float t = u_time;

  // Sky
  if (uv.y > 0.6) {
    col = vec3(0.5, 0.7, 0.9);
  }

  // Sun
  float sun = smoothstep(0.08, 0.05, length(uv - vec2(0.85, 0.85)));
  col += vec3(1.0, 0.9, 0.5) * sun;

  // Dog position (running back and forth)
  float dogX = 0.5 + sin(t * 0.8) * 0.35;
  float dogY = 0.25 + abs(sin(t * 4.0)) * 0.03;  // Bounce
  vec2 dogPos = vec2(dogX, dogY);

  // Dog facing direction
  float facing = sign(cos(t * 0.8));

  // Dog body (ellipse)
  vec2 bodyP = (uv - dogPos) * vec2(1.0, 1.8);
  bodyP.x *= facing;
  float body = smoothstep(0.06, 0.05, length(bodyP));

  // Dog head
  vec2 headPos = dogPos + vec2(0.05 * facing, 0.03);
  float head = smoothstep(0.04, 0.03, length(uv - headPos));

  // Ears
  vec2 earPos = headPos + vec2(0.02 * facing, 0.03);
  float ear = smoothstep(0.025, 0.02, length((uv - earPos) * vec2(1.0, 0.6)));

  // Snout
  vec2 snoutPos = headPos + vec2(0.03 * facing, -0.01);
  float snout = smoothstep(0.02, 0.015, length((uv - snoutPos) * vec2(0.8, 1.2)));

  // Tail (wagging)
  vec2 tailStart = dogPos + vec2(-0.05 * facing, 0.02);
  float tailAngle = sin(t * 8.0) * 0.5 + (facing > 0.0 ? 2.5 : 0.6);
  vec2 tailEnd = tailStart + vec2(cos(tailAngle), sin(tailAngle)) * 0.05;
  float tail = smoothstep(0.01, 0.005, line(uv, tailStart, tailEnd));

  // Legs (animated)
  float legPhase = t * 8.0;
  for (float i = 0.0; i < 4.0; i++) {
    vec2 legStart = dogPos + vec2((i < 2.0 ? 0.03 : -0.03) * facing, -0.02);
    float legAngle = sin(legPhase + i * 1.57) * 0.3 - 1.57;
    vec2 legEnd = legStart + vec2(cos(legAngle), sin(legAngle)) * 0.04;
    float leg = smoothstep(0.008, 0.004, line(uv, legStart, legEnd));
    col = mix(col, vec3(0.6, 0.4, 0.2), leg);
  }

  // Eyes
  vec2 eyePos = headPos + vec2(0.015 * facing, 0.01);
  float eye = smoothstep(0.008, 0.005, length(uv - eyePos));

  // Nose
  vec2 nosePos = snoutPos + vec2(0.015 * facing, 0.0);
  float nose = smoothstep(0.008, 0.005, length(uv - nosePos));

  // Combine dog
  float dog = max(max(body, head), max(ear, snout));
  dog = max(dog, tail);
  col = mix(col, vec3(0.7, 0.5, 0.3), dog);  // Brown dog
  col = mix(col, vec3(0.9, 0.85, 0.8), snout * 0.5);  // Lighter snout
  col = mix(col, vec3(0.1), eye + nose);  // Black eyes and nose

  // Stolen item (bone, bouncing with dog)
  vec2 bonePos = dogPos + vec2(0.08 * facing, 0.0);
  float bone = smoothstep(0.015, 0.01, length((uv - bonePos) * vec2(0.6, 1.5)));
  bone += smoothstep(0.01, 0.006, length(uv - bonePos - vec2(0.02, 0.0)));
  bone += smoothstep(0.01, 0.006, length(uv - bonePos - vec2(-0.02, 0.0)));
  col = mix(col, vec3(0.95, 0.9, 0.8), bone);

  // Paw prints (trail behind dog)
  for (float i = 0.0; i < 8.0; i++) {
    float printT = t - i * 0.3;
    float printX = 0.5 + sin(printT * 0.8) * 0.35;
    float printAlpha = 1.0 - i / 8.0;
    vec2 printPos = vec2(printX, 0.22);
    float paw = smoothstep(0.015, 0.01, length(uv - printPos));
    col = mix(col, vec3(0.15, 0.35, 0.2), paw * printAlpha * 0.3);
  }

  // Flowers
  for (float i = 0.0; i < 10.0; i++) {
    vec2 flowerPos = vec2(hash(vec2(i, 10.0)), 0.15 + hash(vec2(i, 20.0)) * 0.1);
    float flower = smoothstep(0.015, 0.01, length(uv - flowerPos));
    vec3 flowerCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i);
    col = mix(col, flowerCol, flower);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Bad Dog', desc: 'Mischievous dog running around' });

register('neon', `
// After Dark Neon - glowing neon signs
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.02, 0.05);  // Dark background

  float t = u_time;

  // Neon tube function
  #define NEON(d, c, g) col += c * (g / (d * d + 0.001)) * 0.002

  // "OPEN" sign
  vec2 signOffset = vec2(-0.3, 0.15);
  float flicker1 = 0.8 + 0.2 * sin(t * 20.0 + sin(t * 3.0) * 5.0);

  // O
  float o = abs(length(uv - signOffset - vec2(-0.15, 0.0)) - 0.06);
  NEON(o, vec3(1.0, 0.2, 0.3) * flicker1, 0.3);

  // P
  float p1 = max(abs(uv.x - signOffset.x - (-0.05)) - 0.005, abs(uv.y - signOffset.y) - 0.08);
  float p2 = abs(length(uv - signOffset - vec2(-0.02, 0.04)) - 0.04);
  p2 = max(p2, -(uv.x - signOffset.x - (-0.05)));
  NEON(min(p1, p2 * 0.8), vec3(1.0, 0.2, 0.3) * flicker1, 0.3);

  // E
  float e1 = max(abs(uv.x - signOffset.x - 0.08) - 0.005, abs(uv.y - signOffset.y) - 0.08);
  float e2 = max(abs(uv.y - signOffset.y - 0.07) - 0.01, abs(uv.x - signOffset.x - 0.1) - 0.025);
  float e3 = max(abs(uv.y - signOffset.y) - 0.01, abs(uv.x - signOffset.x - 0.1) - 0.02);
  float e4 = max(abs(uv.y - signOffset.y + 0.07) - 0.01, abs(uv.x - signOffset.x - 0.1) - 0.025);
  NEON(min(min(e1, e2), min(e3, e4)), vec3(1.0, 0.2, 0.3) * flicker1, 0.3);

  // N
  float n1 = max(abs(uv.x - signOffset.x - 0.2) - 0.005, abs(uv.y - signOffset.y) - 0.08);
  float n2 = max(abs(uv.x - signOffset.x - 0.28) - 0.005, abs(uv.y - signOffset.y) - 0.08);
  float nDiag = abs((uv.x - signOffset.x - 0.2) - (uv.y - signOffset.y + 0.08) * 0.5) - 0.008;
  nDiag = max(nDiag, abs(uv.y - signOffset.y) - 0.08);
  NEON(min(min(n1, n2), nDiag), vec3(1.0, 0.2, 0.3) * flicker1, 0.3);

  // Cocktail glass
  vec2 glassPos = vec2(0.2, -0.05);
  float flicker2 = 0.7 + 0.3 * sin(t * 15.0);

  // Glass bowl (triangle)
  float glass1 = abs(uv.y - glassPos.y - 0.05 + abs(uv.x - glassPos.x) * 1.5) - 0.01;
  glass1 = max(glass1, uv.y - glassPos.y - 0.1);
  glass1 = max(glass1, -uv.y + glassPos.y);
  NEON(glass1, vec3(0.2, 0.8, 1.0) * flicker2, 0.25);

  // Stem
  float stem = max(abs(uv.x - glassPos.x) - 0.008, abs(uv.y - glassPos.y + 0.08) - 0.08);
  NEON(stem, vec3(0.2, 0.8, 1.0) * flicker2, 0.2);

  // Base
  float base = max(abs(uv.x - glassPos.x) - 0.05, abs(uv.y - glassPos.y + 0.17) - 0.01);
  NEON(base, vec3(0.2, 0.8, 1.0) * flicker2, 0.2);

  // Olive
  float olive = length(uv - glassPos - vec2(0.0, 0.05)) - 0.02;
  NEON(olive, vec3(0.3, 1.0, 0.3) * flicker2, 0.2);

  // Arrow pointing down
  vec2 arrowPos = vec2(-0.3, -0.15);
  float flicker3 = step(0.5, fract(t * 2.0));

  float arrow1 = max(abs(uv.x - arrowPos.x) - 0.008, abs(uv.y - arrowPos.y) - 0.08);
  float arrow2 = abs((uv.y - arrowPos.y + 0.06) + abs(uv.x - arrowPos.x) * 1.5) - 0.01;
  arrow2 = max(arrow2, -(uv.y - arrowPos.y + 0.03));
  NEON(min(arrow1, arrow2), vec3(1.0, 1.0, 0.2) * flicker3, 0.3);

  // Subtle brick wall texture
  vec2 brick = fract(uv * vec2(8.0, 16.0) + vec2(floor(uv.y * 16.0) * 0.5, 0.0));
  float brickPattern = smoothstep(0.05, 0.1, brick.x) * smoothstep(0.05, 0.1, brick.y);
  col += vec3(0.02) * (1.0 - brickPattern);

  fragColor = vec4(col, 1.0);
}`, { name: 'Neon', desc: 'Glowing neon signs' });

register('dosshell', `
// After Dark DOS Shell - fake DOS prompt
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);  // Black background

  float t = u_time;

  // Phosphor green color
  vec3 textCol = vec3(0.2, 1.0, 0.3);

  // Character grid
  float charWidth = 0.0125;
  float charHeight = 0.025;
  float cols = 80.0;
  float rows = 25.0;

  vec2 charPos = floor(uv / vec2(charWidth, charHeight));
  vec2 charUv = fract(uv / vec2(charWidth, charHeight));

  float row = rows - 1.0 - charPos.y;  // Top to bottom
  float colIdx = charPos.x;

  // Simulate scrolling text
  float scrollOffset = floor(t * 2.0);
  float displayRow = row + scrollOffset;

  // Generate fake DOS output based on row
  float charVal = 0.0;
  float lineHash = hash(vec2(displayRow, 0.0));

  // Content patterns
  if (mod(displayRow, 10.0) < 1.0) {
    // Prompt line: C:\>
    if (colIdx < 4.0) charVal = 1.0;
  } else if (mod(displayRow, 10.0) < 2.0) {
    // DIR command
    if (colIdx < 3.0) charVal = 1.0;
  } else if (mod(displayRow, 10.0) < 8.0) {
    // File listing
    float fileStart = hash(vec2(displayRow, 1.0)) * 20.0;
    float fileLen = 8.0 + hash(vec2(displayRow, 2.0)) * 4.0;
    if (colIdx >= fileStart && colIdx < fileStart + fileLen) charVal = 1.0;
    // Extension
    if (colIdx >= fileStart + fileLen + 1.0 && colIdx < fileStart + fileLen + 4.0) charVal = 0.8;
    // File size
    if (colIdx >= 50.0 && colIdx < 58.0) {
      if (hash(vec2(displayRow, colIdx)) > 0.3) charVal = 0.7;
    }
  }

  // Simple character rendering (random blocks for text)
  if (charVal > 0.0) {
    float charHash = hash(vec2(displayRow, colIdx));
    // Simple block character
    float char_d = max(abs(charUv.x - 0.5) - 0.35, abs(charUv.y - 0.5) - 0.4);
    if (charHash > 0.5) {
      char_d = max(abs(charUv.x - 0.5) - 0.3, abs(charUv.y - 0.5) - 0.35);
    }
    if (charHash > 0.7) {
      char_d = length(charUv - 0.5) - 0.35;
    }
    if (charHash > 0.85) {
      char_d = min(abs(charUv.x - 0.5), abs(charUv.y - 0.5)) - 0.1;
    }

    float charAlpha = smoothstep(0.0, -0.05, char_d) * charVal;
    col += textCol * charAlpha;
  }

  // Cursor blink
  float cursorRow = mod(floor(t * 2.0), rows);
  float cursorCol = 4.0 + mod(floor(t * 10.0), 20.0);
  if (abs(row - cursorRow) < 0.5 && abs(colIdx - cursorCol) < 0.5) {
    if (mod(t, 1.0) < 0.5) {
      float cursor = step(charUv.y, 0.2);
      col += textCol * cursor;
    }
  }

  // CRT scanlines
  col *= 0.9 + 0.1 * sin(uv.y * u_resolution.y * 3.14159);

  // Slight vignette
  col *= 0.8 + 0.2 * smoothstep(0.8, 0.3, length(uv - 0.5));

  // Phosphor glow
  col += col * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'DOS Shell', desc: 'Fake DOS command prompt' });

register('lunaticfringe', `
// After Dark Lunatic Fringe - space shooter game visuals
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Starfield background
  for (float i = 0.0; i < 100.0; i++) {
    vec2 starPos = vec2(
      hash(vec2(i, 0.0)) - 0.5,
      hash(vec2(i, 1.0)) - 0.5
    ) * 1.5;
    float starBright = hash(vec2(i, 2.0));
    float d = length(uv - starPos);
    col += vec3(1.0) * smoothstep(0.003, 0.0, d) * starBright;
  }

  // Central sun/planet
  float sunDist = length(uv);
  float sun = smoothstep(0.15, 0.1, sunDist);
  vec3 sunCol = mix(vec3(1.0, 0.8, 0.2), vec3(1.0, 0.4, 0.1), sunDist * 5.0);
  col = mix(col, sunCol, sun);

  // Sun glow
  col += vec3(1.0, 0.6, 0.2) * exp(-sunDist * 8.0) * 0.3;

  // Player ship (rotating around center)
  float playerAngle = t * 0.5;
  vec2 playerPos = vec2(cos(playerAngle), sin(playerAngle)) * 0.3;

  // Ship shape (triangle)
  vec2 toPlayer = uv - playerPos;
  float shipAngle = playerAngle + 1.57;
  vec2 shipForward = vec2(cos(shipAngle), sin(shipAngle));
  vec2 shipRight = vec2(-shipForward.y, shipForward.x);

  float shipFront = dot(toPlayer, shipForward);
  float shipSide = abs(dot(toPlayer, shipRight));
  float ship = step(shipSide, 0.015 - shipFront * 0.3);
  ship *= step(-0.03, shipFront) * step(shipFront, 0.03);

  col = mix(col, vec3(0.2, 0.8, 0.3), ship);

  // Enemy ships orbiting
  for (float i = 0.0; i < 5.0; i++) {
    float enemyAngle = t * 0.3 + i * 1.256 + sin(t + i) * 0.2;
    float enemyDist = 0.25 + i * 0.08;
    vec2 enemyPos = vec2(cos(enemyAngle), sin(enemyAngle)) * enemyDist;

    // Enemy shape (diamond)
    vec2 toEnemy = uv - enemyPos;
    float enemy = smoothstep(0.025, 0.02, abs(toEnemy.x) + abs(toEnemy.y));

    col = mix(col, vec3(1.0, 0.2, 0.2), enemy);
  }

  // Bullets from player
  for (float i = 0.0; i < 8.0; i++) {
    float bulletTime = mod(t + i * 0.3, 2.0);
    float bulletAngle = playerAngle - bulletTime * 0.5;
    vec2 bulletStart = vec2(cos(bulletAngle), sin(bulletAngle)) * 0.3;
    vec2 bulletDir = vec2(cos(bulletAngle + 1.57), sin(bulletAngle + 1.57));
    vec2 bulletPos = bulletStart + bulletDir * bulletTime * 0.3;

    float bullet = smoothstep(0.008, 0.003, length(uv - bulletPos));
    col += vec3(0.3, 1.0, 0.3) * bullet * (1.0 - bulletTime * 0.5);
  }

  // Explosions
  for (float i = 0.0; i < 3.0; i++) {
    float explodeTime = mod(t + i * 1.5, 4.0);
    if (explodeTime < 1.0) {
      vec2 explodePos = vec2(
        cos(t * 0.2 + i * 2.0) * 0.35,
        sin(t * 0.3 + i * 1.5) * 0.35
      );
      float explodeRadius = explodeTime * 0.1;
      float explode = smoothstep(explodeRadius + 0.02, explodeRadius, length(uv - explodePos));
      explode *= 1.0 - explodeTime;
      col += vec3(1.0, 0.6, 0.2) * explode;
    }
  }

  // Score display (simple blocks top left)
  vec2 scorePos = vec2(-0.55, 0.35);
  for (float i = 0.0; i < 5.0; i++) {
    vec2 digitPos = scorePos + vec2(i * 0.03, 0.0);
    float digit = smoothstep(0.015, 0.01, length((uv - digitPos) * vec2(0.7, 1.0)));
    col += vec3(0.3, 0.8, 0.3) * digit;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Lunatic Fringe', desc: 'Space shooter game' });

register('underwater', `
// Microsoft Plus! / After Dark Underwater - aquarium scene
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Water gradient
  vec3 col = mix(
    vec3(0.0, 0.15, 0.3),
    vec3(0.0, 0.05, 0.15),
    uv.y
  );

  // Caustics (light patterns)
  for (float i = 0.0; i < 3.0; i++) {
    vec2 causticUv = uv * (3.0 + i) + vec2(t * 0.1, t * 0.05);
    float caustic = sin(causticUv.x + sin(causticUv.y * 2.0)) *
                    sin(causticUv.y + sin(causticUv.x * 2.0));
    caustic = smoothstep(0.0, 0.5, caustic);
    col += vec3(0.1, 0.2, 0.3) * caustic * 0.15 * (1.0 - uv.y);
  }

  // Bubbles
  for (float i = 0.0; i < 20.0; i++) {
    float bubbleX = hash(vec2(i, 0.0));
    float bubbleSpeed = 0.1 + hash(vec2(i, 1.0)) * 0.1;
    float bubbleY = fract(hash(vec2(i, 2.0)) + t * bubbleSpeed);
    float bubbleSize = 0.005 + hash(vec2(i, 3.0)) * 0.01;

    vec2 bubblePos = vec2(bubbleX, bubbleY);
    bubblePos.x += sin(bubbleY * 10.0 + t + i) * 0.02;  // Wobble

    float d = length(uv - bubblePos);
    float bubble = smoothstep(bubbleSize, bubbleSize * 0.5, d);
    float highlight = smoothstep(bubbleSize * 0.8, bubbleSize * 0.3,
                                  length(uv - bubblePos - vec2(0.003, 0.003)));

    col += vec3(0.3, 0.5, 0.6) * bubble * 0.5;
    col += vec3(1.0) * highlight * bubble * 0.3;
  }

  // Seaweed
  for (float i = 0.0; i < 8.0; i++) {
    float weedX = 0.1 + i * 0.12;
    float weedHeight = 0.2 + hash(vec2(i, 10.0)) * 0.15;

    for (float j = 0.0; j < 20.0; j++) {
      float weedY = j / 20.0 * weedHeight;
      float sway = sin(t * 2.0 + i + weedY * 5.0) * 0.02 * weedY;
      vec2 weedPos = vec2(weedX + sway, weedY);

      float d = length(uv - weedPos);
      float weed = smoothstep(0.008, 0.004, d);

      vec3 weedCol = mix(vec3(0.1, 0.4, 0.1), vec3(0.2, 0.6, 0.2), weedY / weedHeight);
      col = mix(col, weedCol, weed);
    }
  }

  // Fish
  for (float i = 0.0; i < 6.0; i++) {
    float fishSpeed = 0.1 + hash(vec2(i, 20.0)) * 0.1;
    float fishDir = hash(vec2(i, 21.0)) > 0.5 ? 1.0 : -1.0;
    float fishX = fract(hash(vec2(i, 22.0)) + t * fishSpeed * fishDir);
    float fishY = 0.3 + hash(vec2(i, 23.0)) * 0.5;

    // Vertical bobbing
    fishY += sin(t * 3.0 + i * 2.0) * 0.02;

    vec2 fishPos = vec2(fishX, fishY);
    vec2 toFish = uv - fishPos;
    toFish.x *= fishDir;

    // Fish body (ellipse)
    float body = length(toFish * vec2(1.0, 2.0));
    float fish = smoothstep(0.03, 0.025, body);

    // Tail
    vec2 tailPos = toFish - vec2(0.025, 0.0);
    float tail = smoothstep(0.02, 0.015, length(tailPos * vec2(0.8, 1.5)));
    tail *= step(0.0, tailPos.x);

    // Eye
    vec2 eyePos = toFish - vec2(-0.01, 0.005);
    float eye = smoothstep(0.006, 0.004, length(eyePos));

    // Fish color
    vec3 fishCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 1.5);
    col = mix(col, fishCol, fish);
    col = mix(col, fishCol * 0.8, tail);
    col = mix(col, vec3(0.1), eye * fish);
  }

  // Sandy bottom
  if (uv.y < 0.1) {
    float sand = smoothstep(0.1, 0.05, uv.y);
    float sandNoise = hash(floor(uv * 200.0)) * 0.1;
    col = mix(col, vec3(0.7, 0.6, 0.4) + sandNoise, sand);

    // Shells/rocks
    for (float i = 0.0; i < 5.0; i++) {
      vec2 shellPos = vec2(hash(vec2(i, 30.0)), 0.05);
      float shell = smoothstep(0.015, 0.01, length(uv - shellPos));
      col = mix(col, vec3(0.8, 0.75, 0.7), shell * sand);
    }
  }

  // Light rays from top
  for (float i = 0.0; i < 5.0; i++) {
    float rayX = 0.2 + i * 0.15 + sin(t * 0.5 + i) * 0.05;
    float ray = smoothstep(0.05, 0.0, abs(uv.x - rayX));
    ray *= smoothstep(0.0, 1.0, uv.y);
    ray *= 0.5 + 0.5 * sin(t + i * 2.0);
    col += vec3(0.2, 0.3, 0.4) * ray * 0.1;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Underwater', desc: 'Aquarium scene with fish' });

register('mowinman', `
// After Dark Mowin' Man - lawn mower cutting grass
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Sky
  vec3 col = mix(vec3(0.5, 0.7, 0.9), vec3(0.3, 0.5, 0.8), uv.y);

  // Sun
  vec2 sunPos = vec2(0.8, 0.85);
  float sun = smoothstep(0.08, 0.05, length(uv - sunPos));
  col += vec3(1.0, 0.95, 0.7) * sun;

  // Clouds
  for (float i = 0.0; i < 3.0; i++) {
    float cloudX = fract(0.3 + i * 0.3 + t * 0.02);
    vec2 cloudPos = vec2(cloudX, 0.75 + i * 0.05);
    float cloud = smoothstep(0.1, 0.05, length((uv - cloudPos) * vec2(0.5, 1.5)));
    cloud += smoothstep(0.08, 0.03, length((uv - cloudPos - vec2(0.05, 0.02)) * vec2(0.6, 1.2)));
    col = mix(col, vec3(1.0), cloud * 0.8);
  }

  // Grass (with mowed pattern)
  if (uv.y < 0.4) {
    // Mower path
    float mowerX = fract(t * 0.1);
    float mowerRow = floor(mod(t * 0.5, 8.0));
    float rowY = 0.35 - mowerRow * 0.04;

    // Determine if grass is cut
    float cut = 0.0;
    for (float row = 0.0; row < 8.0; row++) {
      float thisRowY = 0.35 - row * 0.04;
      if (uv.y < thisRowY + 0.02 && uv.y > thisRowY - 0.02) {
        if (row < mowerRow || (row == mowerRow && uv.x < mowerX)) {
          cut = 1.0;
        }
      }
    }

    // Grass color
    vec3 longGrass = vec3(0.2, 0.5, 0.15);
    vec3 cutGrass = vec3(0.4, 0.6, 0.25);
    vec3 grassCol = mix(longGrass, cutGrass, cut);

    // Grass texture
    float grassTex = hash(floor(uv * 100.0)) * 0.1;
    grassCol += grassTex;

    // Stripes from mowing
    float stripe = sin(uv.y * 150.0) * 0.05;
    grassCol += stripe * cut;

    col = grassCol;
  }

  // Fence at bottom
  if (uv.y < 0.12) {
    float fence = step(0.95, fract(uv.x * 20.0));  // Posts
    fence += step(0.08, uv.y) * step(uv.y, 0.1);  // Top rail
    fence += step(0.02, uv.y) * step(uv.y, 0.04); // Bottom rail
    col = mix(col, vec3(0.6, 0.5, 0.4), fence);
  }

  // Lawn mower
  float mowerPosX = fract(t * 0.1);
  float mowerRowNum = floor(mod(t * 0.5, 8.0));
  float mowerPosY = 0.35 - mowerRowNum * 0.04;

  vec2 mowerPos = vec2(mowerPosX, mowerPosY);
  vec2 toMower = uv - mowerPos;

  // Mower body
  float mowerBody = max(abs(toMower.x) - 0.04, abs(toMower.y) - 0.02);
  float mower = smoothstep(0.0, -0.005, mowerBody);

  // Wheels
  float wheel1 = smoothstep(0.012, 0.008, length(toMower - vec2(-0.03, -0.015)));
  float wheel2 = smoothstep(0.012, 0.008, length(toMower - vec2(0.03, -0.015)));

  // Handle
  float handle = smoothstep(0.008, 0.004, abs(toMower.x + 0.05));
  handle *= step(mowerPos.y, uv.y) * step(uv.y, mowerPos.y + 0.06);

  col = mix(col, vec3(0.8, 0.2, 0.1), mower);  // Red mower
  col = mix(col, vec3(0.2), wheel1 + wheel2);  // Black wheels
  col = mix(col, vec3(0.5, 0.5, 0.5), handle); // Gray handle

  // Person pushing (simple)
  vec2 personPos = mowerPos + vec2(-0.08, 0.04);
  float personBody = smoothstep(0.015, 0.01, abs(uv.x - personPos.x));
  personBody *= step(personPos.y, uv.y) * step(uv.y, personPos.y + 0.06);
  float personHead = smoothstep(0.015, 0.01, length(uv - personPos - vec2(0.0, 0.07)));

  // Arms reaching to handle
  float arm = smoothstep(0.006, 0.002, line(uv, personPos + vec2(0.0, 0.04), mowerPos + vec2(-0.05, 0.04)));

  col = mix(col, vec3(0.3, 0.5, 0.8), personBody);  // Blue shirt
  col = mix(col, vec3(0.9, 0.75, 0.6), personHead); // Skin
  col = mix(col, vec3(0.9, 0.75, 0.6), arm);        // Arms

  // Grass clippings spray
  if (uv.x > mowerPosX && uv.x < mowerPosX + 0.1 && abs(uv.y - mowerPosY) < 0.03) {
    float spray = hash(uv * 500.0 + t * 10.0);
    spray *= smoothstep(mowerPosX + 0.1, mowerPosX, uv.x);
    col += vec3(0.3, 0.5, 0.2) * spray * 0.3;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Mowin\' Man', desc: 'Lawn mower cutting grass' });

register('messages', `
// After Dark Messages - scrolling marquee messages
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Multiple scrolling lines with different messages
  for (float line_i = 0.0; line_i < 5.0; line_i++) {
    float lineY = 0.15 + line_i * 0.17;
    float scrollSpeed = 0.1 + line_i * 0.02;
    float scrollOffset = fract(t * scrollSpeed + line_i * 0.3);

    // Message color
    vec3 msgCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + line_i * 1.2 + t * 0.2);

    // Fake text blocks (representing words)
    float numWords = 5.0 + floor(line_i * 2.0);
    for (float word = 0.0; word < 10.0; word++) {
      if (word >= numWords) break;

      float wordStart = word * 0.15 - scrollOffset * 2.0;
      float wordLen = 0.05 + hash(vec2(line_i, word)) * 0.08;

      // Word position with wrapping
      float wrappedX = fract(wordStart * 0.5 + 0.5) * 2.0 - 0.5;

      if (uv.x > wrappedX && uv.x < wrappedX + wordLen) {
        float wordY = abs(uv.y - lineY);
        if (wordY < 0.03) {
          // Character blocks
          float charPos = fract((uv.x - wrappedX) * 20.0);
          float charBlock = step(0.2, charPos) * step(charPos, 0.9);

          // Vary character heights
          float charHeight = 0.02 + hash(vec2(floor((uv.x - wrappedX) * 20.0), line_i)) * 0.01;
          charBlock *= step(wordY, charHeight);

          col += msgCol * charBlock;
        }
      }
    }
  }

  // Glow effect
  col += col * 0.5;

  // Slight vignette
  col *= 0.9 + 0.1 * (1.0 - length(uv - 0.5));

  fragColor = vec4(col, 1.0);
}`, { name: 'Messages', desc: 'Scrolling text messages' });

register('frostfire', `
// After Dark Frost and Fire - color emanating from center
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.5;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);

  // Alternating frost and fire waves
  float wave = sin(r * 15.0 - t * 3.0);
  float mode = sin(t * 0.3);  // Switches between frost and fire

  // Fire colors
  vec3 fireCol = mix(
    vec3(1.0, 0.8, 0.0),
    vec3(1.0, 0.2, 0.0),
    smoothstep(0.0, 0.5, r)
  );
  fireCol = mix(fireCol, vec3(0.2, 0.0, 0.0), smoothstep(0.3, 0.6, r));

  // Frost colors
  vec3 frostCol = mix(
    vec3(0.8, 0.9, 1.0),
    vec3(0.3, 0.5, 0.8),
    smoothstep(0.0, 0.5, r)
  );
  frostCol = mix(frostCol, vec3(0.1, 0.15, 0.3), smoothstep(0.3, 0.6, r));

  // Blend based on mode
  vec3 baseCol = mix(frostCol, fireCol, mode * 0.5 + 0.5);

  // Radial pattern
  float pattern = 0.0;
  for (float i = 0.0; i < 8.0; i++) {
    float a = angle + i * 0.785 + t * 0.2;
    float ray = abs(sin(a * 4.0));
    ray = smoothstep(0.8, 1.0, ray);
    ray *= smoothstep(0.5, 0.0, r);
    pattern += ray;
  }

  // Ripples
  float ripple = sin(r * 20.0 - t * 5.0) * 0.5 + 0.5;
  ripple *= smoothstep(0.6, 0.0, r);

  // Combine
  col = baseCol * (0.3 + pattern * 0.4 + ripple * 0.3);

  // Center glow
  float centerGlow = exp(-r * 5.0);
  vec3 glowCol = mix(vec3(0.6, 0.8, 1.0), vec3(1.0, 0.9, 0.5), mode * 0.5 + 0.5);
  col += glowCol * centerGlow;

  // Sparkles
  vec2 sparkleGrid = floor(uv * 30.0);
  float sparkle = step(0.97, hash(sparkleGrid + floor(t * 3.0)));
  sparkle *= smoothstep(0.5, 0.2, r);
  col += vec3(1.0) * sparkle;

  // Outer fade
  col *= smoothstep(0.7, 0.3, r);

  fragColor = vec4(col, 1.0);
}`, { name: 'Frost & Fire', desc: 'Colors emanating from center' });

register('boris', `
// After Dark Boris - mischievous cat causing chaos
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;
  vec3 col = vec3(0.0, 0.5, 0.5);

  // Fake windows on desktop
  for (float i = 0.0; i < 4.0; i++) {
    vec2 winPos = vec2(0.15 + mod(i, 2.0) * 0.4, 0.25 + floor(i / 2.0) * 0.35);
    vec2 winSize = vec2(0.3, 0.25);
    if (uv.x > winPos.x && uv.x < winPos.x + winSize.x && uv.y > winPos.y && uv.y < winPos.y + winSize.y) {
      col = vec3(0.9);
      if (uv.y > winPos.y + winSize.y - 0.03) col = vec3(0.0, 0.0, 0.5);
    }
  }

  // Boris the cat
  float borisX = 0.3 + sin(t * 0.5) * 0.25;
  float borisY = 0.4 + cos(t * 0.3) * 0.15;
  vec2 borisPos = vec2(borisX, borisY);
  vec2 toBoris = uv - borisPos;
  float body = length(toBoris * vec2(1.0, 2.0));
  float catBody = smoothstep(0.07, 0.06, body);
  vec2 headPos = borisPos + vec2(0.06, 0.02);
  float head = smoothstep(0.045, 0.04, length(uv - headPos));
  vec2 ear1 = headPos + vec2(-0.025, 0.035);
  vec2 ear2 = headPos + vec2(0.025, 0.035);
  float ears = smoothstep(0.02, 0.015, length((uv - ear1) * vec2(1.0, 0.6)));
  ears += smoothstep(0.02, 0.015, length((uv - ear2) * vec2(1.0, 0.6)));
  vec2 tailStart = borisPos + vec2(-0.06, 0.0);
  float tailAngle = sin(t * 5.0) * 0.4 + 2.5;
  vec2 tailEnd = tailStart + vec2(cos(tailAngle), sin(tailAngle)) * 0.08;
  float tail = smoothstep(0.012, 0.006, line(uv, tailStart, tailEnd));
  vec2 eye1 = headPos + vec2(-0.015, 0.005);
  vec2 eye2 = headPos + vec2(0.015, 0.005);
  float eyes = smoothstep(0.008, 0.005, length(uv - eye1));
  eyes += smoothstep(0.008, 0.005, length(uv - eye2));
  float cat = max(max(catBody, head), max(ears, tail));
  col = mix(col, vec3(0.2), cat);
  col = mix(col, vec3(0.9, 0.8, 0.2), eyes);
  fragColor = vec4(col, 1.0);
}`, { name: 'Boris', desc: 'Mischievous cat on desktop' });

register('nocturnes', `
// After Dark Nocturnes - dark atmospheric night scenes
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.1;
  vec3 col = mix(vec3(0.02, 0.02, 0.08), vec3(0.0, 0.0, 0.03), uv.y);

  // Stars
  for (float i = 0.0; i < 100.0; i++) {
    vec2 starPos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)));
    float starBright = hash(vec2(i, 2.0));
    float twinkle = sin(t * 10.0 + i * 3.0) * 0.3 + 0.7;
    float d = length(uv - starPos);
    col += vec3(1.0, 0.95, 0.9) * smoothstep(0.003, 0.0, d) * starBright * twinkle;
  }

  // Moon
  vec2 moonPos = vec2(0.75, 0.8);
  float moon = smoothstep(0.08, 0.07, length(uv - moonPos));
  col += vec3(0.9, 0.9, 0.8) * moon;
  col += vec3(0.2, 0.2, 0.3) * exp(-length(uv - moonPos) * 5.0);

  // Silhouette hills
  float hill = smoothstep(0.0, 0.02, uv.y - 0.15 - sin(uv.x * 3.0) * 0.05);
  col *= hill;

  // Fireflies
  for (float i = 0.0; i < 12.0; i++) {
    float flyX = hash(vec2(i, 20.0)) * 0.8 + 0.1;
    float flyY = hash(vec2(i, 21.0)) * 0.2 + 0.15;
    flyX += sin(t * 50.0 + i * 2.0) * 0.02;
    flyY += cos(t * 40.0 + i * 1.5) * 0.02;
    float blink = smoothstep(0.3, 0.7, sin(t * 80.0 + i * 4.0));
    float fly = smoothstep(0.008, 0.0, length(uv - vec2(flyX, flyY)));
    col += vec3(0.8, 1.0, 0.4) * fly * blink;
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Nocturnes', desc: 'Dark atmospheric night' });

register('meadow', `
// After Dark Meadow - peaceful meadow scene
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;
  vec3 col = mix(vec3(0.5, 0.7, 0.95), vec3(0.3, 0.5, 0.8), uv.y);

  // Sun
  vec2 sunPos = vec2(0.85, 0.85);
  float sun = smoothstep(0.07, 0.05, length(uv - sunPos));
  col += vec3(1.0, 0.95, 0.7) * sun;

  // Grass
  if (uv.y < 0.35) {
    col = mix(vec3(0.3, 0.6, 0.2), vec3(0.2, 0.5, 0.15), uv.y * 3.0);
  }

  // Flowers
  for (float i = 0.0; i < 20.0; i++) {
    vec2 flowerPos = vec2(hash(vec2(i, 40.0)), hash(vec2(i, 41.0)) * 0.25 + 0.05);
    vec3 flowerCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i);
    float flower = smoothstep(0.015, 0.01, length(uv - flowerPos));
    col = mix(col, flowerCol, flower);
  }

  // Butterflies
  for (float i = 0.0; i < 4.0; i++) {
    float bflyT = t + i * 1.5;
    vec2 bflyPos = vec2(0.3 + sin(bflyT * 0.5 + i) * 0.3, 0.25 + sin(bflyT * 0.7 + i * 2.0) * 0.1);
    float wingFlap = sin(t * 15.0 + i * 3.0) * 0.3 + 0.7;
    vec2 wing1 = bflyPos + vec2(-0.015 * wingFlap, 0.005);
    vec2 wing2 = bflyPos + vec2(0.015 * wingFlap, 0.005);
    float wings = smoothstep(0.012, 0.008, length((uv - wing1) * vec2(0.8, 1.2)));
    wings += smoothstep(0.012, 0.008, length((uv - wing2) * vec2(0.8, 1.2)));
    vec3 bflyCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 2.0);
    col = mix(col, bflyCol, wings);
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Meadow', desc: 'Peaceful animated meadow' });

register('aquaticrealm', `
// After Dark Aquatic Realm - underwater scene
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;
  vec3 col = mix(vec3(0.0, 0.1, 0.25), vec3(0.0, 0.03, 0.1), uv.y);

  // Caustics
  vec2 causticUv = uv * 5.0 + vec2(t * 0.2, t * 0.1);
  float caustic = sin(causticUv.x + sin(causticUv.y * 2.0)) * sin(causticUv.y + sin(causticUv.x * 2.0));
  col += vec3(0.1, 0.15, 0.2) * smoothstep(0.3, 0.8, caustic) * 0.2 * (1.0 - uv.y);

  // Sandy bottom
  if (uv.y < 0.15) {
    float sand = smoothstep(0.15, 0.05, uv.y);
    col = mix(col, vec3(0.5, 0.4, 0.3) + hash(floor(uv * 300.0)) * 0.1, sand);
  }

  // Fish
  for (float i = 0.0; i < 8.0; i++) {
    float fishX = fract(t * 0.08 + hash(vec2(i, 0.0)));
    float fishY = 0.3 + hash(vec2(i, 1.0)) * 0.4;
    fishY += sin(t * 3.0 + i) * 0.02;
    vec2 fishPos = vec2(fishX, fishY);
    vec2 toFish = uv - fishPos;
    float fish = length(toFish * vec2(1.0, 2.5)) - 0.015;
    fish = smoothstep(0.005, 0.0, fish);
    vec3 fishCol = 0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + i * 2.0);
    col = mix(col, fishCol, fish);
  }

  // Bubbles
  for (float i = 0.0; i < 15.0; i++) {
    float bubbleX = hash(vec2(i, 70.0));
    float bubbleY = fract(hash(vec2(i, 72.0)) + t * (0.08 + hash(vec2(i, 71.0)) * 0.08));
    float bubbleSize = 0.004 + hash(vec2(i, 73.0)) * 0.008;
    vec2 bubblePos = vec2(bubbleX + sin(bubbleY * 8.0 + t) * 0.02, bubbleY);
    float bubble = smoothstep(bubbleSize, bubbleSize * 0.6, length(uv - bubblePos));
    col += vec3(0.3, 0.4, 0.5) * bubble * 0.4;
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Aquatic Realm', desc: 'Underwater fish scene' });

register('toasterspro', `
// After Dark Flying Toasters Pro - enhanced toasters with tricks
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float t = u_time;
  vec3 col = vec3(0.0, 0.0, 0.05); // Dark blue night sky

  // Stars background
  for (float i = 0.0; i < 50.0; i++) {
    vec2 starPos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)));
    float twinkle = sin(t * 3.0 + i * 7.0) * 0.3 + 0.7;
    float star = smoothstep(0.003, 0.0, length(uv - starPos)) * twinkle;
    col += vec3(1.0, 0.95, 0.8) * star;
  }

  // Multiple toasters with different behaviors
  for (float i = 0.0; i < 6.0; i++) {
    float seed = i * 31.7;
    float behavior = fract(seed * 0.23);

    // Toaster position
    float speed = 0.1 + hash(vec2(i, 5.0)) * 0.1;
    vec2 toasterPos;

    if (behavior < 0.3) {
      // Normal diagonal flight
      toasterPos = vec2(
        fract(-t * speed + hash(vec2(i, 0.0)) * 2.0) * 1.4 - 0.2,
        fract(-t * speed * 0.7 + hash(vec2(i, 1.0)) * 2.0) * 1.2 - 0.1
      );
    } else if (behavior < 0.6) {
      // Loop-de-loop
      float loopPhase = t * 0.5 + seed;
      toasterPos = vec2(
        fract(-t * speed * 0.5 + hash(vec2(i, 0.0))) * 1.4 - 0.2,
        0.5 + sin(loopPhase) * 0.3
      );
    } else {
      // Barrel roll
      toasterPos = vec2(
        fract(-t * speed + hash(vec2(i, 0.0)) * 2.0) * 1.4 - 0.2,
        0.3 + hash(vec2(i, 2.0)) * 0.4 + sin(t * 2.0 + seed) * 0.1
      );
    }

    vec2 toToaster = (uv - toasterPos) * vec2(aspect, 1.0);

    // Rotation for barrel roll
    float rotation = behavior > 0.6 ? sin(t * 3.0 + seed) * 0.5 : 0.0;
    float c = cos(rotation), s = sin(rotation);
    toToaster = vec2(c * toToaster.x - s * toToaster.y, s * toToaster.x + c * toToaster.y);

    // Toaster body
    float toasterW = 0.06;
    float toasterH = 0.04;
    vec2 toasterSize = vec2(toasterW, toasterH);

    float body = smoothstep(0.0, 0.01, toasterSize.x - abs(toToaster.x));
    body *= smoothstep(0.0, 0.01, toasterSize.y - abs(toToaster.y));

    // Chrome color
    vec3 chrome = vec3(0.7, 0.75, 0.8);
    chrome += vec3(0.1) * (toToaster.y / toasterH); // Gradient

    // Slot on top
    float slot = step(abs(toToaster.x), toasterW * 0.6);
    slot *= step(toasterH * 0.3, toToaster.y) * step(toToaster.y, toasterH * 0.9);
    chrome = mix(chrome, vec3(0.1), slot * 0.5);

    col = mix(col, chrome, body);

    // Wings (flapping faster for tricks)
    float flapSpeed = behavior > 0.3 ? 12.0 : 8.0;
    float wingFlap = sin(t * flapSpeed + i * 2.0) * 0.3;

    for (float w = -1.0; w <= 1.0; w += 2.0) {
      vec2 wingBase = toasterPos + vec2(w * toasterW * 0.8, toasterH * 0.3);
      vec2 toWing = (uv - wingBase) * vec2(aspect, 1.0);

      // Rotate wing
      float wingAngle = w * (0.5 + wingFlap);
      float wc = cos(wingAngle), ws = sin(wingAngle);
      toWing = vec2(wc * toWing.x - ws * toWing.y, ws * toWing.x + wc * toWing.y);

      float wing = step(0.0, toWing.x * w) * step(toWing.x * w, 0.05);
      wing *= step(abs(toWing.y), 0.02);

      col = mix(col, vec3(0.9, 0.85, 0.7), wing);
    }

    // Toast popping out (more dramatic for pro version)
    float toastPop = sin(t * 2.0 + seed) * 0.5 + 0.5;
    vec2 toastPos = toasterPos + vec2(0.0, toasterH + toastPop * 0.03);
    vec2 toToast = uv - toastPos;

    float toast = step(abs(toToast.x), toasterW * 0.4);
    toast *= step(0.0, toToast.y) * step(toToast.y, 0.025);

    vec3 toastCol = vec3(0.8, 0.6, 0.3);
    // Glow when hot
    toastCol += vec3(0.2, 0.1, 0.0) * toastPop;

    col = mix(col, toastCol, toast * toastPop);

    // Sparkle trail for pro toasters
    if (behavior > 0.5) {
      for (float sp = 1.0; sp < 5.0; sp++) {
        vec2 sparkPos = toasterPos + vec2(sp * 0.02, sp * 0.015);
        float sparkle = smoothstep(0.008, 0.0, length(uv - sparkPos));
        sparkle *= sin(t * 10.0 + sp * 3.0) * 0.5 + 0.5;
        col += vec3(1.0, 0.8, 0.3) * sparkle * 0.5;
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Flying Toasters Pro', desc: 'After Dark enhanced' });
