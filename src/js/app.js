/**
 * aSS - Archived Screen Savers
 * Main Application
 */

import { ass } from './ass.js';
import './effects.js';

// Era configurations based on ARCHIVE-new.md
// Note: Only include effects that accurately represent each era
const ERAS = {
  win31: {
    name: 'Windows 3.1',
    year: '1992',
    desc: 'First Windows with built-in screensavers',
    computer: 'pc-beige',
    brand: 'VGA',
    effects: ['starfield_31', 'flyingwindows', 'mystify_31', 'marquee']
  },
  win95: {
    name: 'Windows 95/98',
    year: '1995-1998',
    desc: 'Golden age of OpenGL screensavers',
    computer: 'pc-beige',
    brand: 'SVGA',
    effects: ['pipes', 'maze', 'flowerbox', 'flyingobjects', 'text3d', 'beziers', 'mystify', 'starfield', 'curvescolors', 'channels']
  },
  winxp: {
    name: 'Windows XP',
    year: '2001-2006',
    desc: 'Last classic OpenGL screensaver era',
    computer: 'pc-beige',
    brand: 'LCD',
    effects: ['windowsxp', 'pipes', 'maze', 'flowerbox', 'text3d', 'starfield', 'mystify']
  },
  winvista: {
    name: 'Windows Vista/7',
    year: '2007-2009',
    desc: 'DWM-powered Aero era',
    computer: 'pc-vista',
    effects: ['bubbles', 'ribbons', 'aurora', 'mystify', 'windowsenergy', 'windowslogo']
  },
  macclassic: {
    name: 'Classic Mac',
    year: '1984-1999',
    desc: 'Before built-in screensavers - After Dark era',
    computer: 'mac-classic',
    effects: ['toasters', 'starrynight', 'fish', 'zot', 'worms']
  },
  macosx: {
    name: 'Mac OS X',
    year: '2001-present',
    desc: 'Flurry, Arabesque, and Apple elegance',
    computer: 'imac-g3',
    effects: ['flurry', 'arabesque', 'shell', 'drift', 'hello', 'abstract', 'cosmos', 'kenburns', 'floating', 'mosaic', 'albumart', 'reflections', 'wordofday', 'rssvisualizer', 'aerial', 'photomobile', 'vintageprints']
  },
  linux: {
    name: 'XScreenSaver',
    year: '1992-present',
    desc: 'Jamie Zawinski\'s 240+ module collection',
    computer: 'linux-workstation',
    effects: ['matrix', 'gears', 'plasma', 'penrose', 'glplanet', 'sonar', 'hyperspace', 'flipflop', 'boingball', 'timetunnel', 'unknownpleasures', 'molecule', 'sproingies', 'twang', 'lament', 'endgame', 'fireworkx', 'phosphor', 'atlantis', 'galaxy', 'interference']
  },
  nextstep: {
    name: 'NeXTSTEP',
    year: '1988-1997',
    desc: 'Steve Jobs NeXT workstation',
    computer: 'mac-classic',
    effects: ['backspace', 'nextstep', 'boingball']
  },
  afterdark: {
    name: 'After Dark',
    year: '1989-1993',
    desc: 'Berkeley Systems\' legendary collection',
    computer: 'mac-classic',
    effects: ['toasters', 'starrynight', 'fish', 'zot', 'spotlight', 'worms', 'drain', 'warp', 'lissajous', 'rose', 'clocks', 'stringart', 'satori', 'gravity_ad', 'johnnycastaway', 'daredevildan', 'baddog', 'neon', 'dosshell', 'lunaticfringe', 'mowinman', 'messages', 'frostfire', 'underwater', 'boris', 'nocturnes', 'meadow', 'aquaticrealm', 'toasterspro']
  },
  os2: {
    name: 'OS/2 Warp',
    year: '1994-2001',
    desc: 'IBM OS/2 operating system',
    computer: 'pc-beige',
    brand: 'SVGA',
    effects: ['flyingos2', 'starfield', 'marquee']
  },
  amiga: {
    name: 'Amiga',
    year: '1985-1994',
    desc: 'Commodore Amiga demos',
    computer: 'mac-classic',
    effects: ['amigaball', 'boingball', 'plasma']
  },
  kde: {
    name: 'KDE',
    year: '1998-present',
    desc: 'Linux desktop screensavers',
    computer: 'linux-workstation',
    effects: ['euphoria', 'fieldlines', 'fireflies', 'flux', 'helios', 'lattice', 'solarwinds', 'plasma']
  },
  sgi: {
    name: 'SGI IRIX',
    year: '1991-2006',
    desc: 'Silicon Graphics workstation classics',
    computer: 'linux-workstation',
    effects: ['electropaint', 'gears', 'insidecomputer']
  },
  winplus: {
    name: 'Microsoft Plus!',
    year: '1995-1998',
    desc: 'Windows add-on pack screensavers',
    computer: 'pc-beige',
    brand: 'SVGA',
    effects: ['underwater', 'insidecomputer', 'dangerousCreatures', 'jazz', 'organicart', 'baseball', 'garfield']
  },
  originals: {
    name: 'aSS Originals',
    year: '2024',
    desc: 'Modern WebGL creations',
    computer: 'modern-display',
    effects: ['pipes', 'pipes_ag', 'matrix_ag', 'city_ag', 'fractal_ag', 'lava_ag', 'gyroid_ag', 'wormhole_ag', 'fireworks', 'warp_ag', 'rain_ag', 'aurora_ag', 'neongrid_ag', 'hyperspace_ag', 'timetunnel_ag', 'glplanet_ag', 'plasma', 'euphoria', 'helios_ag', 'fireflies_ag', 'electropaint_ag', 'frostfire']
  }
};

