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

// ============================================================================
// AFTER DARK - Additional Berkeley Systems classics
// ============================================================================

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

// ============================================================================
// XSCREENSAVER - Additional jwz classics
// ============================================================================

register('unknownpleasures', `
// XScreenSaver Unknown Pleasures - Joy Division pulsar visualization
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time * 0.5;
  int numLines = 40;

  for (int i = 0; i < 40; i++) {
    float fi = float(i) / 40.0;
    float y = fi;
    float lineY = 0.1 + fi * 0.8;

    // Generate waveform for this line
    float wave = 0.0;
    float x = uv.x;

    // Multiple frequency components
    wave += sin(x * 20.0 + t + fi * 5.0) * 0.02;
    wave += sin(x * 35.0 - t * 1.5 + fi * 3.0) * 0.015;
    wave += sin(x * 50.0 + t * 0.7) * 0.01;

    // Central peak (the iconic mountain shape)
    float peak = exp(-pow((x - 0.5) * 4.0, 2.0)) * 0.15;
    peak *= 1.0 + sin(t + fi * 2.0) * 0.3;
    wave += peak;

    // Additional peaks
    wave += exp(-pow((x - 0.3) * 6.0, 2.0)) * 0.05 * sin(t * 1.2 + fi);
    wave += exp(-pow((x - 0.7) * 6.0, 2.0)) * 0.05 * sin(t * 0.8 + fi * 1.5);

    // Noise
    wave += (hash(vec2(x * 100.0, fi + t)) - 0.5) * 0.01;

    float actualY = lineY + wave;

    // Draw line
    float d = abs(uv.y - actualY);
    float alpha = smoothstep(0.004, 0.0, d);

    // Occlusion: don't draw if below a line in front
    float occlusion = 1.0;
    for (int j = i + 1; j < 40; j++) {
      float fj = float(j) / 40.0;
      float jLineY = 0.1 + fj * 0.8;
      float jWave = exp(-pow((x - 0.5) * 4.0, 2.0)) * 0.15 * (1.0 + sin(t + fj * 2.0) * 0.3);
      if (uv.y < jLineY + jWave + 0.01) {
        occlusion *= 0.0;
      }
    }

    col += vec3(1.0) * alpha * occlusion;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Unknown Pleasures', desc: 'Joy Division pulsar waves' });

register('molecule', `
// XScreenSaver Molecule - 3D ball-and-stick molecular model
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.05, 0.05, 0.1);

  float t = u_time * 0.5;

  // Rotation matrices
  float cosX = cos(t * 0.3), sinX = sin(t * 0.3);
  float cosY = cos(t * 0.5), sinY = sin(t * 0.5);

  // Define atoms (simple molecule - like water or methane)
  vec3 atoms[5];
  atoms[0] = vec3(0.0, 0.0, 0.0);  // Central atom
  atoms[1] = vec3(0.2, 0.15, 0.0);
  atoms[2] = vec3(-0.2, 0.15, 0.0);
  atoms[3] = vec3(0.0, -0.1, 0.2);
  atoms[4] = vec3(0.0, -0.1, -0.2);

  // Atom colors
  vec3 colors[5];
  colors[0] = vec3(1.0, 0.2, 0.2);  // Red (oxygen-like)
  colors[1] = vec3(0.8, 0.8, 0.8);  // White (hydrogen-like)
  colors[2] = vec3(0.8, 0.8, 0.8);
  colors[3] = vec3(0.8, 0.8, 0.8);
  colors[4] = vec3(0.8, 0.8, 0.8);

  float sizes[5];
  sizes[0] = 0.08;
  sizes[1] = 0.05;
  sizes[2] = 0.05;
  sizes[3] = 0.05;
  sizes[4] = 0.05;

  // Rotate all atoms
  for (int i = 0; i < 5; i++) {
    vec3 p = atoms[i];
    // Rotate Y
    float x1 = p.x * cosY - p.z * sinY;
    float z1 = p.x * sinY + p.z * cosY;
    // Rotate X
    float y1 = p.y * cosX - z1 * sinX;
    float z2 = p.y * sinX + z1 * cosX;
    atoms[i] = vec3(x1, y1, z2);
  }

  // Draw bonds first (behind atoms)
  for (int i = 1; i < 5; i++) {
    vec3 p1 = atoms[0];
    vec3 p2 = atoms[i];

    // Project to 2D
    vec2 proj1 = p1.xy / (1.0 + p1.z * 0.5);
    vec2 proj2 = p2.xy / (1.0 + p2.z * 0.5);

    float d = line(uv, proj1, proj2);
    float bondAlpha = smoothstep(0.008, 0.002, d);
    col += vec3(0.5) * bondAlpha * 0.5;
  }

  // Draw atoms (sorted by z would be better, but approximate)
  for (int i = 0; i < 5; i++) {
    vec3 p = atoms[i];
    float z = p.z;
    vec2 proj = p.xy / (1.0 + z * 0.5);
    float size = sizes[i] / (1.0 + z * 0.5);

    float d = length(uv - proj);
    float atom = smoothstep(size, size - 0.01, d);

    // Shading
    vec2 lightDir = normalize(vec2(0.5, 0.5));
    float shade = dot(normalize(uv - proj), lightDir) * 0.3 + 0.7;

    col = mix(col, colors[i] * shade, atom);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Molecule', desc: 'Ball-and-stick molecular model' });

register('sproingies', `
// XScreenSaver Sproingies - Q*bert style bouncing creatures
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.1, 0.05, 0.15);

  float t = u_time;

  // Draw isometric grid/stairs
  for (float row = 0.0; row < 8.0; row++) {
    for (float col_i = 0.0; col_i < 8.0 - row; col_i++) {
      // Isometric position
      vec2 isoPos = vec2(
        (col_i - row * 0.5) * 0.12 - 0.2,
        (row * 0.06 + col_i * 0.0) - 0.3 - row * 0.05
      );

      // Draw cube top (diamond shape)
      vec2 p = uv - isoPos;
      float diamond = abs(p.x) * 1.5 + abs(p.y) * 3.0;
      float cube = smoothstep(0.08, 0.07, diamond);

      vec3 cubeCol = vec3(0.3, 0.2, 0.4) + row * 0.05;
      col += cubeCol * cube * 0.5;
    }
  }

  // Bouncing sproingies
  for (float i = 0.0; i < 5.0; i++) {
    float phase = i * 1.3 + t * 2.0;
    float bounce = abs(sin(phase)) * 0.15;

    // Position on the grid
    float gridX = mod(i * 1.7 + t * 0.3, 6.0);
    float gridY = mod(i * 2.1 + t * 0.2, 5.0);

    vec2 pos = vec2(
      (gridX - gridY * 0.5) * 0.12 - 0.2,
      (gridY * 0.06 + gridX * 0.0) - 0.3 - gridY * 0.05 + bounce
    );

    // Draw sproingie (simple ball with face)
    float d = length(uv - pos);
    float body = smoothstep(0.04, 0.03, d);

    // Color
    vec3 sproingie = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 1.5);

    // Eyes
    vec2 eyeL = pos + vec2(-0.012, 0.01);
    vec2 eyeR = pos + vec2(0.012, 0.01);
    float eyes = smoothstep(0.008, 0.005, length(uv - eyeL));
    eyes += smoothstep(0.008, 0.005, length(uv - eyeR));

    col = mix(col, sproingie, body);
    col = mix(col, vec3(0.0), eyes * body);

    // Shadow
    vec2 shadowPos = pos - vec2(0.0, bounce + 0.02);
    float shadow = smoothstep(0.05, 0.02, length(uv - shadowPos));
    col *= 1.0 - shadow * 0.3 * (1.0 - body);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Sproingies', desc: 'Bouncing Q*bert creatures' });

register('twang', `
// XScreenSaver Twang - wobbly elastic grid distortion
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time;

  // Grid parameters
  float gridSize = 20.0;
  vec2 grid = uv * gridSize;
  vec2 gridId = floor(grid);
  vec2 gridUv = fract(grid);

  // Distortion wave
  vec2 distort = vec2(
    sin(uv.y * 10.0 + t * 3.0) * sin(t + uv.x * 5.0),
    cos(uv.x * 10.0 + t * 2.5) * sin(t * 1.2 + uv.y * 5.0)
  ) * 0.1;

  // Mouse/touch interaction simulation
  vec2 touchPoint = vec2(0.5 + sin(t * 0.5) * 0.3, 0.5 + cos(t * 0.7) * 0.3);
  float touchDist = length(uv - touchPoint);
  vec2 touchDistort = normalize(uv - touchPoint + 0.001) * sin(touchDist * 20.0 - t * 5.0) * exp(-touchDist * 3.0) * 0.1;

  distort += touchDistort;

  // Draw distorted grid
  vec2 distortedUv = uv + distort;
  vec2 distGrid = distortedUv * gridSize;
  vec2 distGridUv = fract(distGrid);

  // Grid lines
  float lineX = smoothstep(0.05, 0.0, abs(distGridUv.x - 0.5) - 0.45);
  float lineY = smoothstep(0.05, 0.0, abs(distGridUv.y - 0.5) - 0.45);
  float lines = max(lineX, lineY);

  // Color based on distortion
  vec3 lineCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + length(distort) * 10.0 + t);
  col = lineCol * lines;

  // Grid intersections glow
  float intersection = lineX * lineY;
  col += vec3(1.0, 0.8, 0.5) * intersection * 2.0;

  fragColor = vec4(col, 1.0);
}`, { name: 'Twang', desc: 'Elastic grid distortion' });

register('lament', `
// XScreenSaver Lament - Hellraiser puzzle box
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.01, 0.03);

  float t = u_time * 0.3;

  // Rotation
  float cosT = cos(t), sinT = sin(t);
  float cosT2 = cos(t * 0.7), sinT2 = sin(t * 0.7);

  // Simple raymarched box with patterns
  vec3 ro = vec3(0.0, 0.0, -1.5);
  vec3 rd = normalize(vec3(uv, 1.0));

  // Rotate ray direction
  rd.xz = mat2(cosT, -sinT, sinT, cosT) * rd.xz;
  rd.yz = mat2(cosT2, -sinT2, sinT2, cosT2) * rd.yz;

  // Box intersection
  vec3 boxSize = vec3(0.3);
  vec3 m = 1.0 / rd;
  vec3 n = m * ro;
  vec3 k = abs(m) * boxSize;
  vec3 t1 = -n - k;
  vec3 t2 = -n + k;

  float tN = max(max(t1.x, t1.y), t1.z);
  float tF = min(min(t2.x, t2.y), t2.z);

  if (tN < tF && tN > 0.0) {
    vec3 pos = ro + rd * tN;
    vec3 nor = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);

    // Which face?
    vec2 faceUv;
    if (abs(nor.x) > 0.5) faceUv = pos.yz;
    else if (abs(nor.y) > 0.5) faceUv = pos.xz;
    else faceUv = pos.xy;

    faceUv = faceUv / boxSize.x * 0.5 + 0.5;

    // Lament Configuration pattern
    float pattern = 0.0;

    // Circular patterns
    float circle = length(faceUv - 0.5);
    pattern += smoothstep(0.02, 0.0, abs(circle - 0.3) - 0.02);
    pattern += smoothstep(0.02, 0.0, abs(circle - 0.15) - 0.01);

    // Cross patterns
    pattern += smoothstep(0.03, 0.0, abs(faceUv.x - 0.5)) * step(abs(faceUv.y - 0.5), 0.3);
    pattern += smoothstep(0.03, 0.0, abs(faceUv.y - 0.5)) * step(abs(faceUv.x - 0.5), 0.3);

    // Corner ornaments
    for (float i = 0.0; i < 4.0; i++) {
      vec2 corner = vec2(mod(i, 2.0), floor(i / 2.0)) * 0.6 + 0.2;
      float d = length(faceUv - corner);
      pattern += smoothstep(0.02, 0.0, abs(d - 0.08) - 0.01);
    }

    // Golden color with dark pattern
    vec3 gold = vec3(0.8, 0.6, 0.2);
    vec3 dark = vec3(0.1, 0.05, 0.02);

    // Lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
    float diff = max(dot(nor, lightDir), 0.0) * 0.7 + 0.3;

    col = mix(gold, dark, pattern * 0.8) * diff;

    // Specular
    vec3 viewDir = normalize(-rd);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(nor, halfDir), 0.0), 32.0);
    col += vec3(1.0, 0.9, 0.7) * spec * 0.5;
  }

  // Atmospheric glow
  col += vec3(0.1, 0.05, 0.02) * (1.0 - length(uv));

  fragColor = vec4(col, 1.0);
}`, { name: 'Lament', desc: 'Puzzle box from Hellraiser' });

register('endgame', `
// XScreenSaver Endgame - Chess endgame positions
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;
  uv = uv * 0.8 + 0.1;
  vec3 col = vec3(0.1);

  // Center the board
  vec2 boardUv = (uv - 0.5) * 1.2 + 0.5;

  // Check if on board
  if (boardUv.x >= 0.0 && boardUv.x <= 1.0 && boardUv.y >= 0.0 && boardUv.y <= 1.0) {
    // Board squares
    vec2 square = floor(boardUv * 8.0);
    float checker = mod(square.x + square.y, 2.0);
    vec3 lightSquare = vec3(0.9, 0.85, 0.75);
    vec3 darkSquare = vec3(0.4, 0.25, 0.15);
    col = mix(darkSquare, lightSquare, checker);

    // Piece positions (simple endgame: K+R vs K)
    float t = u_time * 0.3;

    // White King at e1 moving
    vec2 wKing = vec2(4.0 + sin(t) * 2.0, 0.0 + cos(t * 0.7) * 1.5);
    wKing = floor(wKing) + 0.5;

    // White Rook
    vec2 wRook = vec2(7.0, 3.0 + sin(t * 0.5) * 2.0);
    wRook = floor(wRook) + 0.5;

    // Black King (being chased)
    vec2 bKing = vec2(4.0 + cos(t * 0.8) * 2.0, 6.0 + sin(t * 0.6));
    bKing = floor(bKing) + 0.5;

    // Draw pieces
    vec2 pixelSquare = boardUv * 8.0;

    // White King
    float d = length(pixelSquare - wKing);
    if (d < 0.45) {
      // Crown shape
      float crown = smoothstep(0.4, 0.35, d);
      vec2 p = (pixelSquare - wKing) / 0.4;
      float cross = max(abs(p.x), abs(p.y));
      crown *= smoothstep(0.3, 0.2, min(cross, length(p) - 0.1));
      col = mix(col, vec3(1.0), crown);
      col = mix(col, vec3(0.2), smoothstep(0.3, 0.25, d) * (1.0 - crown));
    }

    // White Rook
    d = length(pixelSquare - wRook);
    if (d < 0.4) {
      float rook = smoothstep(0.4, 0.35, d);
      vec2 p = (pixelSquare - wRook) / 0.4;
      // Castle shape
      float castle = step(abs(p.x), 0.6) * step(abs(p.y), 0.8);
      float battlement = step(0.5, p.y) * step(0.3, abs(p.x));
      castle *= 1.0 - battlement * 0.5;
      col = mix(col, vec3(1.0), rook * castle);
      col = mix(col, vec3(0.2), smoothstep(0.35, 0.3, d) * (1.0 - rook * castle));
    }

    // Black King
    d = length(pixelSquare - bKing);
    if (d < 0.45) {
      float crown = smoothstep(0.4, 0.35, d);
      col = mix(col, vec3(0.1), crown);
      col = mix(col, vec3(0.0), smoothstep(0.3, 0.25, d) * (1.0 - crown * 0.5));
    }
  }

  // Board border
  float border = smoothstep(0.01, 0.0, abs(boardUv.x) - 0.01) +
                 smoothstep(0.01, 0.0, abs(boardUv.x - 1.0) - 0.01) +
                 smoothstep(0.01, 0.0, abs(boardUv.y) - 0.01) +
                 smoothstep(0.01, 0.0, abs(boardUv.y - 1.0) - 0.01);
  border *= step(0.0, boardUv.x) * step(boardUv.x, 1.0) * step(0.0, boardUv.y) * step(boardUv.y, 1.0);
  col = mix(col, vec3(0.3, 0.15, 0.05), min(border, 1.0));

  fragColor = vec4(col, 1.0);
}`, { name: 'Endgame', desc: 'Chess endgame visualization' });

// ============================================================================
// KDE SCREENSAVERS
// ============================================================================

register('euphoria', `
// KDE Euphoria - flowing ethereal wisps
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.3;

  // Multiple wisp layers
  for (float i = 0.0; i < 6.0; i++) {
    float phase = i * 1.047;

    // Flowing path
    vec2 center = vec2(
      sin(t + phase) * 0.3 + sin(t * 0.7 + phase * 2.0) * 0.2,
      cos(t * 0.8 + phase) * 0.3 + cos(t * 0.5 + phase * 1.5) * 0.2
    );

    // Wisp shape using noise
    float dist = length(uv - center);
    float wisp = 0.0;

    for (float j = 0.0; j < 20.0; j++) {
      float angle = j / 20.0 * 6.28318 + t * 0.5 + i;
      float r = 0.1 + sin(j * 0.5 + t + i) * 0.05;
      vec2 wispPoint = center + vec2(cos(angle), sin(angle)) * r;
      wisp += smoothstep(0.05, 0.0, length(uv - wispPoint));
    }

    vec3 wispCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i * 0.8 + t * 0.2);
    col += wispCol * wisp * 0.1;

    // Core glow
    col += wispCol * exp(-dist * 10.0) * 0.3;
  }

  // Soft glow
  col = pow(col, vec3(0.8));

  fragColor = vec4(col, 1.0);
}`, { name: 'Euphoria', desc: 'Ethereal flowing wisps' });

register('fieldlines', `
// KDE Fieldlines - electromagnetic field visualization
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.02, 0.05);

  float t = u_time * 0.5;

  // Two magnetic poles
  vec2 pole1 = vec2(sin(t * 0.3) * 0.25, cos(t * 0.4) * 0.15);
  vec2 pole2 = vec2(-sin(t * 0.35) * 0.25, -cos(t * 0.45) * 0.15);

  // Calculate field direction
  vec2 toP1 = uv - pole1;
  vec2 toP2 = uv - pole2;
  float r1 = length(toP1);
  float r2 = length(toP2);

  // Field from positive pole, field to negative pole
  vec2 field = toP1 / (r1 * r1 * r1 + 0.01) - toP2 / (r2 * r2 * r2 + 0.01);

  // Field lines (using stream function approximation)
  float angle1 = atan(toP1.y, toP1.x);
  float angle2 = atan(toP2.y, toP2.x);
  float streamFunc = angle1 - angle2;

  // Create field lines
  float lines = sin(streamFunc * 8.0);
  lines = smoothstep(0.8, 1.0, abs(lines));

  // Color based on field strength
  float strength = length(field);
  vec3 fieldCol = mix(vec3(0.2, 0.4, 0.8), vec3(0.8, 0.2, 0.4), smoothstep(0.0, 2.0, strength));

  col += fieldCol * lines * 0.8;

  // Pole glow
  col += vec3(0.8, 0.3, 0.2) * exp(-r1 * 8.0);  // Positive (red)
  col += vec3(0.2, 0.3, 0.8) * exp(-r2 * 8.0);  // Negative (blue)

  // Field direction indicators (small arrows)
  vec2 gridUv = fract(uv * 8.0 + 0.5) - 0.5;
  vec2 gridId = floor(uv * 8.0 + 0.5);
  vec2 gridCenter = gridId / 8.0;

  vec2 localField = normalize(field + 0.001);
  float arrow = dot(normalize(gridUv + 0.001), localField);
  arrow = smoothstep(0.3, 0.5, arrow) * smoothstep(0.15, 0.1, length(gridUv));
  col += vec3(0.5) * arrow * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Fieldlines', desc: 'Electromagnetic field' });

