/**
 * Macos Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

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

register('abstract', `
// Mac OS X Abstract screensaver - flowing organic color blobs
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  float t = u_time * 0.3;
  vec3 col = vec3(0.0);

  // Multiple flowing color blobs
  for (float i = 0.0; i < 6.0; i++) {
    float phase = i * 1.047; // 60 degrees apart

    // Blob center moves in smooth Lissajous pattern
    vec2 blobCenter = vec2(
      sin(t + phase) * 0.3 + sin(t * 0.7 + phase * 2.0) * 0.2,
      cos(t * 0.8 + phase) * 0.3 + cos(t * 0.6 + phase * 1.5) * 0.2
    );

    float d = length(center - blobCenter);

    // Soft blob falloff
    float blob = exp(-d * d * 8.0);

    // Each blob has a different hue that shifts over time
    float hue = fract(i / 6.0 + t * 0.05);
    vec3 blobCol = vec3(
      0.5 + 0.5 * sin(hue * 6.28),
      0.5 + 0.5 * sin(hue * 6.28 + 2.09),
      0.5 + 0.5 * sin(hue * 6.28 + 4.18)
    );

    // Saturated, rich colors like Mac OS X
    blobCol = pow(blobCol, vec3(0.7));

    col += blobCol * blob * 0.6;
  }

  // Add subtle glow and color blending
  col = 1.0 - exp(-col * 1.5);

  // Smooth color transitions
  col = smoothstep(0.0, 1.0, col);

  fragColor = vec4(col, 1.0);
}`, { name: 'Abstract', desc: 'Mac OS X flowing colors' });

register('cosmos', `
// Mac OS X Cosmos - space imagery with nebulae and stars
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  float t = u_time * 0.1;
  vec3 col = vec3(0.0);

  // Deep space background gradient
  col = mix(vec3(0.0, 0.0, 0.05), vec3(0.05, 0.0, 0.1), uv.y);

  // Nebula clouds using layered noise
  for (float layer = 0.0; layer < 3.0; layer++) {
    float scale = 3.0 + layer * 2.0;
    vec2 nebUV = center * scale + vec2(t * (0.1 + layer * 0.05), t * 0.08);

    float neb = 0.0;
    float amp = 0.5;
    for (float oct = 0.0; oct < 4.0; oct++) {
      vec2 p = nebUV * pow(2.0, oct);
      neb += (sin(p.x + sin(p.y * 2.0)) * cos(p.y + cos(p.x * 1.5)) * 0.5 + 0.5) * amp;
      amp *= 0.5;
    }

    // Color each layer differently (like real nebulae)
    vec3 nebCol;
    if (layer < 1.0) nebCol = vec3(0.4, 0.1, 0.5);      // Purple
    else if (layer < 2.0) nebCol = vec3(0.1, 0.3, 0.5); // Blue
    else nebCol = vec3(0.5, 0.2, 0.3);                   // Pink/red

    col += nebCol * neb * 0.3;
  }

  // Stars - multiple layers for depth
  for (float layer = 0.0; layer < 3.0; layer++) {
    for (float i = 0.0; i < 50.0; i++) {
      vec2 starPos = vec2(
        fract(hash(vec2(i + layer * 100.0, 0.0)) + t * 0.02 * (layer + 1.0)),
        hash(vec2(i + layer * 100.0, 1.0))
      );

      float d = length(uv - starPos);
      float size = hash(vec2(i + layer * 100.0, 2.0)) * 0.003 + 0.001;
      float twinkle = sin(t * 5.0 + i * 10.0) * 0.3 + 0.7;

      // Star with glow
      float star = smoothstep(size, 0.0, d) * twinkle;

      // Some stars are colored
      vec3 starCol = vec3(1.0);
      if (hash(vec2(i, 3.0)) > 0.7) {
        starCol = mix(vec3(1.0, 0.8, 0.6), vec3(0.6, 0.8, 1.0), hash(vec2(i, 4.0)));
      }

      col += starCol * star * (1.0 - layer * 0.2);
    }
  }

  // Occasional shooting star
  float shootTime = fract(t * 0.3);
  if (shootTime < 0.1) {
    vec2 shootStart = vec2(hash(vec2(floor(t * 0.3), 0.0)), 0.8 + hash(vec2(floor(t * 0.3), 1.0)) * 0.15);
    vec2 shootEnd = shootStart + vec2(0.3, -0.2);
    vec2 shootPos = mix(shootStart, shootEnd, shootTime * 10.0);

    float shootDist = length(uv - shootPos);
    col += vec3(1.0) * smoothstep(0.01, 0.0, shootDist) * (1.0 - shootTime * 10.0);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Cosmos', desc: 'Mac OS X space imagery' });

register('kenburns', `
// Mac OS X Ken Burns effect - slow pan and zoom on abstract art
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  float t = u_time * 0.1;

  // Each "photo" is shown for about 10 seconds
  float photoIndex = floor(t);
  float photoProgress = fract(t);

  // Ken Burns: slow zoom and pan
  float startZoom = 1.0 + hash(vec2(photoIndex, 0.0)) * 0.3;
  float endZoom = 1.2 + hash(vec2(photoIndex, 1.0)) * 0.3;
  float zoom = mix(startZoom, endZoom, photoProgress);

  vec2 startPan = (vec2(hash(vec2(photoIndex, 2.0)), hash(vec2(photoIndex, 3.0))) - 0.5) * 0.3;
  vec2 endPan = (vec2(hash(vec2(photoIndex, 4.0)), hash(vec2(photoIndex, 5.0))) - 0.5) * 0.3;
  vec2 pan = mix(startPan, endPan, photoProgress);

  // Apply Ken Burns transform
  vec2 transformedUV = (uv - 0.5) / zoom + 0.5 + pan;

  // Generate abstract "landscape" or "photo" for each index
  vec3 col = vec3(0.0);

  float photoType = hash(vec2(photoIndex, 10.0));

  if (photoType < 0.33) {
    // Sunset/landscape style
    float sky = smoothstep(0.3, 0.7, transformedUV.y);
    vec3 skyCol = mix(vec3(0.9, 0.4, 0.2), vec3(0.3, 0.1, 0.4), sky);

    // Sun
    vec2 sunPos = vec2(0.3 + hash(vec2(photoIndex, 11.0)) * 0.4, 0.5);
    float sun = smoothstep(0.15, 0.1, length(transformedUV - sunPos));
    skyCol = mix(skyCol, vec3(1.0, 0.9, 0.5), sun);

    // Mountains silhouette
    float mountain = 0.3 + sin(transformedUV.x * 5.0 + photoIndex) * 0.1 + sin(transformedUV.x * 12.0) * 0.05;
    if (transformedUV.y < mountain) {
      skyCol = vec3(0.05, 0.05, 0.1);
    }

    col = skyCol;

  } else if (photoType < 0.66) {
    // Ocean/beach style
    float horizon = 0.45;
    if (transformedUV.y > horizon) {
      // Sky gradient
      col = mix(vec3(0.6, 0.8, 1.0), vec3(0.3, 0.5, 0.9), (transformedUV.y - horizon) * 2.0);
    } else {
      // Water
      float wave = sin(transformedUV.x * 30.0 + u_time) * 0.01;
      col = mix(vec3(0.1, 0.3, 0.5), vec3(0.2, 0.5, 0.7), transformedUV.y / horizon + wave);
    }

  } else {
    // Forest/nature style
    col = mix(vec3(0.1, 0.3, 0.1), vec3(0.2, 0.5, 0.2), transformedUV.y);

    // Trees
    for (float i = 0.0; i < 5.0; i++) {
      float treeX = hash(vec2(photoIndex, 20.0 + i)) * 0.8 + 0.1;
      float treeHeight = 0.3 + hash(vec2(photoIndex, 30.0 + i)) * 0.3;
      float treeWidth = 0.05 + hash(vec2(photoIndex, 40.0 + i)) * 0.05;

      float treeDist = abs(transformedUV.x - treeX);
      float treeShape = smoothstep(treeWidth, 0.0, treeDist) * step(transformedUV.y, treeHeight);
      col = mix(col, vec3(0.05, 0.15, 0.05), treeShape);
    }
  }

  // Fade transitions between photos
  float fadeIn = smoothstep(0.0, 0.1, photoProgress);
  float fadeOut = smoothstep(1.0, 0.9, photoProgress);
  col *= fadeIn * fadeOut;

  // Vignette
  float vignette = 1.0 - length((uv - 0.5) * 1.2);
  col *= smoothstep(0.0, 0.5, vignette);

  fragColor = vec4(col, 1.0);
}`, { name: 'Ken Burns', desc: 'Mac slow pan and zoom' });

register('floating', `
// Mac OS X Floating - objects drifting peacefully
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 center = (uv - 0.5) * vec2(aspect, 1.0);

  float t = u_time * 0.2;
  vec3 col = vec3(0.02, 0.03, 0.08); // Dark blue background

  // Floating shapes
  for (float i = 0.0; i < 12.0; i++) {
    float seed = i * 17.3;

    // Slow, peaceful movement
    vec2 pos = vec2(
      sin(t * 0.3 + seed) * 0.6 + sin(t * 0.17 + seed * 2.0) * 0.3,
      sin(t * 0.23 + seed * 0.7) * 0.4 + cos(t * 0.13 + seed) * 0.2
    );

    // Slow rotation
    float rot = t * 0.1 + seed;

    vec2 toShape = center - pos;
    float c = cos(rot), s = sin(rot);
    toShape = vec2(c * toShape.x - s * toShape.y, s * toShape.x + c * toShape.y);

    // Different shapes
    float shape = 0.0;
    float shapeType = fract(seed * 0.17);

    if (shapeType < 0.33) {
      // Rounded square
      vec2 q = abs(toShape) - vec2(0.08);
      shape = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.02;
    } else if (shapeType < 0.66) {
      // Circle
      shape = length(toShape) - 0.07;
    } else {
      // Triangle
      vec2 p = toShape * 10.0;
      float k = sqrt(3.0);
      p.x = abs(p.x) - 0.8;
      p.y = p.y + 0.8/k;
      if(p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0;
      p.x -= clamp(p.x, -1.6, 0.0);
      shape = -length(p) * sign(p.y) / 10.0 + 0.02;
    }

    // Soft edges
    float alpha = smoothstep(0.02, -0.02, shape);

    // Color based on index
    vec3 shapeCol = vec3(
      0.4 + 0.4 * sin(seed),
      0.4 + 0.4 * sin(seed + 2.0),
      0.4 + 0.4 * sin(seed + 4.0)
    );

    // Depth fade
    float depth = 0.5 + 0.5 * sin(seed * 3.0);
    alpha *= depth;

    col = mix(col, shapeCol, alpha * 0.7);
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Floating', desc: 'Mac drifting shapes' });

register('mosaic', `
// Mac OS X Mosaic - tile arrangement animation
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.3;

  vec3 col = vec3(0.0);

  // Grid of tiles
  float gridSize = 8.0;
  vec2 tileCoord = floor(uv * gridSize);
  vec2 tileUV = fract(uv * gridSize);

  // Each tile has unique animation timing
  float tileId = tileCoord.x + tileCoord.y * gridSize;
  float tilePhase = hash(vec2(tileId, 0.0)) * 6.28;

  // Tile flip animation
  float flipTime = fract(t * 0.2 + tilePhase);
  float flipAngle = flipTime < 0.5 ? flipTime * 2.0 * 3.14159 : 0.0;

  // Color cycles between two states
  float colorState = floor(t * 0.2 + tilePhase);
  vec3 color1 = vec3(
    0.3 + 0.7 * hash(vec2(tileId + colorState, 1.0)),
    0.3 + 0.7 * hash(vec2(tileId + colorState, 2.0)),
    0.3 + 0.7 * hash(vec2(tileId + colorState, 3.0))
  );
  vec3 color2 = vec3(
    0.3 + 0.7 * hash(vec2(tileId + colorState + 1.0, 1.0)),
    0.3 + 0.7 * hash(vec2(tileId + colorState + 1.0, 2.0)),
    0.3 + 0.7 * hash(vec2(tileId + colorState + 1.0, 3.0))
  );

  // 3D flip effect
  vec2 centered = tileUV - 0.5;
  float flip = cos(flipAngle);
  centered.x *= abs(flip);

  // Show front or back based on flip
  vec3 tileCol = flip > 0.0 ? color1 : color2;

  // Tile border
  float border = smoothstep(0.48, 0.45, max(abs(centered.x), abs(centered.y)));

  // 3D shading
  float shade = 0.8 + 0.2 * flip;

  col = tileCol * border * shade;

  // Gap between tiles
  float gap = smoothstep(0.02, 0.05, min(tileUV.x, tileUV.y));
  gap *= smoothstep(0.02, 0.05, min(1.0 - tileUV.x, 1.0 - tileUV.y));

  col *= gap;

  fragColor = vec4(col, 1.0);
}`, { name: 'Mosaic', desc: 'Mac tile animation' });

register('albumart', `
// Mac OS X Album Artwork - grid of album covers
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.1;

  // Slow scrolling grid
  vec2 scrollUV = uv + vec2(t * 0.05, sin(t * 0.1) * 0.02);

  // Grid of albums
  float gridSize = 4.0;
  vec2 albumCoord = floor(scrollUV * gridSize);
  vec2 albumUV = fract(scrollUV * gridSize);

  // Each album has unique "artwork" based on its ID
  float albumId = albumCoord.x + albumCoord.y * 100.0;

  // Generate abstract album art
  vec3 col = vec3(0.0);

  // Base color for this album
  vec3 baseCol = vec3(
    hash(vec2(albumId, 0.0)),
    hash(vec2(albumId, 1.0)),
    hash(vec2(albumId, 2.0))
  );

  // Saturate the color
  baseCol = normalize(baseCol + 0.1) * 0.8;

  // Album art pattern based on ID
  float pattern = hash(vec2(albumId, 3.0));

  if (pattern < 0.25) {
    // Gradient style
    col = mix(baseCol, baseCol.bgr, albumUV.x);
  } else if (pattern < 0.5) {
    // Circle/face style
    float circle = smoothstep(0.35, 0.3, length(albumUV - 0.5));
    col = mix(baseCol.brg, baseCol, circle);
  } else if (pattern < 0.75) {
    // Stripes
    float stripe = step(0.5, fract(albumUV.x * 4.0));
    col = mix(baseCol, baseCol.gbr, stripe);
  } else {
    // Split design
    float split = step(0.5, albumUV.y);
    col = mix(baseCol, vec3(0.1), split);
  }

  // Album border/case
  float border = smoothstep(0.02, 0.05, min(albumUV.x, albumUV.y));
  border *= smoothstep(0.02, 0.05, min(1.0 - albumUV.x, 1.0 - albumUV.y));

  // Subtle reflection/gloss
  float gloss = smoothstep(0.7, 0.5, albumUV.y) * 0.1;
  col += gloss;

  col *= border;

  // Gap between albums
  float gap = smoothstep(0.0, 0.02, min(albumUV.x, albumUV.y));
  gap *= smoothstep(0.0, 0.02, min(1.0 - albumUV.x, 1.0 - albumUV.y));
  col = mix(vec3(0.02), col, gap);

  // Slight perspective/depth effect - albums appear to recede
  float depth = 1.0 - length(uv - 0.5) * 0.3;
  col *= depth;

  fragColor = vec4(col, 1.0);
}`, { name: 'Album Artwork', desc: 'Mac album grid' });

register('reflections', `
// Mac OS X Reflections - objects with mirror reflections
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 center = (uv - 0.5) * vec2(aspect, 1.0);

  float t = u_time * 0.3;
  vec3 col = vec3(0.0);

  // Gradient background - dark top to lighter bottom
  col = mix(vec3(0.02, 0.02, 0.05), vec3(0.1, 0.1, 0.15), uv.y);

  // Reflective surface line
  float surfaceY = 0.3;
  float surfaceLine = smoothstep(0.005, 0.0, abs(uv.y - surfaceY));
  col += vec3(0.3, 0.35, 0.4) * surfaceLine * 0.5;

  // Floating objects
  for (float i = 0.0; i < 5.0; i++) {
    float seed = i * 23.7;

    // Object position (above reflection surface)
    vec2 objPos = vec2(
      sin(t * 0.4 + seed) * 0.3,
      0.5 + sin(t * 0.3 + seed * 0.7) * 0.15
    );

    // Object type based on index
    float objType = fract(seed * 0.17);
    float radius = 0.08 + 0.03 * sin(seed);

    // Draw object
    vec2 toObj = center - objPos;
    float obj = 0.0;

    if (objType < 0.5) {
      // Sphere
      obj = smoothstep(radius, radius - 0.02, length(toObj));
    } else {
      // Cube (approximate)
      vec2 q = abs(toObj) - vec2(radius * 0.7);
      float cube = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
      obj = smoothstep(0.02, 0.0, cube);
    }

    // Object color
    vec3 objCol = vec3(
      0.4 + 0.6 * sin(seed),
      0.4 + 0.6 * sin(seed + 2.0),
      0.4 + 0.6 * sin(seed + 4.0)
    );

    // 3D shading
    float shade = 0.7 + 0.3 * dot(normalize(toObj + vec2(0.0, 0.1)), vec2(0.5, 0.5));
    col = mix(col, objCol * shade, obj);

    // Draw reflection (below surface, mirrored)
    vec2 reflPos = vec2(objPos.x, surfaceY - (objPos.y - surfaceY));
    vec2 toRefl = center - reflPos;

    float refl = 0.0;
    if (objType < 0.5) {
      refl = smoothstep(radius, radius - 0.02, length(toRefl));
    } else {
      vec2 q = abs(toRefl) - vec2(radius * 0.7);
      float cube = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
      refl = smoothstep(0.02, 0.0, cube);
    }

    // Reflection fades based on distance from surface
    float reflFade = smoothstep(0.0, 0.3, surfaceY - center.y);
    reflFade *= 0.4; // Reflections are dimmer

    col = mix(col, objCol * shade * 0.5, refl * reflFade * step(center.y, surfaceY));
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Reflections', desc: 'Mac mirror effect' });

register('wordofday', `
// Mac OS X Word of the Day - dictionary display
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.1;

  // Warm parchment background
  vec3 col = mix(vec3(0.95, 0.92, 0.85), vec3(0.9, 0.85, 0.75), uv.y);

  // Subtle texture
  float noise = hash(uv * 100.0 + floor(t)) * 0.03;
  col -= noise;

  // Vignette
  float vignette = 1.0 - length((uv - 0.5) * 1.3) * 0.3;
  col *= vignette;

  // Word display changes slowly
  float wordIndex = floor(t);

  // Decorative line
  float lineY = 0.65;
  float decorLine = smoothstep(0.002, 0.0, abs(uv.y - lineY));
  decorLine *= smoothstep(0.1, 0.2, uv.x) * smoothstep(0.1, 0.2, 1.0 - uv.x);
  col = mix(col, vec3(0.4, 0.3, 0.2), decorLine * 0.5);

  // "Word:" label area (top)
  float labelY = 0.75;
  if (uv.y > 0.7 && uv.y < 0.8) {
    // Stylized word representation (since we can't render real text)
    for (float i = 0.0; i < 8.0; i++) {
      float letterX = 0.3 + i * 0.05;
      float letterHeight = 0.04 + hash(vec2(wordIndex, i)) * 0.02;
      vec2 letterPos = vec2(letterX, labelY);

      float letter = smoothstep(0.02, 0.015, abs(uv.x - letterX));
      letter *= smoothstep(letterHeight, 0.0, abs(uv.y - labelY));
      col = mix(col, vec3(0.1, 0.08, 0.05), letter * 0.8);
    }
  }

  // "Definition:" area (middle)
  for (float line = 0.0; line < 3.0; line++) {
    float defY = 0.5 - line * 0.08;

    // Text line representation
    float lineWidth = 0.5 + hash(vec2(wordIndex, line + 10.0)) * 0.2;
    float lineStart = 0.2;

    if (uv.y > defY - 0.015 && uv.y < defY + 0.015) {
      float textLine = step(lineStart, uv.x) * step(uv.x, lineStart + lineWidth);
      // Individual word blocks
      float words = step(0.5, fract(uv.x * 15.0 + hash(vec2(line, 0.0))));
      col = mix(col, vec3(0.25, 0.2, 0.15), textLine * 0.6 * words);
    }
  }

  // Pronunciation guide (smaller text)
  float pronY = 0.58;
  if (uv.y > pronY - 0.01 && uv.y < pronY + 0.01) {
    float pronText = smoothstep(0.25, 0.3, uv.x) * smoothstep(0.5, 0.45, uv.x);
    col = mix(col, vec3(0.4, 0.35, 0.3), pronText * 0.4);
  }

  // Page number at bottom
  float pageY = 0.1;
  float pageNum = smoothstep(0.01, 0.0, abs(uv.y - pageY)) * smoothstep(0.47, 0.5, uv.x) * smoothstep(0.53, 0.5, uv.x);
  col = mix(col, vec3(0.3), pageNum * 0.3);

  // Fade transition between words
  float fade = smoothstep(0.0, 0.1, fract(t)) * smoothstep(1.0, 0.9, fract(t));
  col = mix(vec3(0.9, 0.85, 0.75), col, fade);

  fragColor = vec4(col, 1.0);
}`, { name: 'Word of the Day', desc: 'Mac dictionary display' });

register('rssvisualizer', `
// Mac OS X Tiger RSS Visualizer - 3D floating headlines
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  float t = u_time * 0.2;
  vec3 col = vec3(0.0);

  // Deep space background with subtle nebula
  col = mix(vec3(0.0, 0.01, 0.03), vec3(0.02, 0.0, 0.04), uv.y);

  // Nebula clouds
  for (float layer = 0.0; layer < 2.0; layer++) {
    vec2 nebUV = center * (2.0 + layer) + vec2(t * 0.1, 0.0);
    float neb = sin(nebUV.x * 3.0) * cos(nebUV.y * 2.0 + nebUV.x);
    neb = smoothstep(0.3, 0.7, neb * 0.5 + 0.5);
    vec3 nebCol = layer < 1.0 ? vec3(0.1, 0.05, 0.15) : vec3(0.05, 0.1, 0.15);
    col += nebCol * neb * 0.3;
  }

  // Stars
  for (float i = 0.0; i < 40.0; i++) {
    vec2 starPos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)));
    float star = smoothstep(0.002, 0.0, length(uv - starPos));
    col += vec3(1.0) * star * 0.5;
  }

  // 3D floating "headlines" (abstract text blocks)
  for (float i = 0.0; i < 8.0; i++) {
    float seed = i * 17.3;

    // 3D position
    float z = fract(hash(vec2(i, 2.0)) + t * 0.2);
    float scale = 1.0 / (z * 3.0 + 0.5);

    vec2 pos = vec2(
      (hash(vec2(i, 0.0)) - 0.5) * 2.0,
      (hash(vec2(i, 1.0)) - 0.5) * 1.5
    );
    pos = pos * scale * 0.3;

    // Rotation in 3D space
    float rotY = t * 0.5 + seed;
    pos.x += sin(rotY) * 0.1 * scale;

    vec2 toBlock = center - pos;

    // Headline block (3D perspective)
    float blockW = 0.15 * scale;
    float blockH = 0.02 * scale;

    // 3D tilt
    float tilt = sin(rotY) * 0.3;
    toBlock.y += toBlock.x * tilt;

    float block = step(abs(toBlock.x), blockW);
    block *= step(abs(toBlock.y), blockH);

    // Glow/glass effect
    float glow = smoothstep(blockW + 0.02 * scale, blockW, abs(toBlock.x));
    glow *= smoothstep(blockH + 0.01 * scale, blockH, abs(toBlock.y));

    // Text lines within block
    float textLine = 0.0;
    for (float line = 0.0; line < 2.0; line++) {
      float lineY = (line - 0.5) * blockH * 0.8;
      float lineLen = blockW * (0.6 + hash(vec2(seed, line)) * 0.3);
      float text = step(abs(toBlock.y - lineY), blockH * 0.15);
      text *= step(-lineLen, toBlock.x) * step(toBlock.x, lineLen);
      textLine = max(textLine, text);
    }

    // Glass panel color
    vec3 panelCol = vec3(0.1, 0.15, 0.25);
    panelCol += vec3(0.05, 0.1, 0.15) * (1.0 - z); // Fade with distance

    // Reflection highlight
    float highlight = smoothstep(0.5, -0.5, toBlock.y / blockH) * 0.3;
    panelCol += vec3(0.2) * highlight;

    col = mix(col, panelCol, glow * (1.0 - z * 0.5));
    col = mix(col, vec3(0.8, 0.85, 0.9), textLine * glow * (1.0 - z));
  }

  // Subtle lens flare
  float flare = smoothstep(0.3, 0.0, length(center - vec2(0.3, 0.2)));
  col += vec3(0.1, 0.15, 0.2) * flare * 0.3;

  fragColor = vec4(col, 1.0);
}`, { name: 'RSS Visualizer', desc: 'Mac Tiger 3D feeds' });

register('aerial', `
// Mac OS X Aerial - stylized flyover landscapes
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  float t = u_time * 0.05;
  vec3 col = vec3(0.0);

  // Camera flying over terrain
  vec2 camPos = vec2(t, sin(t * 0.3) * 0.5);

  // Sky gradient (sunset/sunrise colors)
  float skyPhase = sin(t * 0.1) * 0.5 + 0.5;
  vec3 skyTop = mix(vec3(0.1, 0.2, 0.5), vec3(0.8, 0.4, 0.2), skyPhase);
  vec3 skyBot = mix(vec3(0.4, 0.5, 0.7), vec3(1.0, 0.7, 0.4), skyPhase);
  col = mix(skyBot, skyTop, uv.y);

  // Sun/moon
  vec2 sunPos = vec2(0.7, 0.85);
  float sun = smoothstep(0.1, 0.08, length(uv - sunPos));
  vec3 sunCol = mix(vec3(1.0, 0.95, 0.8), vec3(0.9, 0.7, 0.3), skyPhase);
  col = mix(col, sunCol, sun);

  // Clouds
  for (float layer = 0.0; layer < 3.0; layer++) {
    float cloudY = 0.6 + layer * 0.1;
    vec2 cloudUV = vec2(uv.x + t * (0.1 + layer * 0.02), uv.y);

    // Procedural cloud shapes
    float cloud = 0.0;
    for (float i = 0.0; i < 5.0; i++) {
      float cx = hash(vec2(i + layer * 10.0, 0.0));
      float cy = cloudY + hash(vec2(i + layer * 10.0, 1.0)) * 0.05;
      float cw = 0.1 + hash(vec2(i + layer * 10.0, 2.0)) * 0.15;

      float cloudDist = length((cloudUV - vec2(fract(cx + t * 0.05), cy)) * vec2(1.0, 3.0));
      cloud = max(cloud, smoothstep(cw, cw - 0.05, cloudDist));
    }

    col = mix(col, vec3(1.0, 0.98, 0.95), cloud * (0.8 - layer * 0.2));
  }

  // Terrain (rolling hills)
  float horizon = 0.35;

  if (uv.y < horizon) {
    // Ground texture
    vec2 groundUV = vec2(uv.x + camPos.x, (horizon - uv.y) * 3.0);

    // Hills using sine waves
    float hills = 0.0;
    hills += sin(groundUV.x * 5.0) * 0.03;
    hills += sin(groundUV.x * 12.0 + 1.0) * 0.015;
    hills += sin(groundUV.x * 25.0 + 2.0) * 0.008;

    float terrainLine = horizon + hills;

    if (uv.y < terrainLine) {
      // Terrain color (varies with position)
      float terrainType = sin(groundUV.x * 0.5) * 0.5 + 0.5;
      vec3 grass = vec3(0.2, 0.5, 0.2);
      vec3 desert = vec3(0.7, 0.55, 0.35);
      vec3 terrainCol = mix(grass, desert, terrainType);

      // Distance fog
      float dist = (horizon - uv.y) / horizon;
      terrainCol = mix(terrainCol, mix(skyBot, vec3(0.6, 0.65, 0.75), 0.5), dist * 0.8);

      col = terrainCol;

      // Water/rivers
      float river = smoothstep(0.02, 0.0, abs(fract(groundUV.x * 2.0 + sin(groundUV.y * 5.0) * 0.1) - 0.5) - 0.02);
      river *= step(0.3, terrainType) * step(terrainType, 0.7);
      col = mix(col, vec3(0.2, 0.4, 0.6), river * 0.5);
    }
  }

  // Atmospheric haze at horizon
  float haze = smoothstep(horizon + 0.05, horizon - 0.05, uv.y);
  col = mix(col, mix(skyBot, vec3(0.8, 0.85, 0.9), 0.5), haze * 0.3);

  fragColor = vec4(col, 1.0);
}`, { name: 'Aerial', desc: 'Mac flyover landscapes' });

register('photomobile', `
// Mac OS X Photo Mobile - hanging photos gently swaying
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 center = (uv - 0.5) * vec2(aspect, 1.0);

  float t = u_time * 0.3;

  // Soft gradient background
  vec3 col = mix(vec3(0.9, 0.92, 0.95), vec3(0.8, 0.85, 0.9), uv.y);

  // Subtle light rays from top
  float rays = sin(center.x * 10.0 + t * 0.5) * 0.5 + 0.5;
  rays *= smoothstep(0.5, 0.0, -center.y);
  col += vec3(0.05) * rays;

  // Mobile structure (hanging wires)
  float mainWireX = sin(t * 0.2) * 0.05;
  float mainWire = smoothstep(0.003, 0.0, abs(center.x - mainWireX));
  mainWire *= step(0.3, center.y);
  col = mix(col, vec3(0.3), mainWire);

  // Hanging photos
  for (float i = 0.0; i < 5.0; i++) {
    float seed = i * 17.3;

    // Photo swings on its wire
    float swingPhase = t + seed;
    float swing = sin(swingPhase * 0.7) * 0.15;

    // Wire attachment point
    float wireX = (i - 2.0) * 0.25 + sin(t * 0.3 + i) * 0.05;
    float wireTop = 0.3 + sin(i * 2.0) * 0.1;

    // Photo position (hanging below wire)
    float wireLen = 0.15 + hash(vec2(i, 0.0)) * 0.1;
    vec2 photoCenter = vec2(wireX + sin(swing) * wireLen, wireTop - wireLen * cos(swing) - 0.1);

    // Photo dimensions
    float photoW = 0.08;
    float photoH = 0.06;

    // Photo rotation follows swing
    float photoRot = swing * 0.5;
    float c = cos(photoRot), s = sin(photoRot);

    vec2 toPhoto = center - photoCenter;
    toPhoto = vec2(c * toPhoto.x - s * toPhoto.y, s * toPhoto.x + c * toPhoto.y);

    // Wire to photo
    vec2 wireEnd = vec2(wireX, wireTop);
    vec2 photoTop = photoCenter + vec2(s, c) * photoH * 0.5;

    float wire = 0.0;
    vec2 wireDir = normalize(photoTop - wireEnd);
    float wireProj = dot(center - wireEnd, wireDir);
    if (wireProj > 0.0 && wireProj < length(photoTop - wireEnd)) {
      vec2 wireClosest = wireEnd + wireDir * wireProj;
      wire = smoothstep(0.003, 0.0, length(center - wireClosest));
    }
    col = mix(col, vec3(0.2), wire);

    // Draw photo frame
    if (abs(toPhoto.x) < photoW && abs(toPhoto.y) < photoH) {
      // White border
      float border = step(photoW - 0.01, abs(toPhoto.x)) + step(photoH - 0.01, abs(toPhoto.y));

      // Photo "image" - abstract colorful content
      vec3 photoCol = vec3(
        0.3 + 0.5 * sin(seed + toPhoto.x * 10.0),
        0.3 + 0.5 * sin(seed + 1.0 + toPhoto.y * 10.0),
        0.3 + 0.5 * sin(seed + 2.0 + (toPhoto.x + toPhoto.y) * 5.0)
      );

      // Shadow/depth on photo
      photoCol *= 0.9 + 0.1 * (toPhoto.x / photoW);

      col = mix(col, mix(photoCol, vec3(1.0), border), 0.95);

      // Drop shadow
      vec2 shadowOffset = vec2(0.01, -0.01);
      vec2 toShadow = center - photoCenter - shadowOffset;
      toShadow = vec2(c * toShadow.x - s * toShadow.y, s * toShadow.x + c * toShadow.y);
      if (abs(toShadow.x) < photoW && abs(toShadow.y) < photoH) {
        // Already drawing photo, shadow is behind
      }
    } else {
      // Shadow (slightly offset)
      vec2 shadowOffset = vec2(0.01, -0.015);
      vec2 toShadow = center - photoCenter - shadowOffset;
      toShadow = vec2(c * toShadow.x - s * toShadow.y, s * toShadow.x + c * toShadow.y);
      if (abs(toShadow.x) < photoW && abs(toShadow.y) < photoH) {
        col = mix(col, vec3(0.0), 0.15);
      }
    }
  }

  fragColor = vec4(col, 1.0);
}`, { name: 'Photo Mobile', desc: 'Mac hanging photos' });

register('vintageprints', `
// Mac OS X Vintage Prints - old-style photographs
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.15;

  // Photo changes every few seconds
  float photoIndex = floor(t);
  float photoProgress = fract(t);

  // Sepia/vintage paper background
  vec3 col = mix(vec3(0.85, 0.8, 0.7), vec3(0.75, 0.7, 0.6), uv.y);

  // Paper texture
  float paperNoise = hash(uv * 200.0 + photoIndex) * 0.05;
  col -= paperNoise;

  // Photo frame area
  float frameMargin = 0.1;
  float inFrame = step(frameMargin, uv.x) * step(uv.x, 1.0 - frameMargin);
  inFrame *= step(frameMargin, uv.y) * step(uv.y, 1.0 - frameMargin);

  if (inFrame > 0.5) {
    vec2 photoUV = (uv - frameMargin) / (1.0 - 2.0 * frameMargin);

    // Generate vintage photo content based on index
    vec3 photoCol = vec3(0.0);

    float photoType = hash(vec2(photoIndex, 0.0));

    if (photoType < 0.33) {
      // Portrait style - oval vignette with face suggestion
      float oval = length((photoUV - 0.5) * vec2(1.0, 1.3));
      photoCol = mix(vec3(0.9, 0.85, 0.75), vec3(0.3, 0.25, 0.2), smoothstep(0.3, 0.5, oval));

      // Face suggestion (abstract)
      float face = smoothstep(0.2, 0.15, length(photoUV - vec2(0.5, 0.55)));
      photoCol = mix(photoCol, vec3(0.7, 0.6, 0.5), face * 0.5);

    } else if (photoType < 0.66) {
      // Landscape style
      float horizon = 0.4 + hash(vec2(photoIndex, 1.0)) * 0.1;

      // Sky
      photoCol = mix(vec3(0.7, 0.75, 0.8), vec3(0.5, 0.55, 0.6), photoUV.y / horizon);

      // Ground
      if (photoUV.y < horizon) {
        photoCol = mix(vec3(0.4, 0.35, 0.3), vec3(0.3, 0.25, 0.2), photoUV.y / horizon);
      }

      // Trees/structures silhouette
      float treeLine = horizon - 0.05 - abs(sin(photoUV.x * 20.0 + photoIndex)) * 0.08;
      if (photoUV.y < treeLine) {
        photoCol = vec3(0.15, 0.12, 0.1);
      }

    } else {
      // Group/family photo style
      photoCol = vec3(0.5, 0.45, 0.4); // Indoor background

      // Figures (abstract shapes)
      for (float p = 0.0; p < 4.0; p++) {
        float figX = 0.2 + p * 0.2;
        float figH = 0.3 + hash(vec2(photoIndex, p + 10.0)) * 0.15;
        vec2 figPos = vec2(figX, 0.3);

        float figure = smoothstep(0.08, 0.06, length((photoUV - figPos) * vec2(1.0, 2.0 / figH)));
        photoCol = mix(photoCol, vec3(0.3, 0.25, 0.2), figure);
      }
    }

    // Sepia tone
    float gray = dot(photoCol, vec3(0.299, 0.587, 0.114));
    photoCol = mix(vec3(gray), vec3(gray * 1.1, gray * 0.95, gray * 0.8), 0.7);

    // Vintage damage effects
    float damage = hash(photoUV * 50.0 + photoIndex * 0.1);
    if (damage > 0.98) {
      photoCol = mix(photoCol, vec3(0.9, 0.85, 0.8), 0.5);
    }

    // Scratches
    float scratch = smoothstep(0.001, 0.0, abs(photoUV.y - fract(photoUV.x * 3.0 + photoIndex * 0.5) * 0.3 - 0.35));
    scratch *= step(0.95, hash(vec2(floor(photoUV.x * 20.0), photoIndex)));
    photoCol = mix(photoCol, vec3(0.9), scratch * 0.3);

    // Faded edges
    float edgeFade = smoothstep(0.0, 0.1, photoUV.x) * smoothstep(1.0, 0.9, photoUV.x);
    edgeFade *= smoothstep(0.0, 0.1, photoUV.y) * smoothstep(1.0, 0.9, photoUV.y);
    photoCol = mix(vec3(0.8, 0.75, 0.65), photoCol, edgeFade);

    col = photoCol;
  }

  // Photo border
  float borderWidth = 0.015;
  float border = step(frameMargin - borderWidth, uv.x) * step(uv.x, 1.0 - frameMargin + borderWidth);
  border *= step(frameMargin - borderWidth, uv.y) * step(uv.y, 1.0 - frameMargin + borderWidth);
  border *= 1.0 - inFrame;
  col = mix(col, vec3(0.95, 0.92, 0.88), border);

  // Transition fade
  float fade = smoothstep(0.0, 0.15, photoProgress) * smoothstep(1.0, 0.85, photoProgress);
  col = mix(vec3(0.8, 0.75, 0.65), col, fade);

  fragColor = vec4(col, 1.0);
}`, { name: 'Vintage Prints', desc: 'Mac old photographs' });
