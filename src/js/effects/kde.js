/**
 * Kde Screensaver Effects
 * Auto-generated from effects.js
 */
import { ass } from '../ass.js';

const register = (id, shader, opts = {}) => ass.add(id, shader, opts);

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
