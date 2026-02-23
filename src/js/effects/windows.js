/**
 * Windows Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

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
  for (int i = 0; i < 60; i++) {  // Reduced from 80 iterations
    vec3 p = ro + rd * t;
    vec3 q = mod(p + u_gridSpacing * 0.5, u_gridSpacing) - u_gridSpacing * 0.5;

    // Pipes along axes
    float dx = length(q.yz) - u_pipeThickness;
    float dy = length(q.xz) - u_pipeThickness;
    float dz = length(q.xy) - u_pipeThickness;

    // Ball joints
    float ball = length(q) - u_jointSize;

    float d = min(min(min(dx, dy), dz), ball);

    if (d < 0.005) {  // Larger threshold for faster convergence
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
    t += d;  // Full step size (was 0.9), safe due to SDF
    if (t > 25.0) break;  // Reduced max distance
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

register('curvescolors', `
// Windows 95 Curves and Colors - abstract bezier curves
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);

  float t = u_time * 0.4;

  // Multiple colored bezier curves
  for (float i = 0.0; i < 8.0; i++) {
    float offset = i * 0.785; // 45 degrees

    // Control points move in circular patterns
    vec2 p0 = vec2(
      0.5 + sin(t + offset) * 0.4,
      0.5 + cos(t * 0.7 + offset) * 0.4
    );
    vec2 p1 = vec2(
      0.5 + sin(t * 1.3 + offset + 1.0) * 0.3,
      0.5 + cos(t * 0.9 + offset + 1.5) * 0.3
    );
    vec2 p2 = vec2(
      0.5 + sin(t * 0.8 + offset + 2.5) * 0.4,
      0.5 + cos(t * 1.1 + offset + 3.0) * 0.4
    );

    // Draw bezier curve as series of points
    float minDist = 1.0;
    for (float j = 0.0; j < 20.0; j++) {
      float s = j / 19.0;
      // Quadratic bezier
      vec2 curvePoint = (1.0-s)*(1.0-s)*p0 + 2.0*(1.0-s)*s*p1 + s*s*p2;
      minDist = min(minDist, length(uv - curvePoint));
    }

    // Windows 95 bright colors
    vec3 curveCol;
    float hue = fract(i / 8.0 + t * 0.05);
    if (hue < 0.166) curveCol = vec3(1.0, 0.0, 0.0);      // Red
    else if (hue < 0.333) curveCol = vec3(1.0, 1.0, 0.0); // Yellow
    else if (hue < 0.5) curveCol = vec3(0.0, 1.0, 0.0);   // Green
    else if (hue < 0.666) curveCol = vec3(0.0, 1.0, 1.0); // Cyan
    else if (hue < 0.833) curveCol = vec3(0.0, 0.0, 1.0); // Blue
    else curveCol = vec3(1.0, 0.0, 1.0);                   // Magenta

    // Curve line with glow
    float curve = smoothstep(0.02, 0.005, minDist);
    col += curveCol * curve * 0.7;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Curves & Colors', desc: 'Windows 95 abstract curves' });

register('windowslogo', `
// Windows Vista animated flag logo
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = (uv - 0.5) * 2.0;

  float t = u_time * 0.5;
  vec3 col = vec3(0.0);

  // Dark gradient background (Vista style)
  col = mix(vec3(0.0, 0.02, 0.08), vec3(0.0, 0.05, 0.15), uv.y);

  // Windows logo position
  vec2 logoCenter = vec2(0.0, 0.0);
  vec2 logoUV = center - logoCenter;

  // Scale for the logo
  float scale = 0.6;
  logoUV /= scale;

  // Wave/flag animation
  float wave = sin(logoUV.x * 3.0 - t * 2.0) * 0.1 * (1.0 - abs(logoUV.x));
  logoUV.y -= wave;

  // Perspective tilt (Vista style)
  logoUV.y *= 1.0 + logoUV.x * 0.15;

  // Four quadrants of Windows logo
  float gap = 0.05;
  float quadSize = 0.35;

  // Top-left (red/orange)
  vec2 q1 = logoUV - vec2(-quadSize/2.0 - gap, quadSize/2.0 + gap);
  if (abs(q1.x) < quadSize/2.0 && abs(q1.y) < quadSize/2.0) {
    float edge = smoothstep(quadSize/2.0, quadSize/2.0 - 0.02, max(abs(q1.x), abs(q1.y)));
    col = mix(col, vec3(0.95, 0.35, 0.15), edge);
  }

  // Top-right (green)
  vec2 q2 = logoUV - vec2(quadSize/2.0 + gap, quadSize/2.0 + gap);
  if (abs(q2.x) < quadSize/2.0 && abs(q2.y) < quadSize/2.0) {
    float edge = smoothstep(quadSize/2.0, quadSize/2.0 - 0.02, max(abs(q2.x), abs(q2.y)));
    col = mix(col, vec3(0.45, 0.75, 0.15), edge);
  }

  // Bottom-left (blue)
  vec2 q3 = logoUV - vec2(-quadSize/2.0 - gap, -quadSize/2.0 - gap);
  if (abs(q3.x) < quadSize/2.0 && abs(q3.y) < quadSize/2.0) {
    float edge = smoothstep(quadSize/2.0, quadSize/2.0 - 0.02, max(abs(q3.x), abs(q3.y)));
    col = mix(col, vec3(0.15, 0.55, 0.9), edge);
  }

  // Bottom-right (yellow)
  vec2 q4 = logoUV - vec2(quadSize/2.0 + gap, -quadSize/2.0 - gap);
  if (abs(q4.x) < quadSize/2.0 && abs(q4.y) < quadSize/2.0) {
    float edge = smoothstep(quadSize/2.0, quadSize/2.0 - 0.02, max(abs(q4.x), abs(q4.y)));
    col = mix(col, vec3(0.95, 0.75, 0.15), edge);
  }

  // Glow effect
  float logoDist = length(logoUV);
  col += vec3(0.1, 0.2, 0.4) * exp(-logoDist * logoDist * 2.0) * 0.5;

  // Subtle light rays
  float angle = atan(center.y, center.x);
  float rays = sin(angle * 8.0 + t) * 0.5 + 0.5;
  col += vec3(0.05, 0.1, 0.2) * rays * exp(-length(center) * 2.0) * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'Windows Logo', desc: 'Vista animated flag' });

register('channels', `
// Windows 98 Channels - channel content display style
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.2;

  vec3 col = vec3(0.0);

  // Dark blue Windows background
  col = mix(vec3(0.0, 0.0, 0.2), vec3(0.0, 0.1, 0.3), uv.y);

  // Channel bars scrolling
  float numChannels = 6.0;
  float channelHeight = 0.12;
  float gap = 0.02;

  for (float i = 0.0; i < numChannels; i++) {
    // Channel position (scrolling)
    float channelY = fract((i + 0.5) / numChannels - t * 0.15) * (1.0 + channelHeight) - channelHeight * 0.5;

    // Channel bar bounds
    float inChannel = step(channelY - channelHeight * 0.5, uv.y);
    inChannel *= step(uv.y, channelY + channelHeight * 0.5);
    inChannel *= step(0.1, uv.x) * step(uv.x, 0.9);

    if (inChannel > 0.5) {
      // Channel background gradient
      float channelGrad = (uv.y - (channelY - channelHeight * 0.5)) / channelHeight;
      vec3 channelCol = mix(vec3(0.2, 0.3, 0.5), vec3(0.1, 0.15, 0.3), channelGrad);

      // Icon area (left side)
      float iconX = 0.15;
      if (uv.x < 0.25) {
        // Abstract icon
        float iconDist = length((uv - vec2(iconX, channelY)) * vec2(1.0, 1.5));
        float icon = smoothstep(0.04, 0.03, iconDist);

        vec3 iconCol = vec3(
          0.5 + 0.5 * sin(i * 2.0),
          0.5 + 0.5 * sin(i * 2.5 + 1.0),
          0.5 + 0.5 * sin(i * 3.0 + 2.0)
        );
        channelCol = mix(channelCol, iconCol, icon);
      }

      // Text area (middle) - horizontal lines representing text
      if (uv.x > 0.28 && uv.x < 0.75) {
        float textLine1 = smoothstep(0.004, 0.0, abs(uv.y - (channelY + 0.02)));
        textLine1 *= step(0.28, uv.x) * step(uv.x, 0.6 + hash(vec2(i, 0.0)) * 0.1);

        float textLine2 = smoothstep(0.003, 0.0, abs(uv.y - (channelY - 0.015)));
        textLine2 *= step(0.28, uv.x) * step(uv.x, 0.5 + hash(vec2(i, 1.0)) * 0.15);

        channelCol = mix(channelCol, vec3(0.9), textLine1 * 0.8);
        channelCol = mix(channelCol, vec3(0.7), textLine2 * 0.5);
      }

      // Arrow/button (right side)
      if (uv.x > 0.8) {
        vec2 arrowPos = vec2(0.85, channelY);
        vec2 toArrow = uv - arrowPos;

        // Simple arrow shape
        float arrow = step(abs(toArrow.y), 0.02 - abs(toArrow.x - 0.01) * 0.5);
        arrow *= step(0.0, toArrow.x) * step(toArrow.x, 0.03);

        channelCol = mix(channelCol, vec3(0.0, 0.5, 0.0), arrow);
      }

      // Border highlight/shadow
      float topEdge = smoothstep(channelHeight * 0.48, channelHeight * 0.5, uv.y - (channelY - channelHeight * 0.5));
      float botEdge = smoothstep(channelHeight * 0.48, channelHeight * 0.5, (channelY + channelHeight * 0.5) - uv.y);
      channelCol += vec3(0.2) * (1.0 - topEdge) * 0.5;
      channelCol -= vec3(0.1) * (1.0 - botEdge) * 0.5;

      col = channelCol;
    }
  }

  // Windows logo watermark
  vec2 logoPos = vec2(0.5, 0.5);
  float logo = smoothstep(0.2, 0.15, length(uv - logoPos));
  col += vec3(0.02, 0.04, 0.08) * logo;

  fragColor = vec4(col, 1.0);
}`, { name: 'Channels', desc: 'Windows 98 channels' });