register('fireflies', `
// KDE Fireflies - glowing particles in darkness
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.01, 0.02, 0.04);  // Dark blue night

  float t = u_time;

  // Many fireflies
  for (float i = 0.0; i < 40.0; i++) {
    // Random base position
    vec2 basePos = vec2(
      hash(vec2(i, 0.0)) - 0.5,
      hash(vec2(i, 1.0)) - 0.5
    ) * 1.2;

    // Gentle floating motion
    vec2 pos = basePos + vec2(
      sin(t * 0.5 + i * 0.7) * 0.05,
      cos(t * 0.4 + i * 0.9) * 0.08
    );

    // Blinking pattern
    float blink = sin(t * (1.0 + hash(vec2(i, 2.0))) + i * 2.0);
    blink = smoothstep(0.3, 0.8, blink);

    // Glow
    float d = length(uv - pos);
    float glow = exp(-d * 50.0) * blink;

    // Warm yellow-green firefly color
    vec3 fireflyCol = mix(
      vec3(0.4, 0.8, 0.2),  // Green
      vec3(1.0, 0.9, 0.3),  // Yellow
      hash(vec2(i, 3.0))
    );

    col += fireflyCol * glow;

    // Subtle trail
    for (float tr = 1.0; tr < 4.0; tr++) {
      vec2 trailPos = basePos + vec2(
        sin(t * 0.5 + i * 0.7 - tr * 0.1) * 0.05,
        cos(t * 0.4 + i * 0.9 - tr * 0.08) * 0.08
      );
      float trailD = length(uv - trailPos);
      col += fireflyCol * exp(-trailD * 80.0) * blink * (1.0 - tr / 4.0) * 0.2;
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Fireflies', desc: 'Glowing fireflies in darkness' });

register('flux', `
// KDE Flux - flowing energy streams
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.4;

  // Multiple flux streams
  for (float i = 0.0; i < 5.0; i++) {
    float phase = i * 1.256;

    // Stream path
    for (float j = 0.0; j < 50.0; j++) {
      float jt = j / 50.0;
      float streamT = t + jt * 2.0 + phase;

      vec2 pos = vec2(
        sin(streamT * 1.5 + i) * 0.4 * (1.0 - jt * 0.3),
        cos(streamT * 0.8 + i * 2.0) * 0.3 + (jt - 0.5) * 0.5
      );

      float d = length(uv - pos);
      float particle = exp(-d * 40.0) * (1.0 - jt);

      vec3 streamCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + i + jt * 3.0);
      col += streamCol * particle * 0.3;
    }
  }

  // Energy core
  float core = length(uv);
  col += vec3(0.3, 0.5, 0.8) * exp(-core * 5.0) * 0.5;

  // Pulse
  float pulse = sin(t * 3.0) * 0.5 + 0.5;
  col *= 0.8 + pulse * 0.4;

  fragColor = vec4(col, 1.0);
}`, { name: 'Flux', desc: 'Flowing energy streams' });

register('helios', `
// KDE Helios - plasma sun orb
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.5;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);

  // Sun surface
  float sunRadius = 0.3;

  if (r < sunRadius) {
    // Surface turbulence
    float turb = fbm(uv * 8.0 + t) * 0.5;
    turb += fbm(uv * 16.0 - t * 0.5) * 0.25;

    // Sunspots
    float spots = smoothstep(0.6, 0.4, fbm(uv * 4.0 + vec2(t * 0.1, 0.0)));

    // Color gradient from center to edge
    vec3 coreCol = vec3(1.0, 1.0, 0.9);
    vec3 surfaceCol = vec3(1.0, 0.6, 0.1);
    vec3 spotCol = vec3(0.6, 0.2, 0.0);

    float edgeDark = smoothstep(0.0, sunRadius, r);
    col = mix(coreCol, surfaceCol, edgeDark);
    col = mix(col, spotCol, spots * 0.5);
    col += turb * vec3(0.2, 0.1, 0.0);

    // Limb darkening
    col *= 1.0 - edgeDark * 0.4;
  }

  // Corona
  float corona = 0.0;
  for (float i = 0.0; i < 12.0; i++) {
    float a = i / 12.0 * 6.28318;
    float flare = sin(a * 3.0 + t) * 0.5 + 0.5;
    float ray = smoothstep(sunRadius + 0.15 * flare, sunRadius, r);
    ray *= smoothstep(0.3, 0.0, abs(mod(angle - a + 3.14159, 6.28318) - 3.14159));
    corona += ray;
  }
  col += vec3(1.0, 0.7, 0.3) * corona * 0.5;

  // Glow
  float glow = exp(-(r - sunRadius) * 3.0) * step(sunRadius, r);
  col += vec3(1.0, 0.5, 0.2) * glow;

  // Outer corona
  float outerCorona = exp(-(r - sunRadius) * 1.5) * step(sunRadius, r);
  col += vec3(0.3, 0.2, 0.1) * outerCorona;

  fragColor = vec4(col, 1.0);
}`, { name: 'Helios', desc: 'Plasma sun orb' });

register('lattice', `
// KDE Lattice - rotating 3D lattice structure
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.02, 0.05);

  float t = u_time * 0.3;

  // Rotation
  float cosX = cos(t), sinX = sin(t);
  float cosY = cos(t * 0.7), sinY = sin(t * 0.7);
  float cosZ = cos(t * 0.5), sinZ = sin(t * 0.5);

  // 3D lattice points
  for (float x = -2.0; x <= 2.0; x++) {
    for (float y = -2.0; y <= 2.0; y++) {
      for (float z = -2.0; z <= 2.0; z++) {
        vec3 p = vec3(x, y, z) * 0.15;

        // Rotate X
        float y1 = p.y * cosX - p.z * sinX;
        float z1 = p.y * sinX + p.z * cosX;
        p.y = y1; p.z = z1;

        // Rotate Y
        float x1 = p.x * cosY + p.z * sinY;
        z1 = -p.x * sinY + p.z * cosY;
        p.x = x1; p.z = z1;

        // Rotate Z
        x1 = p.x * cosZ - p.y * sinZ;
        y1 = p.x * sinZ + p.y * cosZ;
        p.x = x1; p.y = y1;

        // Project
        float perspective = 1.0 / (1.0 + p.z * 0.5);
        vec2 proj = p.xy * perspective;

        // Distance and draw
        float d = length(uv - proj);
        float size = 0.015 * perspective;
        float point = smoothstep(size, size * 0.5, d);

        // Color by depth
        vec3 nodeCol = mix(vec3(0.2, 0.4, 0.8), vec3(0.8, 0.4, 0.2), (p.z + 0.3) / 0.6);
        col += nodeCol * point * perspective;

        // Connect to neighbors (only positive direction to avoid duplicates)
        vec3 neighbors[3];
        neighbors[0] = vec3(x + 1.0, y, z);
        neighbors[1] = vec3(x, y + 1.0, z);
        neighbors[2] = vec3(x, y, z + 1.0);

        for (int n = 0; n < 3; n++) {
          if (neighbors[n].x <= 2.0 && neighbors[n].y <= 2.0 && neighbors[n].z <= 2.0) {
            vec3 np = neighbors[n] * 0.15;

            // Same rotations
            y1 = np.y * cosX - np.z * sinX;
            z1 = np.y * sinX + np.z * cosX;
            np.y = y1; np.z = z1;

            x1 = np.x * cosY + np.z * sinY;
            z1 = -np.x * sinY + np.z * cosY;
            np.x = x1; np.z = z1;

            x1 = np.x * cosZ - np.y * sinZ;
            y1 = np.x * sinZ + np.y * cosZ;
            np.x = x1; np.y = y1;

            float np_persp = 1.0 / (1.0 + np.z * 0.5);
            vec2 nproj = np.xy * np_persp;

            float lineDist = line(uv, proj, nproj);
            float lineAlpha = smoothstep(0.004, 0.001, lineDist);
            col += vec3(0.3, 0.4, 0.5) * lineAlpha * min(perspective, np_persp) * 0.5;
          }
        }
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Lattice', desc: 'Rotating 3D lattice' });

register('solarwinds', `
// KDE Solar Winds - aurora-like effect
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time * 0.3;

  // Aurora curtains
  for (float i = 0.0; i < 5.0; i++) {
    float phase = i * 0.7;

    // Vertical wave
    float wave = sin(uv.x * 6.0 + t + phase) * 0.1;
    wave += sin(uv.x * 10.0 - t * 1.5 + phase) * 0.05;
    wave += sin(uv.x * 15.0 + t * 0.5 + phase) * 0.03;

    // Aurora position
    float auroraY = 0.6 + wave + i * 0.05;

    // Vertical gradient (aurora rays)
    float rays = smoothstep(auroraY + 0.3, auroraY, uv.y);
    rays *= smoothstep(auroraY - 0.2, auroraY, uv.y);

    // Horizontal variation
    float horiz = fbm(vec2(uv.x * 3.0 + t * 0.2, i)) * 0.5 + 0.5;

    // Color
    vec3 auroraCol;
    if (i < 2.0) {
      auroraCol = mix(vec3(0.1, 0.8, 0.3), vec3(0.1, 0.4, 0.2), uv.y);  // Green
    } else if (i < 4.0) {
      auroraCol = mix(vec3(0.2, 0.3, 0.8), vec3(0.5, 0.2, 0.6), uv.y);  // Blue-purple
    } else {
      auroraCol = mix(vec3(0.8, 0.2, 0.3), vec3(0.6, 0.1, 0.2), uv.y);  // Red
    }

    col += auroraCol * rays * horiz * 0.4;
  }

  // Stars in background
  vec2 starGrid = floor(uv * 50.0);
  float star = step(0.98, hash(starGrid));
  float twinkle = sin(u_time * 3.0 + hash(starGrid + 100.0) * 6.28) * 0.5 + 0.5;
  col += vec3(1.0) * star * twinkle * 0.5 * (1.0 - col.g);

  // Dark ground
  col *= smoothstep(0.0, 0.15, uv.y);

  fragColor = vec4(col, 1.0);
}`, { name: 'Solar Winds', desc: 'Aurora borealis effect' });

// ============================================================================
// AFTER DARK - Iconic Character Screensavers
// ============================================================================

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

// ============================================================================
// SGI IRIX / SPECIAL SYSTEMS
// ============================================================================

register('electropaint', `
// SGI IRIX Electropaint - flowing paint ribbons
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);

  float t = u_time * 0.3;

  // Multiple flowing ribbons
  for (float ribbon = 0.0; ribbon < 6.0; ribbon++) {
    float phase = ribbon * 1.047;

    // Ribbon path (flowing curves)
    for (float i = 0.0; i < 80.0; i++) {
      float fi = i / 80.0;
      float pathT = fi * 4.0 + t + phase;

      vec2 pos = vec2(
        sin(pathT * 1.5 + ribbon) * 0.4 + sin(pathT * 0.7) * 0.2,
        cos(pathT * 1.2 + ribbon * 0.5) * 0.3 + cos(pathT * 0.5) * 0.15
      );

      // Ribbon width varies
      float width = 0.02 + sin(fi * 6.28 + t) * 0.01;

      float d = length(uv - pos);
      float ribbonAlpha = smoothstep(width, width * 0.3, d) * (1.0 - fi * 0.5);

      // Color shifts along ribbon
      vec3 ribbonCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + ribbon * 0.8 + fi * 2.0 + t * 0.5);

      col += ribbonCol * ribbonAlpha * 0.08;
    }
  }

  // Enhance colors
  col = pow(col, vec3(0.85));

  // Subtle glow
  col += col * 0.5;

  fragColor = vec4(col, 1.0);
}`, { name: 'Electropaint', desc: 'SGI flowing paint ribbons' });

register('insidecomputer', `
// Microsoft Plus! Inside Your Computer - journey inside PC
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.02, 0.05, 0.02);  // Dark green PCB

  float t = u_time;

  // Moving through the computer (z-depth effect)
  float z = mod(t * 0.5, 5.0);

  // PCB traces (circuit paths)
  for (float layer = 0.0; layer < 3.0; layer++) {
    float layerZ = mod(z + layer * 1.5, 5.0);
    float scale = 1.0 / (layerZ * 0.3 + 0.5);
    float alpha = smoothstep(5.0, 0.0, layerZ);

    vec2 scaledUv = uv * scale;

    // Horizontal traces
    float hTrace = smoothstep(0.02, 0.01, abs(fract(scaledUv.y * 8.0) - 0.5));
    hTrace *= step(0.3, hash(floor(scaledUv * 8.0)));

    // Vertical traces
    float vTrace = smoothstep(0.02, 0.01, abs(fract(scaledUv.x * 8.0) - 0.5));
    vTrace *= step(0.3, hash(floor(scaledUv * 8.0) + 100.0));

    col += vec3(0.8, 0.7, 0.2) * (hTrace + vTrace) * alpha * 0.3;

    // Solder points
    vec2 gridId = floor(scaledUv * 8.0);
    vec2 gridUv = fract(scaledUv * 8.0) - 0.5;
    if (hash(gridId + layer) > 0.7) {
      float solder = smoothstep(0.15, 0.1, length(gridUv));
      col += vec3(0.7, 0.7, 0.8) * solder * alpha;
    }
  }

  // Chips / components
  for (float chip = 0.0; chip < 5.0; chip++) {
    float chipZ = mod(z + chip * 0.8, 4.0);
    float chipScale = 1.0 / (chipZ * 0.4 + 0.3);
    float chipAlpha = smoothstep(4.0, 0.0, chipZ);

    vec2 chipPos = vec2(
      (hash(vec2(chip, 0.0)) - 0.5) * 0.8,
      (hash(vec2(chip, 1.0)) - 0.5) * 0.6
    );

    vec2 chipUv = (uv - chipPos) * chipScale;
    float chipShape = max(abs(chipUv.x) - 0.15, abs(chipUv.y) - 0.08);

    if (chipShape < 0.0) {
      col = mix(col, vec3(0.1, 0.1, 0.15), chipAlpha);

      // Chip pins
      float pins = smoothstep(0.01, 0.005, abs(fract(chipUv.x * 20.0) - 0.5));
      pins *= step(0.06, abs(chipUv.y));
      col += vec3(0.6, 0.6, 0.7) * pins * chipAlpha;

      // Chip text
      float text = smoothstep(0.05, 0.03, abs(chipUv.y));
      text *= smoothstep(0.1, 0.05, abs(chipUv.x));
      col += vec3(0.8) * text * chipAlpha * 0.3;
    }
  }

  // Electrical pulses along traces
  for (float pulse = 0.0; pulse < 8.0; pulse++) {
    float pulseT = mod(t * 2.0 + pulse * 0.5, 3.0);
    vec2 pulsePos = vec2(
      (hash(vec2(pulse, 10.0)) - 0.5) * 1.5,
      (hash(vec2(pulse, 11.0)) - 0.5) + pulseT * 0.5 - 0.75
    );

    float pulseDist = length(uv - pulsePos);
    float pulseGlow = exp(-pulseDist * 20.0) * (1.0 - pulseT / 3.0);
    col += vec3(0.2, 1.0, 0.3) * pulseGlow;
  }

  // Scan lines
  col *= 0.95 + 0.05 * sin(uv.y * 200.0);

  fragColor = vec4(col, 1.0);
}`, { name: 'Inside Computer', desc: 'Journey inside the PC' });

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

register('pipes_ag', `
#define MAX_STEPS 100
#define MAX_DIST 50.0
#define SURF_DIST 0.01

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
        float n = fbm(p * 2.0 - vec3(0.0, 0.0, t * 0.5));
        
        vec3 sunBase = vec3(1.0, 0.2, 0.0);
        vec3 sunHot = vec3(1.0, 0.8, 0.2);
        col = mix(sunBase, sunHot, smoothstep(0.3, 0.7, n));
        col *= smoothstep(0.1, 0.3, fbm(p * 4.0 + t));
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

// ============================================================================
// AFTER DARK - More Classics
// ============================================================================

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

// ============================================================================
// OS/2 WARP
// ============================================================================

register('flyingos2', `
// OS/2 Warp Flying Logos
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);
  float t = u_time;

  // Flying OS/2 logos
  for (float i = 0.0; i < 25.0; i++) {
    float z = fract(hash(vec2(i, 0.0)) - t * 0.2);
    vec2 pos = vec2((hash(vec2(i, 1.0)) - 0.5) * 2.0, (hash(vec2(i, 2.0)) - 0.5) * 1.5) / (z + 0.1);
    float size = 0.05 / (z + 0.1);
    vec2 logoUv = (uv - pos) / size;

    // Simplified OS/2 shape
    float logo = smoothstep(0.05, 0.0, abs(length(logoUv + vec2(0.3, 0.0)) - 0.2));
    logo += smoothstep(0.05, 0.0, abs(logoUv.x - 0.2) + abs(logoUv.y) - 0.25);

    vec3 logoCol = mix(vec3(0.0, 0.3, 0.8), vec3(0.8, 0.2, 0.2), logoUv.x * 0.5 + 0.5);
    col += logoCol * logo * z;
  }

  // Stars
  for (float i = 0.0; i < 50.0; i++) {
    float z = fract(hash(vec2(i + 100.0, 0.0)) - t * 0.3);
    vec2 pos = vec2((hash(vec2(i + 100.0, 1.0)) - 0.5) * 2.5, (hash(vec2(i + 100.0, 2.0)) - 0.5) * 2.0) / (z + 0.1);
    col += vec3(1.0) * smoothstep(0.01 / z, 0.0, length(uv - pos)) * z;
  }
  fragColor = vec4(col, 1.0);
}`, { name: 'Flying OS/2', desc: 'OS/2 logos in space' });

// ============================================================================
// AMIGA
// ============================================================================

register('amigaball', `
// Amiga Boing Ball - iconic checkered bouncing ball
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.5, 0.5, 0.6);
  float t = u_time;

  // Grid background
  vec2 gridUv = uv * 10.0;
  float grid = smoothstep(0.1, 0.0, abs(fract(gridUv.x) - 0.5));
  grid += smoothstep(0.1, 0.0, abs(fract(gridUv.y) - 0.5));
  col = mix(col, vec3(0.4, 0.4, 0.5), grid * 0.3 * smoothstep(0.8, 0.2, length(uv)));

  // Ball bouncing
  float bounceX = sin(t * 1.5) * 0.3;
  float bounceY = abs(sin(t * 2.5)) * 0.25 - 0.1;
  float squash = 1.0 - smoothstep(0.0, 0.1, bounceY + 0.1) * 0.2;
  vec2 ballPos = vec2(bounceX, bounceY);
  float ballRadius = 0.2;

  vec2 toBall = uv - ballPos;
  float ballDist = length(toBall / vec2(1.0, squash));

  if (ballDist < ballRadius) {
    float u_s = atan(toBall.x, sqrt(max(0.0, ballRadius * ballRadius - toBall.x * toBall.x - (toBall.y / squash) * (toBall.y / squash))));
    float v_s = asin(clamp((toBall.y / squash) / ballRadius, -1.0, 1.0));
    u_s += t * 3.0;
    float checker = mod(floor(u_s * 4.0 / 3.14159) + floor(v_s * 4.0 / 3.14159), 2.0);
    vec3 ballCol = mix(vec3(1.0, 0.1, 0.1), vec3(1.0), checker);
    vec3 normal = normalize(vec3(toBall / vec2(1.0, squash), sqrt(max(0.0, ballRadius * ballRadius - ballDist * ballDist))));
    float shade = max(dot(normal, normalize(vec3(0.5, 0.8, 1.0))), 0.0) * 0.6 + 0.4;
    col = ballCol * shade;
  }

  // Shadow
  vec2 shadowPos = vec2(bounceX, -0.35);
  float shadow = smoothstep(0.15 * (1.0 + bounceY * 0.5), 0.0, length(uv - shadowPos));
  col *= 1.0 - shadow * 0.4;

  fragColor = vec4(col, 1.0);
}`, { name: 'Amiga Ball', desc: 'Iconic checkered bouncing ball' });

// ============================================================================
// WINDOWS XP
// ============================================================================

register('windowsxp', `
// Windows XP Logo - animated flying XP logo
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0, 0.3, 0.6);  // XP blue gradient
  float t = u_time;

  // Gradient background
  col = mix(vec3(0.0, 0.2, 0.5), vec3(0.2, 0.5, 0.8), uv.y + 0.5);

  // Flying XP logo animation
  float flyPhase = mod(t * 0.3, 6.28318);
  vec2 logoPos = vec2(sin(flyPhase) * 0.2, cos(flyPhase * 0.7) * 0.15);
  float logoScale = 0.8 + sin(t * 0.5) * 0.1;

  vec2 p = (uv - logoPos) / logoScale;

  // XP flag shape (4 colored segments)
  float flag = 0.0;

  // Waving effect
  float wave = sin(p.x * 5.0 + t * 3.0) * 0.03;
  p.y += wave;

  // Four quadrants with curves
  // Red (top-left)
  vec2 redP = p - vec2(-0.08, 0.05);
  float red = smoothstep(0.08, 0.06, length(redP * vec2(0.8, 1.2)));
  red *= step(redP.x, 0.02) * step(-0.02, redP.y);

  // Green (top-right)
  vec2 greenP = p - vec2(0.08, 0.05);
  float green = smoothstep(0.08, 0.06, length(greenP * vec2(0.8, 1.2)));
  green *= step(-0.02, greenP.x) * step(-0.02, greenP.y);

  // Blue (bottom-left)
  vec2 blueP = p - vec2(-0.08, -0.05);
  float blue = smoothstep(0.08, 0.06, length(blueP * vec2(0.8, 1.2)));
  blue *= step(blueP.x, 0.02) * step(blueP.y, 0.02);

  // Yellow (bottom-right)
  vec2 yellowP = p - vec2(0.08, -0.05);
  float yellow = smoothstep(0.08, 0.06, length(yellowP * vec2(0.8, 1.2)));
  yellow *= step(-0.02, yellowP.x) * step(yellowP.y, 0.02);

  col = mix(col, vec3(0.9, 0.2, 0.1), red);
  col = mix(col, vec3(0.2, 0.7, 0.2), green);
  col = mix(col, vec3(0.1, 0.3, 0.8), blue);
  col = mix(col, vec3(0.95, 0.8, 0.1), yellow);

  // Shine/glow effect
  float shine = exp(-length(p) * 8.0) * 0.3;
  col += vec3(1.0) * shine;

  // Particle trail
  for (float i = 0.0; i < 20.0; i++) {
    float trailT = t - i * 0.05;
    vec2 trailPos = vec2(sin(mod(trailT * 0.3, 6.28318)) * 0.2, cos(mod(trailT * 0.3, 6.28318) * 0.7) * 0.15);
    float trail = smoothstep(0.015, 0.0, length(uv - trailPos - vec2(hash(vec2(i, 0.0)) - 0.5, hash(vec2(i, 1.0)) - 0.5) * 0.1));
    col += vec3(0.5, 0.7, 1.0) * trail * (1.0 - i / 20.0) * 0.3;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Windows XP', desc: 'Animated XP logo' });

register('windowsenergy', `
// Windows Vista Energy - animated Windows logo energy effect
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);
  float t = u_time;

  // Dark gradient background
  col = mix(vec3(0.0, 0.02, 0.05), vec3(0.0, 0.0, 0.02), length(uv));

  // Energy particles orbiting
  for (float i = 0.0; i < 50.0; i++) {
    float angle = i / 50.0 * 6.28318 + t * (0.5 + hash(vec2(i, 0.0)) * 0.5);
    float radius = 0.15 + sin(t * 2.0 + i) * 0.05;
    float z = sin(angle * 2.0 + t) * 0.3;

    vec2 particlePos = vec2(cos(angle), sin(angle)) * radius;
    particlePos *= 1.0 + z * 0.2;  // Depth effect

    float d = length(uv - particlePos);
    float particle = exp(-d * 50.0);

    vec3 particleCol = mix(vec3(0.2, 0.5, 1.0), vec3(0.0, 1.0, 0.5), hash(vec2(i, 1.0)));
    particleCol = mix(particleCol, vec3(1.0, 0.8, 0.2), sin(t + i) * 0.5 + 0.5);

    col += particleCol * particle * (0.5 + z * 0.5);
  }

  // Central Windows logo silhouette
  vec2 p = uv * 3.0;
  float logo = 0.0;

  // Four window panes
  for (float i = 0.0; i < 4.0; i++) {
    vec2 offset = vec2(mod(i, 2.0) - 0.5, floor(i / 2.0) - 0.5) * 0.5;
    float pane = max(abs(p.x - offset.x * 1.2) - 0.2, abs(p.y - offset.y * 1.2) - 0.18);
    // Perspective skew
    pane = max(pane, (p.x + p.y * 0.3) * 0.3 - 0.4);
    logo = max(logo, smoothstep(0.02, 0.0, pane));
  }

  // Glow around logo
  float glow = exp(-length(uv) * 4.0);
  col += vec3(0.1, 0.3, 0.6) * glow;

  // Energy pulse
  float pulse = sin(t * 3.0) * 0.5 + 0.5;
  col *= 0.8 + pulse * 0.4;

  fragColor = vec4(col, 1.0);
}`, { name: 'Windows Energy', desc: 'Vista-style energy effect' });

// ============================================================================
// NeXTSTEP
// ============================================================================

register('backspace', `
// NeXTSTEP BackSpace - abstract geometric patterns
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);
  float t = u_time * 0.5;

  // Rotating cubes in 3D space
  for (float i = 0.0; i < 8.0; i++) {
    float angle = t + i * 0.785;
    float radius = 0.2 + i * 0.03;

    // 3D rotation
    float cosA = cos(angle), sinA = sin(angle);
    float cosB = cos(angle * 0.7), sinB = sin(angle * 0.7);

    vec3 cubePos = vec3(cos(i * 1.5) * radius, sin(i * 1.2) * radius, sin(i * 0.8 + t) * 0.2);

    // Rotate
    float x1 = cubePos.x * cosA - cubePos.z * sinA;
    float z1 = cubePos.x * sinA + cubePos.z * cosA;
    float y1 = cubePos.y * cosB - z1 * sinB;
    float z2 = cubePos.y * sinB + z1 * cosB;

    // Project to 2D
    float perspective = 1.0 / (1.0 + z2 * 0.5);
    vec2 proj = vec2(x1, y1) * perspective;

    // Draw cube face
    float size = 0.04 * perspective;
    float cube = max(abs(uv.x - proj.x) - size, abs(uv.y - proj.y) - size);
    float face = smoothstep(0.005, 0.0, cube);

    // NeXT-style grayscale with slight color
    vec3 cubeCol = vec3(0.3 + i * 0.08) + vec3(0.1, 0.05, 0.0) * perspective;
    col += cubeCol * face * perspective;

    // Edges
    float edge = smoothstep(0.008, 0.003, abs(cube + size * 0.1));
    col += vec3(0.8) * edge * perspective * 0.5;
  }

  // NeXT logo hint in center
  float logo = smoothstep(0.12, 0.11, length(uv));
  logo *= smoothstep(0.08, 0.09, length(uv));
  col += vec3(0.2) * logo;

  // Subtle scanlines
  col *= 0.95 + 0.05 * sin(gl_FragCoord.y * 2.0);

  fragColor = vec4(col, 1.0);
}`, { name: 'BackSpace', desc: 'NeXTSTEP geometric patterns' });

register('nextstep', `
// NeXTSTEP cube - rotating NeXT logo cube
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.15);  // NeXT gray
  float t = u_time * 0.5;

  // Rotation matrices
  float cosX = cos(t), sinX = sin(t);
  float cosY = cos(t * 0.7), sinY = sin(t * 0.7);

  // Cube vertices
  vec3 verts[8];
  float s = 0.2;
  verts[0] = vec3(-s, -s, -s);
  verts[1] = vec3(s, -s, -s);
  verts[2] = vec3(s, s, -s);
  verts[3] = vec3(-s, s, -s);
  verts[4] = vec3(-s, -s, s);
  verts[5] = vec3(s, -s, s);
  verts[6] = vec3(s, s, s);
  verts[7] = vec3(-s, s, s);

  // Rotate and project vertices
  vec2 proj[8];
  for (int i = 0; i < 8; i++) {
    vec3 v = verts[i];
    // Rotate Y
    float x1 = v.x * cosY - v.z * sinY;
    float z1 = v.x * sinY + v.z * cosY;
    // Rotate X
    float y1 = v.y * cosX - z1 * sinX;
    float z2 = v.y * sinX + z1 * cosX;

    float persp = 1.0 / (1.0 + z2 * 0.3);
    proj[i] = vec2(x1, y1) * persp;
  }

  // Draw edges
  int edges[24];
  edges[0] = 0; edges[1] = 1;
  edges[2] = 1; edges[3] = 2;
  edges[4] = 2; edges[5] = 3;
  edges[6] = 3; edges[7] = 0;
  edges[8] = 4; edges[9] = 5;
  edges[10] = 5; edges[11] = 6;
  edges[12] = 6; edges[13] = 7;
  edges[14] = 7; edges[15] = 4;
  edges[16] = 0; edges[17] = 4;
  edges[18] = 1; edges[19] = 5;
  edges[20] = 2; edges[21] = 6;
  edges[22] = 3; edges[23] = 7;

  for (int i = 0; i < 12; i++) {
    vec2 p1 = proj[edges[i * 2]];
    vec2 p2 = proj[edges[i * 2 + 1]];
    float d = line(uv, p1, p2);
    float edge = smoothstep(0.004, 0.001, d);
    col += vec3(0.8) * edge;
  }

  // "NeXT" text approximation on front face
  float textGlow = smoothstep(0.15, 0.0, length(uv));
  col += vec3(0.3) * textGlow * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'NeXTSTEP', desc: 'Rotating NeXT cube' });

// ============================================================================
// MORE XSCREENSAVER
// ============================================================================

register('fireworkx', `
// XScreenSaver Fireworkx - fireworks display
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;
  vec3 col = vec3(0.0, 0.0, 0.02);
  float t = u_time;

  // Multiple fireworks
  for (float fw = 0.0; fw < 5.0; fw++) {
    float fwTime = mod(t + fw * 1.3, 4.0);
    float launchX = hash(vec2(fw, floor(t / 4.0 + fw * 0.3))) * 0.8 + 0.1;

    if (fwTime < 1.5) {
      // Launch trail
      float launchY = fwTime * 0.5;
      vec2 launchPos = vec2(launchX, launchY);
      float trail = smoothstep(0.02, 0.0, length(uv - launchPos));
      col += vec3(1.0, 0.8, 0.4) * trail;

      // Sparks during launch
      for (float s = 0.0; s < 5.0; s++) {
        vec2 sparkPos = launchPos - vec2(0.0, s * 0.02);
        sparkPos += vec2(hash(vec2(s, fw)) - 0.5, 0.0) * 0.02;
        float spark = smoothstep(0.008, 0.0, length(uv - sparkPos));
        col += vec3(1.0, 0.6, 0.2) * spark * (1.0 - s / 5.0);
      }
    } else if (fwTime < 3.5) {
      // Explosion
      float explodeTime = fwTime - 1.5;
      vec2 explodePos = vec2(launchX, 0.75);
      float explodeRadius = explodeTime * 0.3;
      float fade = 1.0 - explodeTime / 2.0;

      // Explosion particles
      for (float p = 0.0; p < 50.0; p++) {
        float angle = hash(vec2(p, fw)) * 6.28318;
        float speed = 0.5 + hash(vec2(p + 50.0, fw)) * 0.5;
        float gravity = explodeTime * explodeTime * 0.1;

        vec2 particlePos = explodePos + vec2(cos(angle), sin(angle)) * explodeRadius * speed;
        particlePos.y -= gravity;

        float d = length(uv - particlePos);
        float particle = smoothstep(0.008, 0.0, d) * fade;

        vec3 particleCol = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + fw * 2.0 + p * 0.1);
        col += particleCol * particle;
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Fireworkx', desc: 'Fireworks display' });

register('phosphor', `
// XScreenSaver Phosphor - old terminal emulator
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);
  float t = u_time;

  // Green phosphor color
  vec3 phosphorCol = vec3(0.2, 1.0, 0.3);

  // Character grid
  float charW = 0.0125;
  float charH = 0.025;
  vec2 charPos = floor(uv / vec2(charW, charH));
  vec2 charUv = fract(uv / vec2(charW, charH));

  float row = charPos.y;
  float col_i = charPos.x;

  // Scrolling effect
  float scroll = floor(t * 3.0);
  row += scroll;

  // Generate text pattern
  float charHash = hash(vec2(row, col_i));

  // Typing effect
  float typingCol = mod(t * 20.0, 80.0);
  float typingRow = floor(t * 3.0);

  float visible = 1.0;
  if (charPos.y > 25.0 - mod(scroll, 25.0)) {
    if (charPos.x > typingCol) visible = 0.0;
  }

  // Random characters
  if (charHash > 0.3 && visible > 0.0) {
    // Simple block character
    float charShape = step(0.15, charUv.x) * step(charUv.x, 0.85);
    charShape *= step(0.1, charUv.y) * step(charUv.y, 0.9);

    // Different character shapes
    if (charHash > 0.7) {
      charShape *= step(0.5, charUv.y) + step(charUv.y, 0.5) * step(0.4, charUv.x) * step(charUv.x, 0.6);
    } else if (charHash > 0.5) {
      charShape = step(0.3, charUv.x) * step(charUv.x, 0.7);
      charShape *= step(0.2, charUv.y) * step(charUv.y, 0.8);
    }

    col += phosphorCol * charShape;
  }

  // Cursor blink
  float cursorX = mod(typingCol, 80.0) * charW;
  float cursorY = (25.0 - 1.0) * charH;
  if (abs(uv.x - cursorX - charW * 0.5) < charW * 0.4 &&
      abs(uv.y - cursorY - charH * 0.5) < charH * 0.4) {
    if (mod(t, 1.0) < 0.5) {
      col += phosphorCol;
    }
  }

  // Phosphor glow
  col += col * 0.5;

  // Scanlines
  col *= 0.9 + 0.1 * sin(uv.y * u_resolution.y * 3.14159);

  // Vignette
  col *= 0.8 + 0.2 * smoothstep(0.8, 0.3, length(uv - 0.5));

  // Slight flicker
  col *= 0.97 + 0.03 * sin(t * 60.0);

  fragColor = vec4(col, 1.0);
}`, { name: 'Phosphor', desc: 'Old terminal emulator' });

register('atlantis', `
// XScreenSaver Atlantis - underwater with swimming creatures
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Deep ocean gradient
  vec3 col = mix(vec3(0.0, 0.05, 0.15), vec3(0.0, 0.02, 0.08), uv.y);

  // Light rays from above
  for (float i = 0.0; i < 5.0; i++) {
    float rayX = 0.1 + i * 0.2 + sin(t * 0.3 + i) * 0.05;
    float ray = smoothstep(0.08, 0.0, abs(uv.x - rayX));
    ray *= smoothstep(0.0, 0.8, uv.y);
    col += vec3(0.05, 0.1, 0.15) * ray;
  }

  // Swimming whales/dolphins
  for (float i = 0.0; i < 3.0; i++) {
    float creatureX = fract(t * 0.05 * (1.0 + i * 0.2) + i * 0.3);
    float creatureY = 0.3 + i * 0.2 + sin(t * 0.5 + i * 2.0) * 0.05;

    vec2 creaturePos = vec2(creatureX, creatureY);
    vec2 toCreature = uv - creaturePos;

    // Body (elongated ellipse)
    float body = length(toCreature * vec2(0.5, 2.5));
    float creature = smoothstep(0.08, 0.07, body);

    // Tail
    vec2 tailPos = toCreature + vec2(0.08, 0.0);
    float tail = length(tailPos * vec2(0.8, 1.5));
    tail = smoothstep(0.04, 0.03, tail) * step(0.0, tailPos.x);

    // Fin
    vec2 finPos = toCreature + vec2(0.0, -0.03);
    float fin = smoothstep(0.025, 0.02, length(finPos * vec2(1.5, 0.8)));
    fin *= step(finPos.y, 0.0);

    // Color
    vec3 creatureCol = mix(vec3(0.2, 0.3, 0.4), vec3(0.1, 0.15, 0.2), i / 3.0);

    col = mix(col, creatureCol, creature);
    col = mix(col, creatureCol * 0.8, tail);
    col = mix(col, creatureCol * 0.9, fin);

    // Eye
    vec2 eyePos = toCreature + vec2(-0.05, 0.01);
    float eye = smoothstep(0.008, 0.005, length(eyePos));
    col = mix(col, vec3(0.1), eye * creature);
  }

  // Small fish school
  for (float i = 0.0; i < 20.0; i++) {
    float schoolPhase = t * 0.1 + hash(vec2(i, 0.0));
    vec2 fishPos = vec2(
      fract(schoolPhase + hash(vec2(i, 1.0)) * 0.2),
      0.5 + hash(vec2(i, 2.0)) * 0.3 + sin(t * 2.0 + i) * 0.02
    );

    float fish = smoothstep(0.012, 0.008, length((uv - fishPos) * vec2(1.0, 2.0)));
    col += vec3(0.3, 0.4, 0.5) * fish * 0.5;
  }

  // Bubbles
  for (float i = 0.0; i < 10.0; i++) {
    float bubbleX = hash(vec2(i, 10.0));
    float bubbleY = fract(t * 0.1 + hash(vec2(i, 11.0)));
    vec2 bubblePos = vec2(bubbleX + sin(bubbleY * 5.0) * 0.02, bubbleY);
    float bubble = smoothstep(0.008, 0.004, length(uv - bubblePos));
    col += vec3(0.2, 0.3, 0.4) * bubble * 0.3;
  }

  // Ocean floor
  if (uv.y < 0.1) {
    float floor_v = smoothstep(0.1, 0.0, uv.y);
    col = mix(col, vec3(0.15, 0.12, 0.1), floor_v);

    // Seaweed
    for (float i = 0.0; i < 10.0; i++) {
      float weedX = hash(vec2(i, 20.0));
      float weedH = 0.05 + hash(vec2(i, 21.0)) * 0.04;
      float sway = sin(t * 2.0 + i) * 0.01;

      if (uv.x > weedX - 0.01 + sway && uv.x < weedX + 0.01 + sway && uv.y < weedH) {
        col = mix(col, vec3(0.1, 0.3, 0.15), 0.8);
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Atlantis', desc: 'Underwater with sea creatures' });

register('galaxy', `
// XScreenSaver Galaxy - spiral galaxy simulation
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0, 0.0, 0.02);
  float t = u_time * 0.1;

  // Galaxy rotation
  float cosR = cos(t * 0.5), sinR = sin(t * 0.5);
  vec2 rotUv = vec2(uv.x * cosR - uv.y * sinR, uv.x * sinR + uv.y * cosR);

  // Convert to polar
  float r = length(rotUv);
  float angle = atan(rotUv.y, rotUv.x);

  // Spiral arms
  for (float arm = 0.0; arm < 2.0; arm++) {
    float armAngle = angle + arm * 3.14159;
    float spiral = armAngle + r * 8.0 - t * 2.0;
    float armBright = smoothstep(1.0, 0.0, abs(sin(spiral)));
    armBright *= smoothstep(0.5, 0.1, r);
    armBright *= smoothstep(0.02, 0.08, r);

    col += vec3(0.4, 0.5, 0.8) * armBright * 0.3;
  }

  // Core
  float core = exp(-r * 15.0);
  col += vec3(1.0, 0.9, 0.7) * core;
  col += vec3(0.8, 0.6, 0.4) * exp(-r * 8.0) * 0.5;

  // Stars
  for (float i = 0.0; i < 150.0; i++) {
    float starAngle = hash(vec2(i, 0.0)) * 6.28318;
    float starR = hash(vec2(i, 1.0)) * 0.45;

    // Stars follow spiral pattern roughly
    float spiralOffset = starR * 8.0;
    starAngle += spiralOffset + t * 0.5;

    vec2 starPos = vec2(cos(starAngle), sin(starAngle)) * starR;

    // Rotate with galaxy
    starPos = vec2(starPos.x * cosR - starPos.y * sinR, starPos.x * sinR + starPos.y * cosR);

    float d = length(uv - starPos);
    float star = smoothstep(0.003, 0.0, d);
    float twinkle = sin(t * 10.0 + i * 3.0) * 0.3 + 0.7;

    vec3 starCol = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.8, 0.6), hash(vec2(i, 2.0)));
    col += starCol * star * twinkle;
  }

  // Background stars (not rotating)
  for (float i = 0.0; i < 50.0; i++) {
    vec2 bgStar = vec2(hash(vec2(i, 10.0)), hash(vec2(i, 11.0))) - 0.5;
    bgStar *= 1.5;
    float d = length(uv - bgStar);
    float star = smoothstep(0.002, 0.0, d) * 0.3;
    col += vec3(1.0) * star;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Galaxy', desc: 'Spiral galaxy simulation' });

register('interference', `
// XScreenSaver Interference - moiré pattern interference
void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
  vec3 col = vec3(0.0);
  float t = u_time * 0.5;

  // Multiple wave sources
  for (float i = 0.0; i < 3.0; i++) {
    // Moving source positions
    vec2 source = vec2(
      sin(t * (0.5 + i * 0.2) + i * 2.0) * 0.3,
      cos(t * (0.4 + i * 0.15) + i * 1.5) * 0.3
    );

    float d = length(uv - source);
    float wave = sin(d * 40.0 - t * 5.0);

    // Each source has different color
    vec3 waveCol;
    if (i == 0.0) waveCol = vec3(1.0, 0.2, 0.2);
    else if (i == 1.0) waveCol = vec3(0.2, 1.0, 0.2);
    else waveCol = vec3(0.2, 0.2, 1.0);

    col += waveCol * (wave * 0.5 + 0.5) * 0.5;
  }

  // Interference creates moiré patterns naturally from wave addition
  // Add some contrast
  col = smoothstep(0.2, 0.8, col);

  fragColor = vec4(col, 1.0);
}`, { name: 'Interference', desc: 'Moiré wave interference' });

// ============================================================================
// MICROSOFT PLUS! / WINDOWS EXTRAS
// ============================================================================

register('dangerousCreatures', `
// Microsoft Plus! Dangerous Creatures - nature slideshow style
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Cycle through different "creatures" (abstract representations)
  float scene = mod(floor(t * 0.2), 4.0);

  vec3 col = vec3(0.0);

  if (scene == 0.0) {
    // Spider web pattern
    vec2 center = vec2(0.5, 0.5);
    float angle = atan(uv.y - center.y, uv.x - center.x);
    float r = length(uv - center);

    // Radial threads
    float radial = smoothstep(0.02, 0.01, abs(sin(angle * 12.0)));
    radial *= smoothstep(0.5, 0.1, r);

    // Spiral threads
    float spiral = smoothstep(0.01, 0.005, abs(sin(r * 30.0 + angle * 2.0)));
    spiral *= smoothstep(0.5, 0.05, r);

    col = vec3(0.8, 0.8, 0.85) * (radial + spiral);

    // Spider
    float spider = smoothstep(0.03, 0.02, length(uv - center));
    col = mix(col, vec3(0.1), spider);

    // Background
    col = mix(vec3(0.1, 0.15, 0.1), col, max(radial, spiral) + spider);

  } else if (scene == 1.0) {
    // Snake pattern
    float snakeY = 0.5 + sin(uv.x * 10.0 + t * 2.0) * 0.1;
    float snake = smoothstep(0.04, 0.03, abs(uv.y - snakeY));

    // Scales
    vec2 scaleUv = vec2(uv.x * 20.0, (uv.y - snakeY) * 10.0);
    float scales = sin(scaleUv.x) * sin(scaleUv.y);

    vec3 snakeCol = mix(vec3(0.3, 0.5, 0.2), vec3(0.5, 0.3, 0.1), scales * 0.5 + 0.5);
    col = mix(vec3(0.1, 0.2, 0.1), snakeCol, snake);

    // Eye
    vec2 headPos = vec2(0.8 + sin(t * 2.0) * 0.02, snakeY);
    float eye = smoothstep(0.015, 0.01, length(uv - headPos));
    col = mix(col, vec3(0.8, 0.2, 0.1), eye);

  } else if (scene == 2.0) {
    // Scorpion silhouette
    col = vec3(0.9, 0.7, 0.4);  // Desert background

    vec2 bodyPos = vec2(0.5, 0.4);
    float body = smoothstep(0.08, 0.07, length((uv - bodyPos) * vec2(1.0, 2.0)));

    // Tail (curved)
    for (float i = 0.0; i < 6.0; i++) {
      float tailAngle = 0.5 + i * 0.15;
      vec2 tailSeg = bodyPos + vec2(sin(tailAngle) * 0.05 * i, 0.05 + i * 0.03);
      float seg = smoothstep(0.025, 0.02, length(uv - tailSeg));
      body = max(body, seg);
    }

    // Stinger
    vec2 stingerPos = bodyPos + vec2(0.1, 0.28);
    float stinger = smoothstep(0.015, 0.01, length(uv - stingerPos));
    body = max(body, stinger);

    // Claws
    for (float c = -1.0; c <= 1.0; c += 2.0) {
      vec2 clawPos = bodyPos + vec2(c * 0.1, -0.05);
      float claw = smoothstep(0.03, 0.025, length(uv - clawPos));
      body = max(body, claw);
    }

    col = mix(col, vec3(0.1), body);

  } else {
    // Shark fin
    col = mix(vec3(0.1, 0.2, 0.4), vec3(0.2, 0.4, 0.6), uv.y);  // Ocean

    // Waves
    float wave = sin(uv.x * 20.0 + t * 3.0) * 0.01;
    if (uv.y < 0.5 + wave) {
      col = mix(vec3(0.0, 0.1, 0.3), col, uv.y * 2.0);
    }

    // Fin
    float finX = fract(t * 0.1) * 1.2 - 0.1;
    vec2 finPos = vec2(finX, 0.5);
    vec2 toFin = uv - finPos;

    float fin = step(toFin.y, 0.1 - abs(toFin.x) * 2.0);
    fin *= step(0.0, toFin.y);
    fin *= step(abs(toFin.x), 0.05);

    col = mix(col, vec3(0.3, 0.35, 0.4), fin);
  }

  // Slide transition
  float transition = smoothstep(0.0, 0.1, fract(t * 0.2));
  transition *= smoothstep(1.0, 0.9, fract(t * 0.2));
  col *= transition;

  fragColor = vec4(col, 1.0);
}`, { name: 'Dangerous Creatures', desc: 'Plus! nature scenes' });

export default ass;
