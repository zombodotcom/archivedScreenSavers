# SCRN — WebGL Screensaver Engine

A single-file WebGL2 screensaver engine with 11 built-in effects and a dead-simple API for adding more.

## Quick Start

```bash
# Literally just open it
open index.html

# Or serve it (some browsers restrict fullscreen from file://)
python3 -m http.server 8080
# -> http://localhost:8080
```

## Controls

| Key | Action |
|-----|--------|
| **Mouse move** | Show UI panel |
| **F** | Toggle fullscreen |
| **S** | Toggle shuffle mode |
| **Space** | Jump to random effect |
| **Escape** | Hide UI |

UI auto-hides after 2.5 seconds of no mouse movement. Cursor hides too.

## Built-in Effects

| ID | Name | Type |
|----|------|------|
| `starfield` | Starfield | Multi-layer parallax star warp |
| `plasma` | Plasma | Classic 90s color cycling |
| `matrix` | Matrix | Raining code columns |
| `mystify` | Mystify | Bouncing connected polygons with trails |
| `fireworks` | Fireworks | Procedural firework bursts |
| `warp` | Warp | Grid tunnel fly-through |
| `flow` | Flow Field | Domain-warped FBM noise |
| `rain` | Rain | Rainfall with lightning |
| `lava` | Lava Lamp | Metaball blobs |
| `geometry` | Geometry | Rotating tiled shapes |
| `aurora` | Aurora | Northern lights with star field |

## Adding a New Effect

### Shader-only Effect (easiest)

Most screensavers are just a fragment shader on a fullscreen quad. Use the `shaderEffect()` helper:

```javascript
SCRN.register(shaderEffect('my-effect', 'My Effect', `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time;

  // Your shader code here
  vec3 col = vec3(uv, sin(t) * 0.5 + 0.5);

  fragColor = vec4(col, 1.0);
}
`));
```

That's it. The helper handles program compilation, uniform binding, and the fullscreen quad draw. You get three uniforms for free:

- `u_time` — seconds since effect started (resets on switch)
- `u_resolution` — canvas size in actual pixels (accounts for DPR)
- `u_mouse` — normalized mouse position (0-1, bottom-left origin)

### Custom Effect (full control)

For effects that need their own GL state, geometry, textures, etc:

```javascript
SCRN.register({
  id: 'my-custom',
  name: 'My Custom Effect',

  init(ctx) {
    // Called once when effect becomes active
    // ctx.gl          — WebGL2 context
    // ctx.canvas      — the canvas element
    // ctx.width       — canvas width in pixels (with DPR)
    // ctx.height      — canvas height in pixels (with DPR)
    // ctx.cssWidth    — CSS pixel width
    // ctx.cssHeight   — CSS pixel height
    // ctx.dpr         — device pixel ratio
    // ctx.createProgram(vertSrc, fragSrc) — compile & link
    // ctx.getUniforms(program, ['name1', 'name2']) — get locations
    // ctx.drawQuad()  — draw the fullscreen quad (positions at attrib 0)
  },

  draw(ctx, dt) {
    // Called every frame
    // dt    — delta time in seconds (capped at 0.1)
    // ctx.time  — total elapsed time for this effect
    // ctx.mouse — { x, y, lastMove } where x,y are 0-1
  },

  destroy(ctx) {
    // Optional. Clean up GL resources.
    // Called when switching away from this effect.
  },

  resize(ctx) {
    // Optional. Called on window resize while this effect is active.
  }
});
```

### Effect Lifecycle

```
register() → [user clicks or shuffle triggers] → init() → draw() loop → destroy()
                                                                ↑          |
                                                                └──────────┘
                                                                (on switch)
```

## Architecture

Everything is in `index.html` — no build step, no dependencies, no npm.

```
SCRN (engine singleton)
├── state
│   ├── gl           — WebGL2 context
│   ├── effects      — Map<id, effect>
│   ├── currentEffect
│   ├── time/shuffle/ui state
│   └── shared quad VAO/buffer
├── register(effect) — add an effect
├── switchEffect(id) — fade transition + init
├── start()/stop()   — render loop control
└── helpers
    ├── createProgram(vs, fs)
    ├── getUniforms(program, names[])
    └── drawQuad()
```

### Design Decisions

- **Single file** — No bundler, no node_modules, no bullshit. Copy-paste to add effects.
- **WebGL2 with WebGL1 fallback** — Uses `#version 300 es` shaders by default. If you need WebGL1 compat, write your own init/draw and handle the shader version yourself.
- **DPR-aware** — Canvas renders at device pixel ratio (capped at 2x) for sharp output without murdering GPUs.
- **Delta time capped** — `dt` maxes at 0.1s so effects don't explode when the tab backgrounds.
- **Fade transitions** — 0.5s CSS fade to black between effects. Old effect is destroyed, new one is initialized fresh.

## Splitting Into Multiple Files

When this grows, the natural split is:

```
index.html              — shell + engine
effects/
  starfield.js          — SCRN.register(shaderEffect('starfield', ...))
  plasma.js
  matrix.js
  my-new-thing.js
```

Just add `<script src="effects/whatever.js"></script>` before the boot block. The `SCRN` global and `shaderEffect` helper are available.

## Tips

- Test shaders on [Shadertoy](https://shadertoy.com) first, then port. Main differences: rename `iTime` → `u_time`, `iResolution` → `u_resolution`, `fragCoord` stays the same, wrap in the `#version 300 es` boilerplate.
- Keep `precision highp float;` — mediump causes visible banding on gradients.
- The engine clears to black before calling `init()`, so you don't need to clear in your draw unless you want to.
- `ctx.mouse` tracks real cursor position even when UI is hidden — use it for subtle reactive effects.
