/**
 * aSS Effects Library
 *
 * Adding a new screensaver:
 *   register('myeffect', `void main() { ... }`, { name: 'My Effect', desc: '...' });
 */

import { ass } from './ass.js';

// Store shader sources for mini previews
window._assEffects = {};

function register(id, shader, opts = {}) {
  window._assEffects[id] = shader;
  ass.add(id, shader, opts);
}

// ============================================================================
// WINDOWS 3.1 - Simple, authentic 1992 effects
// ============================================================================

register('starfield_31', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  // Windows 3.1 style: simple white dots flying toward viewer
  for (float i = 0.0; i < 80.0; i++) {
    float z = fract(hash(vec2(i, 0.0)) - u_time * 0.15);
    vec2 pos = vec2(
      (hash(vec2(i, 1.0)) - 0.5) / z,
      (hash(vec2(i, 2.0)) - 0.5) / z
    );

    float size = 0.003 / z;
    float d = length(uv - pos);
    col += vec3(1.0) * smoothstep(size, 0.0, d) * z;
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Starfield', desc: 'Windows 3.1 flying through space' });

register('mystify_31', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  // Windows 3.1 Mystify: 2 colored quadrilaterals with trails
  for (float poly = 0.0; poly < 2.0; poly++) {
    // Different color for each polygon (solid colors like Win 3.1)
    vec3 polyCol = poly == 0.0 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0);

    for (float trail = 0.0; trail < 8.0; trail++) {
      float t = u_time * 0.5 - trail * 0.05 + poly * 1.5;

      // 4 corner points bouncing
      vec2 p1 = vec2(0.5 + sin(t * 0.73) * 0.45, 0.5 + sin(t * 0.91) * 0.45);
      vec2 p2 = vec2(0.5 + sin(t * 0.67 + 2.0) * 0.45, 0.5 + sin(t * 0.83 + 1.0) * 0.45);
      vec2 p3 = vec2(0.5 + sin(t * 0.79 + 4.0) * 0.45, 0.5 + sin(t * 0.97 + 3.0) * 0.45);
      vec2 p4 = vec2(0.5 + sin(t * 0.61 + 5.0) * 0.45, 0.5 + sin(t * 0.71 + 2.0) * 0.45);

      // Draw lines (1 pixel wide like original)
      float d = min(min(line(uv, p1, p2), line(uv, p2, p3)),
                    min(line(uv, p3, p4), line(uv, p4, p1)));

      float alpha = (1.0 - trail / 8.0) * 0.7;
      col += polyCol * smoothstep(0.003, 0.0, d) * alpha;
    }
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Mystify', desc: 'Windows 3.1 bouncing polygons' });

register('marquee', `
// Windows 3.1 Marquee: scrolling text banner
// Pixel font rendering for "WINDOWS"
float char_W(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  // W shape
  if (p.y > 0.8) return (p.x < 0.2 || p.x > 0.8) ? 1.0 : 0.0;
  if (p.y > 0.2) return (p.x < 0.2 || p.x > 0.8 || (p.x > 0.4 && p.x < 0.6)) ? 1.0 : 0.0;
  return (p.x < 0.3 || p.x > 0.7) ? 1.0 : 0.0;
}

float char_I(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  if (p.y > 0.8 || p.y < 0.2) return 1.0;
  return (p.x > 0.35 && p.x < 0.65) ? 1.0 : 0.0;
}

float char_N(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  if (p.x < 0.25 || p.x > 0.75) return 1.0;
  float diag = 1.0 - p.y;
  return (abs(p.x - 0.25 - diag * 0.5) < 0.15) ? 1.0 : 0.0;
}

float char_D(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  if (p.x < 0.25) return 1.0;
  if (p.y > 0.8 || p.y < 0.2) return (p.x < 0.7) ? 1.0 : 0.0;
  float d = length(vec2(p.x - 0.4, (p.y - 0.5) * 1.5));
  return (d > 0.35 && d < 0.55 && p.x > 0.3) ? 1.0 : 0.0;
}

float char_O(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  float d = length((p - 0.5) * vec2(1.0, 1.3));
  return (d > 0.25 && d < 0.45) ? 1.0 : 0.0;
}

float char_S(vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
  if (p.y > 0.8) return (p.x > 0.2) ? 1.0 : 0.0;
  if (p.y > 0.6) return (p.x < 0.3) ? 1.0 : 0.0;
  if (p.y > 0.4) return 1.0;
  if (p.y > 0.2) return (p.x > 0.7) ? 1.0 : 0.0;
  return (p.x < 0.8) ? 1.0 : 0.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);  // Black background

  // Bouncing position like original Win 3.1 marquee
  float t = u_time * 0.5;
  vec2 textPos = vec2(
    0.5 + sin(t * 0.7) * 0.3,
    0.5 + sin(t * 1.1) * 0.25
  );

  // Text scaling
  float charW = 0.06;
  float charH = 0.12;
  float spacing = 0.07;

  // "WINDOWS" = 7 characters
  float totalW = 7.0 * spacing;
  vec2 startPos = textPos - vec2(totalW * 0.5, charH * 0.5);

  // Color cycling like original
  vec3 textCol = 0.5 + 0.5 * cos(t * 0.3 + vec3(0.0, 2.1, 4.2));

  // Render each character
  for (float i = 0.0; i < 7.0; i++) {
    vec2 charPos = startPos + vec2(i * spacing, 0.0);
    vec2 p = (uv - charPos) / vec2(charW, charH);

    float c = 0.0;
    if (i == 0.0) c = char_W(p);
    else if (i == 1.0) c = char_I(p);
    else if (i == 2.0) c = char_N(p);
    else if (i == 3.0) c = char_D(p);
    else if (i == 4.0) c = char_O(p);
    else if (i == 5.0) c = char_W(p);
    else if (i == 6.0) c = char_S(p);

    col += textCol * c;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Marquee', desc: 'Windows 3.1 bouncing text' });

// ============================================================================
// WINDOWS 95/98/XP - OpenGL Era
// ============================================================================

register('starfield', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 4.0; i++) {
    float depth = fract(i * 0.25 + u_time * 0.3);
    float fade = smoothstep(0.0, 0.3, depth) * smoothstep(1.0, 0.8, depth);
    float scale = mix(30.0, 1.0, depth);

    vec2 st = uv * scale + i * 100.0;
    vec2 id = floor(st);
    if (hash(id + i) > 0.97) {
      vec2 starPos = fract(st) - 0.5;
      vec2 offset = vec2(hash(id + 1.0), hash(id + 2.0)) - 0.5;
      float star = smoothstep(0.02 / depth, 0.0, length(starPos - offset * 0.3));
      col += star * fade;
    }
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Starfield', desc: 'Warp-speed flight through stars' });

register('mystify', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 2.0; i++) {
    float t = u_time * 0.4 + i * 3.14159;

    // 4 points bouncing
    vec2 p1 = vec2(
      0.5 + sin(t * 0.7 + i) * 0.45,
      0.5 + sin(t * 0.9 + i * 2.0) * 0.45
    );
    vec2 p2 = vec2(
      0.5 + sin(t * 0.8 + i + 1.0) * 0.45,
      0.5 + sin(t * 1.1 + i * 2.0 + 1.0) * 0.45
    );
    vec2 p3 = vec2(
      0.5 + sin(t * 0.6 + i + 2.0) * 0.45,
      0.5 + sin(t * 0.85 + i * 2.0 + 2.0) * 0.45
    );
    vec2 p4 = vec2(
      0.5 + sin(t * 0.75 + i + 3.0) * 0.45,
      0.5 + sin(t * 0.95 + i * 2.0 + 3.0) * 0.45
    );

    // Draw connected polygon
    float d = min(min(line(uv, p1, p2), line(uv, p2, p3)),
                  min(line(uv, p3, p4), line(uv, p4, p1)));

    vec3 hue = 0.5 + 0.5 * cos(6.28 * (i * 0.5 + u_time * 0.1 + vec3(0.0, 0.33, 0.67)));
    col += hue * smoothstep(0.004, 0.0, d);

    // Trails
    for (float j = 1.0; j < 6.0; j++) {
      float tt = t - j * 0.08;
      vec2 q1 = vec2(0.5 + sin(tt * 0.7 + i) * 0.45, 0.5 + sin(tt * 0.9 + i * 2.0) * 0.45);
      vec2 q2 = vec2(0.5 + sin(tt * 0.8 + i + 1.0) * 0.45, 0.5 + sin(tt * 1.1 + i * 2.0 + 1.0) * 0.45);
      vec2 q3 = vec2(0.5 + sin(tt * 0.6 + i + 2.0) * 0.45, 0.5 + sin(tt * 0.85 + i * 2.0 + 2.0) * 0.45);
      vec2 q4 = vec2(0.5 + sin(tt * 0.75 + i + 3.0) * 0.45, 0.5 + sin(tt * 0.95 + i * 2.0 + 3.0) * 0.45);
      float dd = min(min(line(uv, q1, q2), line(uv, q2, q3)), min(line(uv, q3, q4), line(uv, q4, q1)));
      col += hue * smoothstep(0.003, 0.0, dd) * (1.0 - j / 6.0) * 0.4;
    }
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Mystify', desc: 'Bouncing polygon lines with trails' });

register('pipes', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float camT = u_time * u_camSpeed;

  // Camera position - offset to stay between pipe cells
  vec3 ro = vec3(
    sin(camT) * u_camDistance + 0.5,
    sin(camT * 0.7) * (u_camDistance * 0.4) + 0.5,
    cos(camT) * u_camDistance + 0.5
  );
  vec3 ta = vec3(0.5);
  vec3 fwd = normalize(ta - ro);
  vec3 right = normalize(cross(vec3(0,1,0), fwd));
  vec3 up = cross(fwd, right);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * fwd);

  // Start ray a bit away from camera to avoid clipping
  float t = 0.5;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    vec3 q = mod(p + u_gridSpacing * 0.5, u_gridSpacing) - u_gridSpacing * 0.5;

    // Pipes along axes
    float dx = length(q.yz) - u_pipeThickness;
    float dy = length(q.xz) - u_pipeThickness;
    float dz = length(q.xy) - u_pipeThickness;

    // Ball joints
    float ball = length(q) - u_jointSize;

    float d = min(min(min(dx, dy), dz), ball);

    if (d < 0.002) {
      // Normal approximation
      vec2 e = vec2(0.01, 0.0);
      vec3 n = normalize(d - vec3(
        min(min(length((q+e.xyy).yz)-u_pipeThickness, length((q+e.xyy).xz)-u_pipeThickness), min(length((q+e.xyy).xy)-u_pipeThickness, length(q+e.xyy)-u_jointSize)),
        min(min(length((q+e.yxy).yz)-u_pipeThickness, length((q+e.yxy).xz)-u_pipeThickness), min(length((q+e.yxy).xy)-u_pipeThickness, length(q+e.yxy)-u_jointSize)),
        min(min(length((q+e.yyx).yz)-u_pipeThickness, length((q+e.yyx).xz)-u_pipeThickness), min(length((q+e.yyx).xy)-u_pipeThickness, length(q+e.yyx)-u_jointSize))
      ));

      vec3 light = normalize(vec3(1.0, 2.0, -1.0));
      float diff = max(dot(n, light), 0.0) * 0.7 + 0.3;
      float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), u_shininess);

      // Color by grid cell
      vec3 cellId = floor((p + u_gridSpacing * 0.5) / u_gridSpacing);
      vec3 pipeCol = 0.5 + 0.5 * cos(6.28 * (hash(cellId.xy + cellId.z) * u_colorVariety + u_time * u_colorSpeed + vec3(0.0, 0.33, 0.67)));

      col = pipeCol * diff + vec3(1.0) * spec * 0.3;
      break;
    }
    t += d * 0.9;
    if (t > 30.0) break;
  }

  fragColor = vec4(col, 1.0);
}`, {
  name: '3D Pipes',
  desc: 'Building pipe networks with ball joints',
  settings: {
    pipeThickness: { value: 0.12, min: 0.05, max: 0.3, step: 0.01, label: 'Pipe Thickness' },
    jointSize: { value: 0.18, min: 0.1, max: 0.4, step: 0.01, label: 'Joint Size' },
    camSpeed: { value: 0.2, min: 0.05, max: 0.5, step: 0.01, label: 'Camera Speed' },
    camDistance: { value: 8.0, min: 4.0, max: 15.0, step: 0.5, label: 'Camera Distance' },
    gridSpacing: { value: 2.0, min: 1.0, max: 4.0, step: 0.1, label: 'Pipe Density' },
    colorSpeed: { value: 0.0, min: 0.0, max: 0.5, step: 0.01, label: 'Color Animation' },
    colorVariety: { value: 1.0, min: 0.2, max: 2.0, step: 0.1, label: 'Color Variety' },
    shininess: { value: 16.0, min: 2.0, max: 64.0, step: 2.0, label: 'Shininess' }
  }
});

register('maze', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

  // Windows 95 Maze: First-person navigation through corridors
  float t = u_time * 0.8;

  // Navigate through maze - periodic turns at intersections
  float segment = floor(t / 3.0);
  float segT = fract(t / 3.0) * 3.0;

  // Position along corridor
  float turn = hash(vec2(segment, 0.0));
  vec3 ro = vec3(0.0, 0.4, segT * 2.0);  // Eye height 0.4

  // Slight head bob like original
  ro.y += sin(t * 4.0) * 0.02;

  vec3 rd = normalize(vec3(uv.x * 0.8, uv.y * 0.8 - 0.1, 1.0));

  vec3 col = vec3(0.0);
  float dist = 0.0;

  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * dist;

    // Floor at y=0
    float floorD = p.y;

    // Ceiling at y=1
    float ceilD = 1.0 - p.y;

    // Walls: maze corridors based on grid
    vec2 cell = floor(p.xz / 2.0);
    vec2 local = mod(p.xz, 2.0) - 1.0;

    // Maze walls with passages
    float h1 = hash(cell);
    float h2 = hash(cell + vec2(1.0, 0.0));
    float h3 = hash(cell + vec2(0.0, 1.0));

    float wallD = 100.0;

    // Left/right walls
    if (h1 < 0.6) {
      wallD = min(wallD, abs(local.x) - 0.9);
    }
    // Front/back walls with openings
    if (h2 < 0.5) {
      float frontWall = abs(local.y + 1.0) - 0.1;
      if (abs(local.x) > 0.35) wallD = min(wallD, frontWall);
    }

    wallD = max(wallD, -floorD);
    wallD = max(wallD, -ceilD);

    float d = min(min(floorD, ceilD), abs(wallD));

    if (d < 0.005) {
      vec3 hitP = p;

      if (floorD < 0.01) {
        // Floor: red carpet with texture like Win95
        vec2 floorUV = fract(hitP.xz * 2.0);
        float pattern = step(0.05, min(floorUV.x, floorUV.y));
        col = vec3(0.5, 0.1, 0.1) * (0.8 + pattern * 0.2);
      } else if (ceilD < 0.01) {
        // Ceiling: white tiles
        vec2 ceilUV = fract(hitP.xz * 2.0);
        float tiles = step(0.02, min(ceilUV.x, ceilUV.y)) * step(0.02, min(1.0-ceilUV.x, 1.0-ceilUV.y));
        col = vec3(0.9, 0.9, 0.85) * (0.7 + tiles * 0.3);
      } else {
        // Walls: stone/brick texture
        vec2 wallUV;
        if (abs(local.x) > abs(local.y)) {
          wallUV = vec2(hitP.z, hitP.y);
        } else {
          wallUV = vec2(hitP.x, hitP.y);
        }

        // Brick pattern
        vec2 brickUV = wallUV * vec2(2.0, 4.0);
        float row = floor(brickUV.y);
        brickUV.x += mod(row, 2.0) * 0.5;
        vec2 brickF = fract(brickUV);
        float brick = step(0.05, brickF.x) * step(0.1, brickF.y);

        col = vec3(0.55, 0.45, 0.35) * (0.7 + brick * 0.3);
        col += hash(floor(brickUV)) * 0.08 - 0.04; // Variation
      }

      // Distance fog (green tint like original)
      float fog = exp(-dist * 0.15);
      col = mix(vec3(0.1, 0.15, 0.1), col, fog);
      break;
    }

    dist += d * 0.8;
    if (dist > 25.0) {
      col = vec3(0.1, 0.15, 0.1);  // Fog color
      break;
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: '3D Maze', desc: 'First-person maze walkthrough' });

register('flowerbox', `
// Windows 95 Flower Box: morphing textured polyhedra
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.4;

  // Morph cycle: cube -> octahedron -> sphere -> back
  float morphPhase = mod(t, 9.0) / 3.0;
  float morph1 = smoothstep(0.0, 1.0, morphPhase);           // cube->octa
  float morph2 = smoothstep(1.0, 2.0, morphPhase);           // octa->sphere
  float morph3 = smoothstep(2.0, 3.0, morphPhase);           // sphere->cube

  // Rotation on multiple axes
  float ax = t * 0.7;
  float ay = t * 0.5;
  float az = t * 0.3;

  vec3 col = vec3(0.0);
  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.2));

  float dist = 0.0;
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * dist;

    // Apply rotations
    float ca = cos(ax), sa = sin(ax);
    float cb = cos(ay), sb = sin(ay);
    float cc = cos(az), sc = sin(az);

    p.yz = vec2(p.y * ca - p.z * sa, p.y * sa + p.z * ca);
    p.xz = vec2(p.x * cb - p.z * sb, p.x * sb + p.z * cb);
    p.xy = vec2(p.x * cc - p.y * sc, p.x * sc + p.y * cc);

    // SDF: morph between shapes
    float cube = max(max(abs(p.x), abs(p.y)), abs(p.z)) - 0.5;
    float octa = (abs(p.x) + abs(p.y) + abs(p.z)) * 0.577 - 0.5;
    float sphere = length(p) - 0.55;

    float d;
    if (morphPhase < 1.0) {
      d = mix(cube, octa, morph1);
    } else if (morphPhase < 2.0) {
      d = mix(octa, sphere, morph2 - morph1);
    } else {
      d = mix(sphere, cube, morph3 - morph2);
    }

    if (d < 0.003) {
      // Normal via gradient
      vec2 e = vec2(0.001, 0.0);
      vec3 n = normalize(p);

      // Colorful face colors based on normal direction
      vec3 faceCol;
      vec3 absN = abs(n);
      if (absN.x > absN.y && absN.x > absN.z) {
        faceCol = n.x > 0.0 ? vec3(1.0, 0.2, 0.2) : vec3(0.2, 1.0, 0.2);
      } else if (absN.y > absN.z) {
        faceCol = n.y > 0.0 ? vec3(0.2, 0.4, 1.0) : vec3(1.0, 1.0, 0.2);
      } else {
        faceCol = n.z > 0.0 ? vec3(1.0, 0.5, 0.2) : vec3(0.8, 0.2, 1.0);
      }

      // Flower pattern texture
      vec2 texUV = vec2(atan(n.x, n.z), asin(n.y)) * 2.0;
      float flower = sin(texUV.x * 6.0) * sin(texUV.y * 4.0);
      flower = smoothstep(0.0, 0.3, flower);

      col = mix(faceCol * 0.6, faceCol, flower);

      // Lighting
      vec3 light = normalize(vec3(1.0, 1.0, -0.5));
      float diff = max(dot(n, light), 0.0) * 0.6 + 0.4;
      float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);

      col = col * diff + vec3(1.0) * spec * 0.4;
      break;
    }

    dist += d;
    if (dist > 8.0) break;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Flower Box', desc: 'Morphing textured polyhedra' });

register('flyingobjects', `
// Windows 95 3D Flying Objects - bouncing Windows logo
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);  // Black background

  float t = u_time;

  // Bouncing position
  vec2 pos = vec2(
    sin(t * 0.7) * 0.5,
    sin(t * 0.9) * 0.35
  );

  // Rotation
  float angle = t * 0.5;
  float ca = cos(angle), sa = sin(angle);

  // Transform UV to object space
  vec2 p = uv - pos;
  p = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);

  // Scale for perspective wobble
  float scale = 1.0 + sin(t * 1.3) * 0.2;
  p *= scale;

  // Windows 95 logo: 4 colored squares in a waving flag
  float size = 0.08;
  float gap = 0.01;
  float wave = sin(p.x * 8.0 + t * 3.0) * 0.02;

  // 4 quadrants of the Windows logo
  // Red (top-left)
  vec2 p1 = p - vec2(-size - gap/2.0, size + gap/2.0 + wave);
  float d1 = max(abs(p1.x) - size, abs(p1.y) - size);
  if (d1 < 0.0) col = vec3(0.9, 0.1, 0.1);

  // Green (top-right)
  vec2 p2 = p - vec2(size + gap/2.0, size + gap/2.0 + wave * 1.2);
  float d2 = max(abs(p2.x) - size, abs(p2.y) - size);
  if (d2 < 0.0) col = vec3(0.1, 0.7, 0.2);

  // Blue (bottom-left)
  vec2 p3 = p - vec2(-size - gap/2.0, -size - gap/2.0 + wave * 0.8);
  float d3 = max(abs(p3.x) - size, abs(p3.y) - size);
  if (d3 < 0.0) col = vec3(0.1, 0.3, 0.9);

  // Yellow (bottom-right)
  vec2 p4 = p - vec2(size + gap/2.0, -size - gap/2.0 + wave * 1.1);
  float d4 = max(abs(p4.x) - size, abs(p4.y) - size);
  if (d4 < 0.0) col = vec3(0.95, 0.8, 0.1);

  // Add slight 3D shading
  float minD = min(min(d1, d2), min(d3, d4));
  if (minD < 0.0) {
    // Edge highlight
    float edge = smoothstep(-0.002, 0.0, minD);
    col *= 0.7 + edge * 0.3;

    // Add shine
    float shine = smoothstep(0.0, -0.05, p.x + p.y);
    col += vec3(0.2) * shine * (1.0 - edge);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Flying Objects', desc: 'Bouncing Windows logo' });

// ============================================================================
// MODERN WINDOWS (Vista/7)
// ============================================================================

register('bubbles', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.05, 0.1);

  for (float i = 0.0; i < 20.0; i++) {
    float h = hash(vec2(i, 0.0));
    float size = 0.03 + h * 0.12;
    float speed = 0.1 + hash(vec2(i, 1.0)) * 0.2;

    vec2 pos = vec2(
      (hash(vec2(i, 2.0)) - 0.5) * 1.8,
      mod(hash(vec2(i, 3.0)) + u_time * speed, 2.0) - 1.0
    );

    float d = length(uv - pos);

    // Bubble with highlight
    float bubble = smoothstep(size, size - 0.005, d);
    float edge = smoothstep(size - 0.005, size - 0.015, d) - smoothstep(size - 0.015, size - 0.025, d);
    float highlight = smoothstep(0.02, 0.0, length(uv - pos + vec2(size * 0.3, -size * 0.3)));

    col += vec3(0.2, 0.4, 0.6) * bubble * 0.15;
    col += vec3(0.5, 0.7, 1.0) * edge * 0.6;
    col += vec3(1.0) * highlight * 0.4;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Bubbles', desc: 'Floating soap bubbles' });

register('ribbons', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 6.0; i++) {
    float t = u_time * 0.4 + i * 1.0;
    float y = sin(uv.x * 4.0 + t) * 0.25 + sin(uv.x * 8.0 - t * 0.7) * 0.1;
    y += (i - 2.5) * 0.12;

    float d = abs(uv.y - y);
    float ribbon = smoothstep(0.025, 0.01, d);

    vec3 hue = 0.5 + 0.5 * cos(6.28 * (i * 0.15 + u_time * 0.05 + vec3(0.0, 0.33, 0.67)));
    col += hue * ribbon * 0.8;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Ribbons', desc: 'Flowing 3D ribbons' });

register('aurora', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.1;

  // Sky gradient
  vec3 col = mix(vec3(0.0, 0.0, 0.05), vec3(0.0, 0.02, 0.1), uv.y);

  // Aurora bands
  for (float i = 0.0; i < 3.0; i++) {
    float y = 0.6 + i * 0.08;
    float wave = fbm(vec2(uv.x * 2.0 + t + i * 5.0, t * 0.3)) * 0.15;
    float band = exp(-pow((uv.y - y - wave) * 6.0, 2.0));
    band *= fbm(vec2(uv.x * 5.0 + t * 0.3, uv.y)) * 0.6 + 0.4;

    vec3 auroraCol = i < 1.0 ? vec3(0.1, 0.8, 0.3) :
                     i < 2.0 ? vec3(0.2, 0.5, 0.9) : vec3(0.6, 0.2, 0.8);
    col += auroraCol * band * 0.5;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Aurora', desc: 'Northern lights effect' });

// ============================================================================
// MAC OS
// ============================================================================

register('flurry', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  // Particle swirls
  for (float i = 0.0; i < 60.0; i++) {
    float t = u_time * 0.4 + hash(i) * 100.0;
    float r = 0.15 + hash(i + 10.0) * 0.35;
    float speed = 0.8 + hash(i + 20.0) * 1.5;

    vec2 pos = vec2(
      cos(t * speed) * r + sin(t * speed * 0.6) * r * 0.4,
      sin(t * speed) * r + cos(t * speed * 0.4) * r * 0.3
    );

    float d = length(uv - pos);
    float glow = 0.002 / (d * d + 0.0005);

    vec3 hue = 0.5 + 0.5 * cos(6.28 * (hash(i + 30.0) * 0.3 + u_time * 0.02 + vec3(0.0, 0.33, 0.67)));
    col += hue * glow * 0.08;
  }

  col = 1.0 - exp(-col * 1.5);
  fragColor = vec4(col, 1.0);
}`, { name: 'Flurry', desc: 'Swirling particle trails' });

register('arabesque', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.2;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 8.0; i++) {
    float a = t + i * 0.785;
    float r = 0.3 + sin(t * 0.5 + i) * 0.1;

    vec2 p = vec2(cos(a), sin(a)) * r;
    vec2 q = vec2(cos(a + 0.5), sin(a + 0.5)) * r * 0.8;

    float d = line(uv, p, q);
    vec3 hue = 0.5 + 0.5 * cos(6.28 * (i * 0.125 + t * 0.1 + vec3(0.0, 0.33, 0.67)));
    col += hue * smoothstep(0.01, 0.0, d - 0.003) * 0.5;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Arabesque', desc: 'Elegant mathematical curves' });

register('shell', `
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.3;

  float a = atan(uv.y, uv.x);
  float r = length(uv);

  // Spiral shell pattern
  float spiral = sin(a * 5.0 - r * 20.0 + t * 2.0);
  float shell = smoothstep(0.0, 0.3, spiral) * smoothstep(0.5, 0.1, r);

  vec3 col = mix(
    vec3(0.8, 0.4, 0.2),
    vec3(1.0, 0.9, 0.7),
    shell
  );

  col *= smoothstep(0.5, 0.1, r);

  fragColor = vec4(col, 1.0);
}`, { name: 'Shell', desc: 'Colorful spiral pattern' });

register('drift', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.1;

  vec2 p = uv * 3.0;
  float n1 = fbm(p + t);
  float n2 = fbm(p + n1 + t * 0.5);
  float n3 = fbm(p + n2);

  vec3 col = mix(
    vec3(0.1, 0.2, 0.4),
    vec3(0.9, 0.6, 0.3),
    n3
  );

  fragColor = vec4(col, 1.0);
}`, { name: 'Drift', desc: 'Slow-drifting color patterns' });

// ============================================================================
// AFTER DARK
// ============================================================================

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

// ============================================================================
// LINUX / XSCREENSAVER
// ============================================================================

register('matrix', `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;

  float cols = 50.0;
  vec2 cell = floor(uv * vec2(cols, cols * 2.0));
  float colHash = hash(vec2(cell.x, 0.0));

  float speed = 1.5 + colHash * 2.5;
  float drop = fract((u_time * speed + colHash * 100.0) * 0.08);

  float row = floor(uv.y * cols * 2.0);
  float brightness = pow(1.0 - fract(row / (cols * 2.0) + drop), 4.0);

  // Glyphs
  float glyph = step(0.5, hash(cell + floor(u_time * 8.0)));

  vec3 col = vec3(0.0, brightness * 0.8, 0.0) * glyph;

  // Bright leading character
  if (brightness > 0.92) col = vec3(0.7, 1.0, 0.7);

  fragColor = vec4(col, 1.0);
}`, { name: 'GLMatrix', desc: 'Matrix digital rain' });

register('gears', `
// XScreenSaver glxgears: 3 interlocking metallic gears
float gear(vec2 p, float r, float teeth, float toothDepth, float holeR, float rot) {
  float a = atan(p.y, p.x) + rot;
  float d = length(p);

  // Outer edge with teeth
  float toothWave = sin(a * teeth) * toothDepth;
  float outer = d - (r + toothWave);

  // Inner hole
  float inner = holeR - d;

  // Spokes (for the look)
  float spoke = 1.0;
  if (d > holeR + 0.01 && d < r - toothDepth - 0.01) {
    float spokeA = mod(a + 0.1, 0.628) - 0.314;
    spoke = smoothstep(0.05, 0.08, abs(spokeA));
  }

  float shape = max(outer, inner);
  return min(shape, spoke > 0.5 ? shape : 0.1);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.15, 0.15, 0.18);  // Dark background

  float t = u_time;

  // Gear 1: Large red gear (center-left)
  vec2 g1Pos = vec2(-0.18, 0.0);
  float g1Rot = t * 0.8;
  float g1 = gear(uv - g1Pos, 0.22, 20.0, 0.025, 0.06, g1Rot);

  // Gear 2: Medium green gear (right, meshes with gear 1)
  vec2 g2Pos = vec2(0.18, 0.12);
  float g2Rot = -t * 0.8 * (20.0/12.0) + 3.14159/12.0;  // Counter-rotate, gear ratio
  float g2 = gear(uv - g2Pos, 0.14, 12.0, 0.022, 0.04, g2Rot);

  // Gear 3: Small blue gear (bottom, meshes with gear 1)
  vec2 g3Pos = vec2(0.0, -0.26);
  float g3Rot = -t * 0.8 * (20.0/10.0);
  float g3 = gear(uv - g3Pos, 0.11, 10.0, 0.02, 0.03, g3Rot);

  // Render gears with 3D shading
  vec3 light = normalize(vec3(1.0, 1.0, 0.5));

  // Gear 1 - Red
  if (g1 < 0.005) {
    vec2 p = uv - g1Pos;
    float r = length(p);
    float a = atan(p.y, p.x) + g1Rot;

    // Fake normal based on position
    vec3 n = normalize(vec3(sin(a * 20.0) * 0.3, cos(a * 20.0) * 0.3, 1.0));
    float diff = max(dot(n, light), 0.0) * 0.5 + 0.5;
    float spec = pow(max(dot(reflect(-light, n), vec3(0,0,1)), 0.0), 16.0);

    col = vec3(0.7, 0.15, 0.1) * diff + vec3(1.0) * spec * 0.3;
  }

  // Gear 2 - Green
  if (g2 < 0.005) {
    vec2 p = uv - g2Pos;
    float a = atan(p.y, p.x) + g2Rot;
    vec3 n = normalize(vec3(sin(a * 12.0) * 0.3, cos(a * 12.0) * 0.3, 1.0));
    float diff = max(dot(n, light), 0.0) * 0.5 + 0.5;
    float spec = pow(max(dot(reflect(-light, n), vec3(0,0,1)), 0.0), 16.0);

    col = vec3(0.15, 0.6, 0.15) * diff + vec3(1.0) * spec * 0.3;
  }

  // Gear 3 - Blue
  if (g3 < 0.005) {
    vec2 p = uv - g3Pos;
    float a = atan(p.y, p.x) + g3Rot;
    vec3 n = normalize(vec3(sin(a * 10.0) * 0.3, cos(a * 10.0) * 0.3, 1.0));
    float diff = max(dot(n, light), 0.0) * 0.5 + 0.5;
    float spec = pow(max(dot(reflect(-light, n), vec3(0,0,1)), 0.0), 16.0);

    col = vec3(0.1, 0.2, 0.7) * diff + vec3(1.0) * spec * 0.3;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Gears', desc: 'XScreenSaver glxgears' });

// ============================================================================
// ORIGINAL EFFECTS
// ============================================================================

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

// ============================================================================
// WINDOWS CLASSICS - Additional
// ============================================================================

register('flyingwindows', `
// Windows 3.1 Flying Windows - logos flying like starfield
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 30.0; i++) {
    float z = fract(hash(vec2(i, 0.0)) - u_time * 0.2);
    vec2 pos = vec2(
      (hash(vec2(i, 1.0)) - 0.5) * 2.0 / (z + 0.1),
      (hash(vec2(i, 2.0)) - 0.5) * 1.5 / (z + 0.1)
    );

    vec2 p = uv - pos;
    float size = 0.08 / (z + 0.1);

    // Windows logo shape (4 squares)
    float logo = 1.0;
    vec2 lp = p / size;

    // Check if in logo bounds
    if (abs(lp.x) < 1.0 && abs(lp.y) < 1.0) {
      vec2 quadrant = step(vec2(0.05), lp);
      float gap = step(abs(lp.x), 0.08) + step(abs(lp.y), 0.08);

      if (gap < 0.5) {
        vec3 quadCol;
        if (lp.x < 0.0 && lp.y > 0.0) quadCol = vec3(1.0, 0.2, 0.2);      // Red
        else if (lp.x > 0.0 && lp.y > 0.0) quadCol = vec3(0.2, 0.8, 0.2); // Green
        else if (lp.x < 0.0 && lp.y < 0.0) quadCol = vec3(0.2, 0.4, 1.0); // Blue
        else quadCol = vec3(1.0, 0.9, 0.2);                                // Yellow

        col += quadCol * z * 0.8;
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Flying Windows', desc: 'Windows logos flying through space' });

register('text3d', `
// Windows 3D Text - rotating extruded text
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0, 0.0, 0.1);

  float t = u_time * 0.5;

  // Camera setup
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.5));

  // Rotate ray direction
  float ca = cos(t), sa = sin(t);
  rd.xz = mat2(ca, -sa, sa, ca) * rd.xz;

  float dist = 0.0;
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * dist;
    p.xz = mat2(ca, sa, -sa, ca) * p.xz;

    // "3D" text SDF approximation
    float d = 100.0;

    // Letter 3
    vec2 p3 = p.xy - vec2(-0.6, 0.0);
    float arc1 = abs(length(p3 - vec2(0.0, 0.15)) - 0.15) - 0.05;
    float arc2 = abs(length(p3 - vec2(0.0, -0.15)) - 0.15) - 0.05;
    float three = min(arc1, arc2);
    three = max(three, -p3.x);
    three = max(three, abs(p.z) - 0.1);
    d = min(d, three);

    // Letter D
    vec2 pd = p.xy - vec2(0.3, 0.0);
    float dArc = abs(length(pd) - 0.25) - 0.05;
    dArc = max(dArc, -pd.x - 0.1);
    float dBar = max(abs(pd.x + 0.15) - 0.05, abs(pd.y) - 0.3);
    float letterD = min(dArc, dBar);
    letterD = max(letterD, abs(p.z) - 0.1);
    d = min(d, letterD);

    if (d < 0.001) {
      // Shading
      vec3 n = normalize(vec3(
        d - (min(min(arc1, arc2), min(dArc, dBar))),
        0.5,
        sign(p.z)
      ));
      vec3 light = normalize(vec3(1.0, 1.0, -1.0));
      float diff = max(dot(n, light), 0.0) * 0.6 + 0.4;
      float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);

      col = vec3(0.8, 0.6, 0.2) * diff + vec3(1.0) * spec * 0.5;
      break;
    }

    dist += d;
    if (dist > 10.0) break;
  }

  fragColor = vec4(col, 1.0);
}`, { name: '3D Text', desc: 'Rotating extruded text' });

register('beziers', `
// Windows Beziers/Mystery - abstract flowing curves
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time * 0.3;

  for (float i = 0.0; i < 6.0; i++) {
    float phase = i * 1.047 + t;

    // Bezier control points moving in patterns
    vec2 p0 = vec2(sin(phase * 0.7) * 0.3 + 0.2, sin(phase * 0.5) * 0.4 + 0.5);
    vec2 p1 = vec2(sin(phase * 0.9 + 1.0) * 0.4 + 0.5, sin(phase * 0.6 + 2.0) * 0.3 + 0.5);
    vec2 p2 = vec2(sin(phase * 0.8 + 2.0) * 0.3 + 0.8, sin(phase * 0.7 + 1.0) * 0.4 + 0.5);

    // Sample along curve
    float minD = 1.0;
    for (float j = 0.0; j < 20.0; j++) {
      float s = j / 19.0;
      vec2 q = (1.0-s)*(1.0-s)*p0 + 2.0*(1.0-s)*s*p1 + s*s*p2;
      minD = min(minD, length(uv - q));
    }

    vec3 hue = 0.5 + 0.5 * cos(6.28 * (i * 0.15 + t * 0.1 + vec3(0.0, 0.33, 0.67)));
    col += hue * smoothstep(0.02, 0.0, minD) * 0.6;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Beziers', desc: 'Abstract flowing curves' });

// ============================================================================
// AFTER DARK - Additional
// ============================================================================

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

// ============================================================================
// XSCREENSAVER - Additional
// ============================================================================

register('plasma', `
// Classic Plasma - color cycling effect
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.5;

  float v = 0.0;
  v += sin(uv.x * 10.0 + t);
  v += sin((uv.y * 10.0 + t) * 0.5);
  v += sin((uv.x * 10.0 + uv.y * 10.0 + t) * 0.5);

  vec2 c = uv * 10.0 - vec2(sin(t), cos(t * 0.5)) * 5.0;
  v += sin(length(c) + t);

  v *= 0.5;

  vec3 col = vec3(
    sin(v * 3.14159 + t) * 0.5 + 0.5,
    sin(v * 3.14159 + t + 2.094) * 0.5 + 0.5,
    sin(v * 3.14159 + t + 4.188) * 0.5 + 0.5
  );

  fragColor = vec4(col, 1.0);
}`, { name: 'Plasma', desc: 'Classic color cycling plasma' });

register('penrose', `
// Penrose tiling - aperiodic pattern
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  float t = u_time * 0.1;

  vec3 col = vec3(0.1);

  // Golden ratio
  float phi = 1.618033988749;

  // Create Penrose-like pattern using 5-fold symmetry
  for (float i = 0.0; i < 5.0; i++) {
    float angle = i * 1.2566 + t; // 72 degrees
    vec2 dir = vec2(cos(angle), sin(angle));

    float wave = sin(dot(uv, dir) * 10.0 * phi);
    float stripe = smoothstep(0.0, 0.1, abs(wave) - 0.3);

    vec3 hue = 0.5 + 0.5 * cos(6.28 * (i * 0.2 + vec3(0.0, 0.33, 0.67)));
    col += hue * (1.0 - stripe) * 0.15;
  }

  // Add rhombus highlights
  float pattern = 0.0;
  for (float i = 0.0; i < 5.0; i++) {
    float a1 = i * 1.2566;
    float a2 = (i + 1.0) * 1.2566;
    vec2 d1 = vec2(cos(a1), sin(a1));
    vec2 d2 = vec2(cos(a2), sin(a2));

    float l1 = fract(dot(uv + t * 0.1, d1) * 3.0);
    float l2 = fract(dot(uv + t * 0.1, d2) * 3.0);

    pattern += step(0.9, l1) * step(0.9, l2);
  }
  col += vec3(1.0, 0.8, 0.4) * pattern * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Penrose', desc: 'Aperiodic Penrose tiling' });

register('boingball', `
// Amiga Boing Ball - the iconic demo
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.5, 0.5, 0.6); // Gray background

  float t = u_time;

  // Ball position - bouncing
  float bounceY = abs(sin(t * 2.0)) * 0.3;
  float bounceX = sin(t * 0.7) * 0.4;
  vec2 ballPos = vec2(bounceX, bounceY - 0.1);

  // Ball radius
  float r = 0.25;
  vec2 p = uv - ballPos;
  float d = length(p);

  if (d < r) {
    // Sphere mapping
    float z = sqrt(r * r - d * d);
    vec3 normal = normalize(vec3(p, z));

    // Rotation
    float rotSpeed = t * 3.0;
    float lat = asin(normal.y);
    float lon = atan(normal.x, normal.z) + rotSpeed;

    // Checkerboard pattern
    float checks = 8.0;
    float checker = mod(floor(lon * checks / 3.14159) + floor((lat + 1.5708) * checks / 3.14159), 2.0);

    // Red and white
    vec3 ballCol = checker > 0.5 ? vec3(1.0, 0.1, 0.1) : vec3(1.0, 1.0, 1.0);

    // Shading
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(normal, light), 0.0) * 0.5 + 0.5;

    col = ballCol * diff;
  }

  // Grid floor
  if (uv.y < -0.3) {
    vec2 floorUV = vec2(uv.x, (uv.y + 0.3) * 4.0);
    float grid = step(0.9, fract(floorUV.x * 4.0)) + step(0.9, fract(floorUV.y * 4.0));
    col = mix(vec3(0.3, 0.3, 0.4), vec3(0.5, 0.5, 0.6), grid);
  }

  // Shadow
  vec2 shadowPos = vec2(bounceX, -0.35);
  float shadowD = length(uv - shadowPos);
  float shadow = smoothstep(0.15, 0.3, shadowD);
  if (uv.y < -0.3) col *= 0.5 + 0.5 * shadow;

  fragColor = vec4(col, 1.0);
}`, { name: 'Boing Ball', desc: 'Amiga checkered bouncing ball' });

register('glplanet', `
// GLPlanet - rotating Earth
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0, 0.0, 0.02);

  float t = u_time * 0.2;
  float r = 0.35;
  float d = length(uv);

  if (d < r) {
    float z = sqrt(r * r - d * d);
    vec3 normal = normalize(vec3(uv, z));

    // Rotate around Y axis
    float lon = atan(normal.x, normal.z) + t;
    float lat = asin(normal.y);

    // Continent noise
    vec2 sphereUV = vec2(lon, lat) * 2.0;
    float land = fbm(sphereUV * 3.0);
    land = smoothstep(0.45, 0.55, land);

    // Ocean and land colors
    vec3 ocean = vec3(0.1, 0.3, 0.6);
    vec3 landCol = vec3(0.2, 0.5, 0.2);

    vec3 surface = mix(ocean, landCol, land);

    // Ice caps
    float iceCap = smoothstep(0.7, 0.8, abs(lat / 1.5708));
    surface = mix(surface, vec3(0.9), iceCap);

    // Lighting
    vec3 light = normalize(vec3(1.0, 0.5, 1.0));
    float diff = max(dot(normal, light), 0.0) * 0.7 + 0.3;

    col = surface * diff;

    // Atmosphere glow
    float atmo = smoothstep(r, r - 0.05, d);
    col = mix(col, vec3(0.4, 0.6, 1.0), (1.0 - atmo) * 0.3);
  }

  // Atmospheric halo
  float halo = smoothstep(r + 0.1, r, d);
  col += vec3(0.2, 0.4, 0.8) * halo * 0.2;

  // Stars
  vec2 starUV = floor(uv * 50.0);
  if (hash(starUV) > 0.98 && d > r + 0.05) {
    col += vec3(1.0) * 0.5;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'GLPlanet', desc: 'Rotating Earth globe' });

register('sonar', `
// Sonar - radar/ping display
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0, 0.05, 0.0);

  float t = u_time;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // Sweep line
  float sweep = mod(t, 6.28);
  float sweepDist = mod(a - sweep + 6.28, 6.28);
  float sweepLine = smoothstep(0.3, 0.0, sweepDist) * smoothstep(0.5, 0.4, r);

  col += vec3(0.0, 0.8, 0.0) * sweepLine;

  // Range rings
  for (float i = 1.0; i < 5.0; i++) {
    float ring = abs(r - i * 0.1);
    col += vec3(0.0, 0.3, 0.0) * smoothstep(0.005, 0.0, ring);
  }

  // Cross hairs
  float cross = min(abs(uv.x), abs(uv.y));
  col += vec3(0.0, 0.2, 0.0) * smoothstep(0.003, 0.0, cross) * step(r, 0.45);

  // Blips (contacts)
  for (float i = 0.0; i < 5.0; i++) {
    float blipR = hash(vec2(i, 0.0)) * 0.35 + 0.05;
    float blipA = hash(vec2(i, 1.0)) * 6.28;
    vec2 blipPos = vec2(cos(blipA), sin(blipA)) * blipR;

    // Only show if sweep passed recently
    float blipSweep = mod(blipA - sweep + 6.28, 6.28);
    float blipFade = smoothstep(3.0, 0.0, blipSweep);

    float blipD = length(uv - blipPos);
    col += vec3(0.0, 1.0, 0.0) * smoothstep(0.02, 0.01, blipD) * blipFade;
  }

  // Outer ring
  col += vec3(0.0, 0.4, 0.0) * smoothstep(0.008, 0.0, abs(r - 0.45));

  fragColor = vec4(col, 1.0);
}`, { name: 'Sonar', desc: 'Radar ping display' });

register('hyperspace', `
// Hyperspace - warp tunnel
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Tunnel coordinates
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // Stars warping
  for (float i = 0.0; i < 100.0; i++) {
    float starA = hash(vec2(i, 0.0)) * 6.28;
    float starR = fract(hash(vec2(i, 1.0)) - t * 0.3);

    vec2 starPos = vec2(cos(starA), sin(starA)) * starR * 0.5;
    float d = length(uv - starPos);

    // Streak based on distance from center
    float streak = 0.002 + starR * 0.01;
    float star = smoothstep(streak, 0.0, d);

    // Brighter as they pass
    float bright = (1.0 - starR) * 2.0;
    col += vec3(0.8, 0.9, 1.0) * star * bright;
  }

  // Tunnel rings
  float rings = sin(r * 30.0 - t * 5.0) * 0.5 + 0.5;
  rings *= smoothstep(0.5, 0.1, r);
  col += vec3(0.1, 0.2, 0.5) * rings * 0.2;

  // Center glow
  col += vec3(0.5, 0.6, 1.0) * smoothstep(0.3, 0.0, r) * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Hyperspace', desc: 'Warp speed tunnel' });

register('flipflop', `
// FlipFlop - 3D tiles flipping
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.1);

  float t = u_time;

  vec2 grid = floor(uv * 6.0);
  vec2 cell = fract(uv * 6.0) - 0.5;

  // Each tile flips at different times
  float flipTime = hash(grid) * 6.28 + t;
  float flip = sin(flipTime);

  // Tile faces
  float side = step(0.0, flip);

  // 3D perspective on flip
  vec2 distorted = cell;
  distorted.x *= 1.0 - abs(flip) * 0.3;

  float tile = max(abs(distorted.x), abs(distorted.y));
  float shape = smoothstep(0.45, 0.4, tile);

  // Two different colors for each side
  vec3 col1 = 0.5 + 0.5 * cos(6.28 * (hash(grid) + vec3(0.0, 0.33, 0.67)));
  vec3 col2 = 0.5 + 0.5 * cos(6.28 * (hash(grid + 100.0) + vec3(0.0, 0.33, 0.67)));

  vec3 tileCol = mix(col1, col2, side);

  // Shading based on flip angle
  float shade = 0.5 + flip * 0.3;
  col = tileCol * shape * shade;

  fragColor = vec4(col, 1.0);
}`, { name: 'FlipFlop', desc: '3D flipping tiles' });

register('timetunnel', `
// TimeTunnel - Doctor Who style vortex
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time;

  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // Tunnel depth
  float z = 0.3 / (r + 0.01);

  // Spiral pattern
  float spiral = a + z * 0.5 - t * 2.0;
  float pattern = sin(spiral * 6.0) * 0.5 + 0.5;

  // Rings moving toward viewer
  float rings = sin(z * 2.0 - t * 4.0) * 0.5 + 0.5;

  // Color gradient through tunnel
  vec3 tunnelCol = mix(
    vec3(0.1, 0.0, 0.3),
    vec3(0.8, 0.2, 0.5),
    pattern
  );

  tunnelCol = mix(tunnelCol, vec3(1.0, 0.8, 0.3), rings * 0.3);

  // Fade with distance
  float fade = smoothstep(0.5, 0.05, r);
  col = tunnelCol * fade;

  // Edge glow
  col += vec3(0.5, 0.2, 0.8) * smoothstep(0.02, 0.0, abs(r - 0.03));

  // Center bright spot
  col += vec3(1.0) * smoothstep(0.03, 0.0, r);

  fragColor = vec4(col, 1.0);
}`, { name: 'Time Tunnel', desc: 'Doctor Who style vortex' });

register('hello', `
// macOS Hello - animated multilingual greeting
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Gradient background
  col = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.1, 0.2), uv.y);

  // Animated wave
  float wave = sin(uv.x * 10.0 + t * 2.0) * 0.02;

  // Simple "Hello" text representation using shapes
  vec2 textPos = vec2(0.5, 0.5 + wave);
  vec2 p = uv - textPos;
  p.x *= u_resolution.x / u_resolution.y;

  // H
  float h = 1.0;
  h = min(h, max(abs(p.x + 0.35) - 0.02, abs(p.y) - 0.1));
  h = min(h, max(abs(p.x + 0.35) - 0.08, abs(p.y) - 0.015));

  // e
  float e = length(p - vec2(-0.2, 0.0)) - 0.05;
  e = max(e, -length(p - vec2(-0.18, 0.02)) + 0.025);
  e = max(e, -(p.x + 0.15));

  // l
  float l1 = max(abs(p.x - 0.0) - 0.015, abs(p.y) - 0.08);

  // l
  float l2 = max(abs(p.x - 0.08) - 0.015, abs(p.y) - 0.08);

  // o
  float o = abs(length(p - vec2(0.2, 0.0)) - 0.045) - 0.015;

  float text = min(min(min(h, e), min(l1, l2)), o);

  // Rainbow color cycling
  vec3 textCol = 0.5 + 0.5 * cos(6.28 * (t * 0.2 + uv.x * 0.5 + vec3(0.0, 0.33, 0.67)));

  col += textCol * smoothstep(0.01, 0.0, text);

  // Sparkle
  vec2 sparkleGrid = floor(uv * 30.0);
  float sparkle = step(0.97, hash(sparkleGrid + floor(t * 2.0)));
  col += vec3(1.0) * sparkle * 0.5;

  fragColor = vec4(col, 1.0);
}`, { name: 'Hello', desc: 'Animated greeting' });

export default ass;
