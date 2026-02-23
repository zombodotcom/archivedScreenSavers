/**
 * Misc Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

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

register('jazz', `
// Windows Plus! 98 Jazz - dancing musical notes
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float t = u_time;
  vec3 col = vec3(0.05, 0.0, 0.1); // Dark purple background

  // Musical staff lines
  for (float i = 0.0; i < 5.0; i++) {
    float lineY = 0.35 + i * 0.075;
    float line = smoothstep(0.002, 0.0, abs(uv.y - lineY));
    col += vec3(0.15, 0.1, 0.2) * line;
  }

  // Dancing musical notes
  for (float i = 0.0; i < 8.0; i++) {
    float seed = i * 13.7;

    // Note bounces and sways
    float noteX = fract(i / 8.0 + t * 0.1) * 1.2 - 0.1;
    float bounce = abs(sin(t * 3.0 + seed)) * 0.15;
    float noteY = 0.4 + sin(noteX * 6.28 + seed) * 0.1 + bounce;

    // Note rotation (dancing)
    float noteRot = sin(t * 4.0 + seed) * 0.3;

    vec2 notePos = vec2(noteX, noteY);
    vec2 toNote = (uv - notePos);
    toNote.x *= aspect;

    // Rotate
    float c = cos(noteRot), s = sin(noteRot);
    toNote = vec2(c * toNote.x - s * toNote.y, s * toNote.x + c * toNote.y);

    // Draw note head (oval)
    float headSize = 0.025;
    vec2 headPos = toNote * vec2(1.0, 1.5);
    float head = smoothstep(headSize, headSize - 0.005, length(headPos));

    // Draw stem
    float stem = smoothstep(0.004, 0.0, abs(toNote.x - headSize * 0.7));
    stem *= step(0.0, toNote.y) * step(toNote.y, 0.08);

    // Draw flag
    float flag = 0.0;
    if (toNote.y > 0.05 && toNote.y < 0.08) {
      float flagX = toNote.x - headSize * 0.7;
      flag = smoothstep(0.0, 0.03, flagX) * smoothstep(0.04, 0.02, flagX);
    }

    float note = max(head, max(stem, flag));

    // Note colors (jazz colors)
    vec3 noteCol;
    float hue = fract(i / 8.0 + t * 0.05);
    if (hue < 0.2) noteCol = vec3(1.0, 0.3, 0.5);       // Pink
    else if (hue < 0.4) noteCol = vec3(0.3, 0.7, 1.0); // Blue
    else if (hue < 0.6) noteCol = vec3(1.0, 0.8, 0.2); // Gold
    else if (hue < 0.8) noteCol = vec3(0.5, 1.0, 0.5); // Green
    else noteCol = vec3(0.8, 0.4, 1.0);                 // Purple

    col += noteCol * note;
  }

  // Sparkles
  for (float i = 0.0; i < 20.0; i++) {
    vec2 sparkPos = vec2(
      fract(hash(vec2(i, 0.0)) + t * 0.15),
      hash(vec2(i, 1.0))
    );
    float sparkle = smoothstep(0.01, 0.0, length(uv - sparkPos));
    sparkle *= sin(t * 10.0 + i * 5.0) * 0.5 + 0.5;
    col += vec3(1.0, 0.9, 0.5) * sparkle;
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Jazz', desc: 'Plus! 98 dancing notes' });

register('organicart', `
// Windows Plus! 98 Organic Art - biological patterns
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  float t = u_time * 0.15;
  vec3 col = vec3(0.0);

  // Organic blob using metaballs
  float field = 0.0;

  for (float i = 0.0; i < 6.0; i++) {
    float phase = i * 1.047;

    // Organic movement
    vec2 blobPos = vec2(
      sin(t + phase) * 0.25 + sin(t * 1.7 + phase * 2.0) * 0.1,
      cos(t * 0.8 + phase) * 0.25 + cos(t * 1.3 + phase * 1.5) * 0.1
    );

    float d = length(center - blobPos);
    float size = 0.1 + 0.05 * sin(t + i);

    // Metaball contribution
    field += size / (d + 0.01);
  }

  // Threshold for organic boundary
  float organic = smoothstep(2.0, 2.5, field);

  // Inner patterns (cell-like)
  float cells = 0.0;
  for (float i = 0.0; i < 20.0; i++) {
    vec2 cellCenter = vec2(
      hash(vec2(i, 0.0)) - 0.5,
      hash(vec2(i, 1.0)) - 0.5
    );
    cellCenter += vec2(sin(t + i), cos(t * 0.7 + i)) * 0.1;

    float cellDist = length(center - cellCenter);
    cells = max(cells, smoothstep(0.08, 0.06, cellDist));
  }

  // Color gradient based on position
  vec3 organicCol = mix(
    vec3(0.2, 0.6, 0.3),  // Green
    vec3(0.8, 0.5, 0.2),  // Orange
    sin(atan(center.y, center.x) + t) * 0.5 + 0.5
  );

  // Add purple tones
  organicCol = mix(organicCol, vec3(0.5, 0.2, 0.6), field * 0.1);

  // Cell membrane effect
  float membrane = smoothstep(2.3, 2.5, field) - smoothstep(2.5, 2.7, field);

  col = organicCol * organic;
  col += vec3(0.9, 0.95, 0.8) * membrane * 0.5;
  col += vec3(0.3, 0.4, 0.2) * cells * organic * 0.3;

  // Background gradient
  vec3 bg = mix(vec3(0.0, 0.05, 0.1), vec3(0.05, 0.0, 0.1), uv.y);
  col = mix(bg, col, organic);

  fragColor = vec4(col, 1.0);
}`, { name: 'Organic Art', desc: 'Plus! 98 biological' });

register('baseball', `
// Windows Plus! 98 Baseball - animated baseball scene
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  vec3 col = vec3(0.0);

  // Sky gradient
  col = mix(vec3(0.3, 0.5, 0.8), vec3(0.6, 0.8, 1.0), uv.y);

  // Sun
  vec2 sunPos = vec2(0.8, 0.85);
  float sun = smoothstep(0.1, 0.08, length(uv - sunPos));
  col = mix(col, vec3(1.0, 0.95, 0.7), sun);

  // Field (green grass)
  if (uv.y < 0.4) {
    col = mix(vec3(0.15, 0.4, 0.1), vec3(0.2, 0.5, 0.15), uv.y / 0.4);

    // Grass stripes
    float stripe = sin(uv.x * 40.0) * 0.5 + 0.5;
    col *= 0.95 + stripe * 0.1;
  }

  // Diamond/infield dirt
  vec2 diamondCenter = vec2(0.5, 0.25);
  vec2 toDiamond = uv - diamondCenter;
  float diamond = abs(toDiamond.x) + abs(toDiamond.y * 1.5);
  if (diamond < 0.15) {
    col = mix(vec3(0.6, 0.45, 0.3), col, smoothstep(0.1, 0.15, diamond));
  }

  // Bases
  vec2 bases[4];
  bases[0] = diamondCenter + vec2(0.0, -0.08);   // Home plate
  bases[1] = diamondCenter + vec2(0.08, 0.0);   // 1st base
  bases[2] = diamondCenter + vec2(0.0, 0.08);   // 2nd base
  bases[3] = diamondCenter + vec2(-0.08, 0.0);  // 3rd base

  for (int i = 0; i < 4; i++) {
    float base = smoothstep(0.015, 0.01, length(uv - bases[i]));
    col = mix(col, vec3(1.0), base);
  }

  // Flying baseball
  float ballTime = fract(t * 0.3);
  vec2 ballStart = vec2(0.5, 0.15);
  vec2 ballPeak = vec2(0.5 + sin(t * 0.5) * 0.2, 0.7);
  vec2 ballEnd = vec2(0.8, 0.3);

  // Parabolic arc
  vec2 ballPos;
  if (ballTime < 0.5) {
    float s = ballTime * 2.0;
    ballPos = mix(mix(ballStart, ballPeak, s), mix(ballPeak, ballEnd, s), s);
  } else {
    float s = (ballTime - 0.5) * 2.0;
    ballPos = mix(ballEnd, ballStart, s);
    ballPos.y += sin(s * 3.14159) * 0.1; // Return arc
  }

  // Draw baseball
  float ball = smoothstep(0.025, 0.02, length(uv - ballPos));
  col = mix(col, vec3(1.0, 0.98, 0.95), ball);

  // Baseball stitching
  vec2 toBall = (uv - ballPos) * 30.0;
  float stitch = sin(toBall.x * 3.0 + toBall.y * 2.0);
  stitch = smoothstep(0.8, 0.9, abs(stitch)) * ball;
  col = mix(col, vec3(0.8, 0.2, 0.1), stitch * 0.5);

  // Motion blur trail
  for (float i = 1.0; i < 4.0; i++) {
    float trailTime = ballTime - i * 0.02;
    if (trailTime > 0.0) {
      vec2 trailPos;
      if (trailTime < 0.5) {
        float s = trailTime * 2.0;
        trailPos = mix(mix(ballStart, ballPeak, s), mix(ballPeak, ballEnd, s), s);
      } else {
        float s = (trailTime - 0.5) * 2.0;
        trailPos = mix(ballEnd, ballStart, s);
        trailPos.y += sin(s * 3.14159) * 0.1;
      }
      float trail = smoothstep(0.02, 0.015, length(uv - trailPos));
      col = mix(col, vec3(1.0), trail * (1.0 - i / 4.0) * 0.3);
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Baseball', desc: 'Plus! 98 baseball scene' });

register('garfield', `
// Windows Plus! 98 Garfield - comic style animation
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float t = u_time;
  vec3 col = vec3(0.0);

  // Light blue sky background
  col = mix(vec3(0.6, 0.8, 1.0), vec3(0.4, 0.6, 0.9), uv.y);

  // Clouds
  for (float i = 0.0; i < 3.0; i++) {
    float cloudX = fract(i * 0.33 + t * 0.02) * 1.4 - 0.2;
    float cloudY = 0.75 + i * 0.08;

    float cloud = 0.0;
    for (float j = 0.0; j < 3.0; j++) {
      vec2 puffPos = vec2(cloudX + j * 0.05, cloudY + sin(j) * 0.02);
      cloud = max(cloud, smoothstep(0.06, 0.04, length(uv - puffPos)));
    }
    col = mix(col, vec3(1.0), cloud);
  }

  // Ground (green grass)
  if (uv.y < 0.25) {
    col = vec3(0.3, 0.6, 0.2);
    // Grass texture
    float grass = sin(uv.x * 100.0) * sin(uv.x * 73.0 + 1.0) * 0.1;
    col.g += grass * step(uv.y, 0.28);
  }

  // Garfield-style orange cat (simplified/abstract)
  float catBounce = abs(sin(t * 2.0)) * 0.05;

  // Body (orange oval)
  vec2 bodyPos = vec2(0.5, 0.35 + catBounce);
  vec2 toBody = (uv - bodyPos) * vec2(aspect, 1.0);
  float body = smoothstep(0.15, 0.12, length(toBody * vec2(1.0, 1.5)));

  // Head
  vec2 headPos = vec2(0.58, 0.42 + catBounce);
  vec2 toHead = (uv - headPos) * vec2(aspect, 1.0);
  float head = smoothstep(0.1, 0.08, length(toHead));

  // Combine body parts
  float cat = max(body, head);

  // Orange fur color
  vec3 furCol = vec3(0.95, 0.55, 0.1);

  // Stripes
  float stripes = sin(toBody.x * 30.0 + toBody.y * 5.0) * 0.5 + 0.5;
  stripes = smoothstep(0.4, 0.6, stripes);
  furCol = mix(furCol, vec3(0.7, 0.35, 0.05), stripes * 0.3 * body);

  col = mix(col, furCol, cat);

  // Eyes (half-closed, sleepy Garfield style)
  for (float eye = -1.0; eye <= 1.0; eye += 2.0) {
    vec2 eyePos = headPos + vec2(eye * 0.025, 0.015);
    vec2 toEye = (uv - eyePos) * vec2(aspect, 1.0);

    // White of eye
    float eyeWhite = smoothstep(0.025, 0.02, length(toEye * vec2(1.0, 0.7)));

    // Eyelid (half closed)
    float lidClosed = smoothstep(0.0, 0.01, toEye.y);
    eyeWhite *= lidClosed;

    col = mix(col, vec3(1.0), eyeWhite * cat);

    // Pupil
    float pupil = smoothstep(0.012, 0.008, length(toEye * vec2(1.0, 0.7)));
    pupil *= lidClosed;
    col = mix(col, vec3(0.0), pupil * cat);
  }

  // Nose (pink triangle)
  vec2 nosePos = headPos + vec2(0.0, -0.01);
  vec2 toNose = (uv - nosePos) * vec2(aspect, 1.0);
  float nose = step(abs(toNose.x), 0.015 - toNose.y * 0.5);
  nose *= step(-0.015, toNose.y) * step(toNose.y, 0.01);
  col = mix(col, vec3(0.9, 0.5, 0.5), nose * cat);

  // Smile
  float smileY = headPos.y - 0.035;
  vec2 toSmile = uv - vec2(headPos.x, smileY);
  toSmile.x *= aspect;
  float smile = smoothstep(0.004, 0.0, abs(length(toSmile) - 0.025));
  smile *= step(toSmile.y, 0.0);
  col = mix(col, vec3(0.2), smile * cat);

  // Tail (wagging)
  float tailWag = sin(t * 4.0) * 0.1;
  vec2 tailBase = vec2(0.38, 0.32 + catBounce);
  for (float seg = 0.0; seg < 5.0; seg++) {
    vec2 tailPos = tailBase + vec2(-seg * 0.025 + sin(seg * 0.5 + tailWag) * 0.02, seg * 0.015);
    vec2 toTail = (uv - tailPos) * vec2(aspect, 1.0);
    float tail = smoothstep(0.02, 0.015, length(toTail));
    col = mix(col, furCol, tail);
  }

  // Legs
  for (float leg = -1.0; leg <= 1.0; leg += 2.0) {
    vec2 legPos = vec2(0.5 + leg * 0.08, 0.25);
    vec2 toLeg = (uv - legPos) * vec2(aspect, 1.0);
    float legShape = smoothstep(0.025, 0.02, abs(toLeg.x));
    legShape *= step(0.0, toLeg.y) * step(toLeg.y, 0.1 + catBounce);
    col = mix(col, furCol, legShape);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Garfield', desc: 'Plus! 98 comic cat' });