// Computer HTML templates
const COMPUTERS = {
  'pc-beige': (screenId, brand = 'VGA') => `
    <div class="monitor">
      <div class="screen-bezel">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="monitor-controls">
        <span class="monitor-brand">${brand}</span>
        <div class="monitor-buttons">
          <div class="monitor-btn"></div>
          <div class="monitor-btn"></div>
          <div class="power-led"></div>
        </div>
      </div>
    </div>
  `,

  'pc-xp': (screenId, brand = 'LCD') => `
    <div class="monitor">
      <div class="screen-bezel">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="monitor-stand"></div>
      <div class="monitor-brand">${brand}</div>
    </div>
  `,

  'pc-vista': (screenId) => `
    <div class="monitor">
      <div class="screen-bezel">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="monitor-chin">
        <div class="vista-logo"></div>
      </div>
    </div>
  `,

  'mac-classic': (screenId) => `
    <div class="computer-body">
      <div class="screen-area">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="floppy-slot"></div>
      <div class="mac-logo"></div>
      <div class="mac-vents">
        <div class="vent-line"></div>
        <div class="vent-line"></div>
        <div class="vent-line"></div>
      </div>
    </div>
  `,

  'imac-g3': (screenId) => `
    <div class="computer-body">
      <div class="screen-housing">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="imac-chin">
        <div class="apple-logo"></div>
        <div class="cd-slot"></div>
      </div>
    </div>
  `,

  'mac-modern': (screenId) => `
    <div class="monitor">
      <div class="screen-content" id="${screenId}"></div>
      <div class="monitor-chin">
        <div class="apple-logo"></div>
      </div>
    </div>
    <div class="stand"></div>
  `,

  'linux-workstation': (screenId) => `
    <div class="monitor">
      <div class="screen-bezel">
        <div class="screen-content" id="${screenId}"></div>
      </div>
      <div class="monitor-info">
        <span class="tux-icon">🐧</span>
        <div class="monitor-leds">
          <div class="led led-green"></div>
          <div class="led led-orange"></div>
        </div>
      </div>
    </div>
  `,

  'modern-display': (screenId) => `
    <div class="monitor">
      <div class="screen-content" id="${screenId}"></div>
    </div>
    <div class="stand"></div>
  `
};

// Active mini previews to clean up on navigation
let activePreviews = [];

