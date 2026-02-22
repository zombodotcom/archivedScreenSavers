/**
 * aSS - Archived Screen Savers
 *
 * Dead simple screensaver engine. To add a new effect:
 *
 *   ass.add('myeffect', `
 *     void main() {
 *       vec2 uv = gl_FragCoord.xy / u_resolution;
 *       fragColor = vec4(uv, sin(u_time), 1.0);
 *     }
 *   `);
 *
 * That's it. The engine adds all the boilerplate.
 *
 * For effects with settings, pass a settings object:
 *   ass.add('myeffect', shader, {
 *     settings: {
 *       speed: { value: 1.0, min: 0.1, max: 3.0, label: 'Speed' },
 *       color: { value: [1, 0, 0], type: 'color', label: 'Color' }
 *     }
 *   });
 */

class ASS {
  constructor() {
    this.effects = {};      // Compiled effects
    this.pending = [];      // Effects waiting to be compiled
    this.current = null;
    this.gl = null;
    this.time = 0;
    this.running = false;
    this.settingsValues = {};  // Current values for effect settings
  }

  // Initialize on a canvas
  init(canvas) {
    // If reinitializing, save shader sources to recompile
    const shaderSources = {};
    for (const [id, effect] of Object.entries(this.effects)) {
      shaderSources[id] = {
        shader: effect.shaderSrc,
        opts: { name: effect.name, desc: effect.desc, settings: effect.settings }
      };
    }

    // Clean up old context if exists
    if (this.gl) {
      for (const effect of Object.values(this.effects)) {
        if (effect.prog) this.gl.deleteProgram(effect.prog);
      }
      if (this.quadBuf) this.gl.deleteBuffer(this.quadBuf);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
    }

    this.effects = {};
    this.current = null;
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false });
    if (!this.gl) return console.error('WebGL2 required'), false;

    // Fullscreen quad
    const gl = this.gl;
    this.quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Recompile saved effects from previous context
    for (const [id, data] of Object.entries(shaderSources)) {
      this._compile(id, data.shader, data.opts);
    }

    // Compile all pending effects
    for (const p of this.pending) {
      this._compile(p.id, p.shader, p.opts);
    }
    this.pending = [];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    return true;
  }

  resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Add a new screensaver effect
   * @param {string} id - Unique ID for this effect
   * @param {string} shader - Fragment shader main() body
   * @param {object} opts - Optional: { name, desc }
   */
  add(id, shader, opts = {}) {
    if (!this.gl) {
      // Defer until init
      this.pending.push({ id, shader, opts });
      return;
    }
    this._compile(id, shader, opts);
  }

  _compile(id, shader, opts) {
    // Generate uniform declarations for settings
    let settingsUniforms = '';
    if (opts.settings) {
      for (const [key, setting] of Object.entries(opts.settings)) {
        if (setting.type === 'color') {
          settingsUniforms += `uniform vec3 u_${key};\n`;
        } else {
          settingsUniforms += `uniform float u_${key};\n`;
        }
        // Initialize settings values if not already set
        if (!this.settingsValues[id]) this.settingsValues[id] = {};
        if (this.settingsValues[id][key] === undefined) {
          this.settingsValues[id][key] = setting.value;
        }
      }
    }

    const fsrc = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
${settingsUniforms}
// Utility functions
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash(float n) { return fract(sin(n) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float line(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

${shader}`;

    const vsrc = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

    const gl = this.gl;
    const compile = (src, type) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(`Shader error in "${id}":`, gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(vsrc, gl.VERTEX_SHADER);
    const fs = compile(fsrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'a_pos');
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(`Link error in "${id}":`, gl.getProgramInfoLog(prog));
      return;
    }

    // Get uniform locations for settings
    const settingsU = {};
    if (opts.settings) {
      for (const key of Object.keys(opts.settings)) {
        settingsU[key] = gl.getUniformLocation(prog, `u_${key}`);
      }
    }

    this.effects[id] = {
      id,
      name: opts.name || id,
      desc: opts.desc || '',
      shaderSrc: shader,  // Save for recompilation
      settings: opts.settings || null,
      prog,
      u: {
        time: gl.getUniformLocation(prog, 'u_time'),
        resolution: gl.getUniformLocation(prog, 'u_resolution'),
        mouse: gl.getUniformLocation(prog, 'u_mouse'),
        ...settingsU
      }
    };
  }

  // Get setting value
  getSetting(effectId, key) {
    return this.settingsValues[effectId]?.[key];
  }

  // Set setting value
  setSetting(effectId, key, value) {
    if (!this.settingsValues[effectId]) this.settingsValues[effectId] = {};
    this.settingsValues[effectId][key] = value;
  }

  // Switch to an effect
  play(id) {
    if (!this.effects[id]) return console.warn(`Effect "${id}" not found`);
    this.current = this.effects[id];
    this.time = 0;
  }

  // Play random effect
  random() {
    const ids = Object.keys(this.effects);
    if (!ids.length) return;
    let id;
    do { id = ids[Math.floor(Math.random() * ids.length)]; }
    while (id === this.current?.id && ids.length > 1);
    this.play(id);
  }

  // Start render loop
  start() {
    this.running = true;
    let last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      requestAnimationFrame(loop);

      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      this.time += dt;

      if (this.current) {
        const gl = this.gl;
        const e = this.current;
        gl.useProgram(e.prog);
        gl.uniform1f(e.u.time, this.time);
        gl.uniform2f(e.u.resolution, this.canvas.width, this.canvas.height);
        gl.uniform2f(e.u.mouse, this.mouseX || 0, this.mouseY || 0);

        // Set custom uniforms from settings
        if (e.settings && this.settingsValues[e.id]) {
          for (const [key, setting] of Object.entries(e.settings)) {
            const val = this.settingsValues[e.id][key];
            if (val !== undefined && e.u[key]) {
              if (setting.type === 'color') {
                gl.uniform3f(e.u[key], val[0], val[1], val[2]);
              } else {
                gl.uniform1f(e.u[key], val);
              }
            }
          }
        }

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    requestAnimationFrame(loop);
  }

  stop() { this.running = false; }

  // List all effects
  list() { return Object.values(this.effects); }
}

// Export singleton
export const ass = new ASS();
export default ass;
