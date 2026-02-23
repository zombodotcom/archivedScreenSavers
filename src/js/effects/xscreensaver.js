/**
 * Xscreensaver Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

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