// Swipe gesture handler for mobile navigation
class SwipeHandler {
  constructor(element, callbacks) {
    this.element = element;
    this.callbacks = callbacks;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.threshold = 50;
    this.maxTime = 300;
    this.verticalThreshold = 75;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    element.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.startTime = Date.now();
  }

  handleTouchEnd(e) {
    if (e.changedTouches.length !== 1) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const elapsed = Date.now() - this.startTime;

    if (elapsed < this.maxTime &&
        Math.abs(deltaX) > this.threshold &&
        Math.abs(deltaY) < this.verticalThreshold) {
      if (deltaX > 0 && this.callbacks.onSwipeRight) {
        this.callbacks.onSwipeRight();
      } else if (deltaX < 0 && this.callbacks.onSwipeLeft) {
        this.callbacks.onSwipeLeft();
      }
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
  }
}

// Navigate without page reload
function navigate(url) {
  history.pushState({}, '', url);
  route();
}

// Router
const route = () => {
  // Clean up existing previews
  activePreviews.forEach(p => p.destroy && p.destroy());
  activePreviews = [];

  // Stop main canvas if running
  ass.stop();

  const params = new URLSearchParams(location.search);
  const era = params.get('era');

  if (era && ERAS[era]) {
    renderMuseum(era, ERAS[era]);
  } else {
    renderLanding();
  }
};

// Landing page with computer gallery
function renderLanding() {
  document.title = 'aSS - Archived Screen Savers';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="landing">
      <header class="landing-header">
        <h1 class="logo">aSS</h1>
        <p class="tagline">Archived Screen Savers</p>
      </header>

      <div class="computer-gallery">
        ${Object.entries(ERAS).map(([id, era]) => `
          <a href="?era=${id}" class="computer ${era.computer}" data-era="${id}">
            ${COMPUTERS[era.computer](`screen-${id}`, era.brand)}
            <div class="computer-label">
              <h2>${era.name}</h2>
              <div class="year">${era.year}</div>
              <div class="count">${era.effects.length} screensavers</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // Initialize mini previews on each computer screen
  Object.entries(ERAS).forEach(([id, era]) => {
    const screenEl = document.getElementById(`screen-${id}`);
    if (screenEl && era.effects.length > 0) {
      const preview = initMiniPreview(screenEl, era.effects);
      if (preview) activePreviews.push(preview);
    }
  });

  // Add click handlers for SPA navigation
  document.querySelectorAll('.computer[data-era]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(`?era=${link.dataset.era}`);
    });
  });
}

// Initialize a mini canvas preview
function initMiniPreview(container, effectIds) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  // Create a mini ASS instance for this preview
  const mini = new MiniPreview(canvas, effectIds);
  mini.start();
  return mini;
}

// Mini preview class for landing page
class MiniPreview {
  constructor(canvas, effectIds) {
    this.canvas = canvas;
    this.effectIds = effectIds;
    this.currentIndex = 0;
    this.time = 0;

    this.gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true
    });

    if (!this.gl) return;

    // Fullscreen quad
    const gl = this.gl;
    this.quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.resize();
    this.compileEffect();
  }

  resize() {
    const dpr = Math.min(devicePixelRatio, 1.5);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  compileEffect() {
    const id = this.effectIds[this.currentIndex];
    // Find the effect in our global effects registry
    const effectData = window._assEffects?.[id];
    if (!effectData || !this.gl) return;

    const gl = this.gl;

    const fsrc = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
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
${effectData}`;

    const vsrc = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

    // Compile
    const compile = (src, type) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(`Mini preview shader error:`, gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    if (this.prog) gl.deleteProgram(this.prog);

    const vs = compile(vsrc, gl.VERTEX_SHADER);
    const fs = compile(fsrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    this.prog = gl.createProgram();
    gl.attachShader(this.prog, vs);
    gl.attachShader(this.prog, fs);
    gl.bindAttribLocation(this.prog, 0, 'a_pos');
    gl.linkProgram(this.prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      console.warn(`Mini preview link error`);
      return;
    }

    this.u = {
      time: gl.getUniformLocation(this.prog, 'u_time'),
      resolution: gl.getUniformLocation(this.prog, 'u_resolution')
    };
  }

  start() {
    if (!this.gl || !this.prog) return;
    this.running = true;
    this.destroyed = false;

    let last = performance.now();
    let switchTimer = 0;

    const loop = (now) => {
      // Stop immediately if destroyed
      if (this.destroyed || !this.running || !this.gl || !this.prog) return;

      // Check if context is lost
      if (this.gl.isContextLost()) return;

      this.rafId = requestAnimationFrame(loop);

      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      this.time += dt;
      switchTimer += dt;

      // Switch effect every 8 seconds
      if (switchTimer > 8) {
        switchTimer = 0;
        this.currentIndex = (this.currentIndex + 1) % this.effectIds.length;
        this.time = 0;
        this.compileEffect();
      }

      if (!this.prog || !this.gl) return;

      const gl = this.gl;
      gl.useProgram(this.prog);
      gl.uniform1f(this.u.time, this.time);
      gl.uniform2f(this.u.resolution, this.canvas.width, this.canvas.height);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  destroy() {
    this.destroyed = true;
    this.running = false;

    // Cancel any pending animation frame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.gl && !this.gl.isContextLost()) {
      if (this.prog) this.gl.deleteProgram(this.prog);
      if (this.quadBuf) this.gl.deleteBuffer(this.quadBuf);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      // Properly release WebGL context
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    this.gl = null;
    this.prog = null;

    // Remove canvas from DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
  }
}

// Museum page
function renderMuseum(eraId, era) {
  document.title = `${era.name} - aSS`;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="museum">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-toggle" id="sidebarToggle">
          <span class="toggle-icon">▲</span>
        </div>
        <div class="sidebar-content">
          <a href="/" class="back-link">← Back to Museum</a>
          <h1>aSS</h1>
          <div class="era-name">${era.name} (${era.year})</div>
          <div class="effect-list" id="list"></div>
          <div class="settings-panel" id="settings"></div>
          <div class="controls">
            <button id="prev" class="nav-btn">◀</button>
            <button id="shuffle">Shuffle</button>
            <button id="next" class="nav-btn">▶</button>
            <button id="fullscreen">⛶</button>
          </div>
        </div>
      </aside>
      <main class="preview">
        <canvas id="canvas"></canvas>
        <div class="status" id="status">Loading...</div>
        <div class="swipe-hint" id="swipeHint">← Swipe to change →</div>
      </main>
    </div>
  `;

  // Init WebGL
  const canvas = document.getElementById('canvas');
  if (!ass.init(canvas)) {
    document.getElementById('status').textContent = 'WebGL2 required';
    return;
  }

  // Track current effect for navigation
  let currentEffectIndex = 0;
  const availableEffects = era.effects.filter(id => ass.effects[id]);

  const navigateToEffect = (index) => {
    if (availableEffects.length === 0) return;
    index = ((index % availableEffects.length) + availableEffects.length) % availableEffects.length;
    currentEffectIndex = index;
    const effectId = availableEffects[index];
    ass.play(effectId);
    updateSelection(effectId);
    statusEl.textContent = ass.effects[effectId]?.name || effectId;
    buildSettingsUI(effectId);
  };

  // Swipe gesture for effect navigation on mobile
  new SwipeHandler(canvas, {
    onSwipeLeft: () => navigateToEffect(currentEffectIndex + 1),
    onSwipeRight: () => navigateToEffect(currentEffectIndex - 1)
  });

  // Double-tap to toggle fullscreen on mobile
  let lastTap = 0;
  canvas.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300 && e.changedTouches.length === 1) {
      document.getElementById('fullscreen').click();
    }
    lastTap = now;
  });

  // Build effect list
  const listEl = document.getElementById('list');
  const statusEl = document.getElementById('status');
  const settingsEl = document.getElementById('settings');
  const allEffects = ass.list();

  // Build settings UI for an effect
  function buildSettingsUI(effectId) {
    const effect = ass.effects[effectId];
    settingsEl.innerHTML = '';

    if (!effect?.settings) {
      settingsEl.style.display = 'none';
      return;
    }

    settingsEl.style.display = 'block';
    const header = document.createElement('h3');
    header.textContent = 'Settings';
    settingsEl.appendChild(header);

    for (const [key, setting] of Object.entries(effect.settings)) {
      const row = document.createElement('div');
      row.className = 'setting-row';

      const label = document.createElement('label');
      label.textContent = setting.label || key;

      const value = ass.getSetting(effectId, key) ?? setting.value;

      if (setting.type === 'color') {
        // Color picker
        const input = document.createElement('input');
        input.type = 'color';
        input.value = rgbToHex(value);
        input.oninput = () => {
          ass.setSetting(effectId, key, hexToRgb(input.value));
        };
        row.appendChild(label);
        row.appendChild(input);
      } else {
        // Slider
        const input = document.createElement('input');
        input.type = 'range';
        input.min = setting.min;
        input.max = setting.max;
        input.step = setting.step || 0.01;
        input.value = value;

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'setting-value';
        valueDisplay.textContent = Number(value).toFixed(2);

        input.oninput = () => {
          const newVal = parseFloat(input.value);
          ass.setSetting(effectId, key, newVal);
          valueDisplay.textContent = newVal.toFixed(2);
        };

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(valueDisplay);
      }

      settingsEl.appendChild(row);
    }

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset Defaults';
    resetBtn.onclick = () => {
      for (const [key, setting] of Object.entries(effect.settings)) {
        ass.setSetting(effectId, key, setting.value);
      }
      buildSettingsUI(effectId);
    };
    settingsEl.appendChild(resetBtn);
  }

  era.effects.forEach((id, index) => {
    const effect = allEffects.find(e => e.id === id);
    if (!effect) return;

    const item = document.createElement('div');
    item.className = 'effect-item';
    item.dataset.id = id;
    item.innerHTML = `<h3>${effect.name}</h3><p>${effect.desc}</p>`;
    item.onclick = () => {
      const idx = availableEffects.indexOf(id);
      if (idx !== -1) currentEffectIndex = idx;
      ass.play(id);
      updateSelection(id);
      statusEl.textContent = effect.name;
      buildSettingsUI(id);
    };
    listEl.appendChild(item);
  });

  function updateSelection(activeId) {
    document.querySelectorAll('.effect-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === activeId);
    });
  }

  // Mobile sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const swipeHint = document.getElementById('swipeHint');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Show swipe hint briefly on mobile
  if (window.innerWidth <= 600) {
    swipeHint.classList.add('visible');
    setTimeout(() => swipeHint.classList.remove('visible'), 3000);
  }

  // Prev/Next buttons
  document.getElementById('prev').onclick = () => navigateToEffect(currentEffectIndex - 1);
  document.getElementById('next').onclick = () => navigateToEffect(currentEffectIndex + 1);

  // Controls
  document.getElementById('shuffle').onclick = () => {
    if (!availableEffects.length) return;
    const randomIndex = Math.floor(Math.random() * availableEffects.length);
    currentEffectIndex = randomIndex;
    const randomId = availableEffects[randomIndex];
    ass.play(randomId);
    updateSelection(randomId);
    statusEl.textContent = ass.effects[randomId]?.name || randomId;
    buildSettingsUI(randomId);
  };

  document.getElementById('fullscreen').onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const preview = document.querySelector('.preview');
      if (preview.requestFullscreen) {
        preview.requestFullscreen();
      } else if (preview.webkitRequestFullscreen) {
        preview.webkitRequestFullscreen();
      }
    }
  };

  // Start with first available effect
  const firstAvailable = era.effects.find(id => ass.effects[id]);
  if (firstAvailable) {
    ass.play(firstAvailable);
    ass.start();
    updateSelection(firstAvailable);
    statusEl.textContent = ass.effects[firstAvailable]?.name || firstAvailable;
    buildSettingsUI(firstAvailable);
  }

  // SPA navigation for back link
  document.querySelector('.back-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });
}

// Color conversion helpers
function rgbToHex(rgb) {
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

// Initialize
route();
window.addEventListener('popstate', route);
