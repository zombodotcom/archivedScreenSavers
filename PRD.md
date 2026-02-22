# Product Requirements Document: SCRN Archive
## The Definitive Web Museum of Operating System Screensavers

**Version:** 1.0
**Date:** February 2026
**Status:** Draft

---

## 1. Executive Summary

Transform the existing SCRN WebGL screensaver engine into a comprehensive, interactive museum of operating system screensavers throughout computing history. Each OS era will be presented with **authentic period-accurate UI styling** (Windows 98 menus for Win98 screensavers, XP chrome for XP-era, etc.) creating an immersive nostalgia experience.

**Deployment Target:** Netlify (static site, zero backend)

---

## 2. Current State

### What We Have (Working)
| Asset | Description | Status |
|-------|-------------|--------|
| `index.html` | SCRN engine with 11 built-in shader effects | Working |
| `effects/flurry.js` | Mac OS X Flurry emulation (ping-pong buffer trails) | Working |
| `effects/toasters.js` | After Dark Flying Toasters (instanced sprites) | Working |
| `effects/pipes.js` | Windows 3D Pipes (rasterized 3D geometry) | Working |
| `ARCHIVE.md` | Comprehensive reference of every default screensaver by OS | Reference doc |

### Built-in Effects (in index.html)
- Starfield, Plasma, Matrix, Mystify, Fireworks, Warp, Flow Field, Rain, Lava Lamp, Geometry, Aurora

### What's Broken (Delete)
- Any effects in `/effects` made by "Gemini 3.1" - non-functional, remove before proceeding

---

## 3. Vision

### The Experience
A visitor lands on the SCRN Archive and is greeted with an era selector. Choosing "Windows 98" transforms the entire UI into the authentic Windows 98 aesthetic - beveled buttons, system font, title bars with minimize/maximize/close, the works. The screensaver picker becomes a Windows 98-style dialog. Choosing "Mac OS X" shifts to Aqua styling with the characteristic gloss and rounded corners.

### Core Principle
**The UI IS the exhibit.** Visitors don't just watch screensavers - they experience the entire visual language of each computing era.

---

## 4. Technical Architecture

### CSS Framework Stack (From Research)

| Era | CSS Library | CDN/Source |
|-----|-------------|------------|
| **Windows 3.1/95/98** | [98.css](https://jdan.github.io/98.css/) | `unpkg.com/98.css` |
| **Windows XP** | [XP.css](https://botoxparty.github.io/XP.css/) | `unpkg.com/xp.css` |
| **Windows 7/Vista** | [7.css](https://khang-nd.github.io/7.css/) | `unpkg.com/7.css` |
| **Classic Mac (System 6-7)** | [system.css](https://sakofchit.github.io/system.css/) | `unpkg.com/system.css` |
| **Mac OS 8/9** | [Classicy](https://github.com/robbiebyrd/classicy) | Build from source |
| **Mac OS X** | Custom (Aqua-inspired) | Hand-rolled |
| **Linux/XScreenSaver** | [NES.css](https://nostalgic-css.github.io/NES.css/) variant or custom terminal | Custom |
| **After Dark** | Dark theme + CRT scanlines | Custom shader overlay |

### Site Structure

```
/
├── index.html          # Landing page / era selector
├── css/
│   ├── base.css        # Shared styles
│   ├── themes/
│   │   ├── win31.css   # Windows 3.1 overrides
│   │   ├── win98.css   # 98.css + customizations
│   │   ├── winxp.css   # XP.css + customizations
│   │   ├── win7.css    # 7.css + customizations
│   │   ├── macos-classic.css
│   │   ├── macos-aqua.css
│   │   ├── linux.css
│   │   └── afterdark.css
├── js/
│   ├── scrn-engine.js  # Core WebGL engine (extracted from index.html)
│   ├── effects/        # All screensaver implementations
│   │   ├── _registry.js
│   │   ├── windows/
│   │   │   ├── starfield.js
│   │   │   ├── mystify.js
│   │   │   ├── pipes.js
│   │   │   ├── flying-objects.js
│   │   │   ├── maze.js
│   │   │   ├── beziers.js
│   │   │   ├── marquee.js
│   │   │   ├── bubbles.js
│   │   │   └── ribbons.js
│   │   ├── mac/
│   │   │   ├── flurry.js
│   │   │   ├── arabesque.js
│   │   │   └── shell.js
│   │   ├── afterdark/
│   │   │   ├── toasters.js
│   │   │   ├── starry-night.js
│   │   │   └── fish.js
│   │   ├── xscreensaver/
│   │   │   ├── glmatrix.js
│   │   │   └── gears.js
│   │   └── scrn-originals/   # OUR EFFECTS
│   │       ├── plasma.js
│   │       ├── matrix.js
│   │       ├── fireworks.js
│   │       ├── warp.js
│   │       ├── flow.js
│   │       ├── rain.js
│   │       ├── lava.js
│   │       ├── geometry.js
│   │       └── aurora.js
│   └── ui/
│       ├── era-selector.js
│       ├── theme-switcher.js
│       └── screensaver-picker.js
├── eras/               # Era-specific pages (optional, could be SPA)
│   ├── win31.html
│   ├── win98.html
│   ├── winxp.html
│   ├── win7.html
│   ├── macos.html
│   ├── linux.html
│   └── afterdark.html
├── assets/
│   ├── fonts/          # Period-accurate fonts (MS Sans Serif, Chicago, etc.)
│   ├── icons/          # 16x16 and 32x32 era-appropriate icons
│   └── sounds/         # Optional: startup sounds, clicks
└── netlify.toml        # Netlify config
```

---

## 5. Feature Specification

### 5.1 Era Selector (Landing Page)

**Visual:** A stylized timeline or grid showing OS logos/icons from each era. Hovering previews the UI style. Clicking enters that era's museum section.

**Eras:**
1. **Windows 3.1** (1992) - First screensavers
2. **Windows 95/98** (1995-1998) - Golden age of OpenGL screensavers
3. **Windows XP** (2001) - Last of the classics
4. **Windows Vista/7** (2007-2009) - Aero glass era
5. **Classic Macintosh** (1984-1999) - System 6/7/8/9
6. **Mac OS X** (2001-present) - Flurry, Arabesque, Aerial
7. **Linux/XScreenSaver** (1992-present) - jwz's legendary collection
8. **After Dark** (1989-1993) - Flying Toasters and beyond
9. **SCRN Originals** - Our own creations (modern, no specific era styling)

### 5.2 Era Museum Pages

Each era page features:

**A) Period-Accurate Chrome**
- Window decorations (title bar, buttons)
- Menus (File, Edit, View style dropdowns)
- Dialogs (modal windows with OK/Cancel)
- Status bars
- System tray / menu bar

**B) Screensaver Gallery**
- Grid or list of available screensavers for that era
- Thumbnail previews (animated WebGL canvas or static screenshot)
- Click to launch fullscreen

**C) Info Panel**
- Historical context for each screensaver
- Original release date/OS version
- Fun facts (e.g., "The Utah Teapot appears as a joint option in Win2K Pipes")

**D) Settings Dialog**
- Per-screensaver options where applicable (speed, colors, etc.)
- Styled as the era-appropriate control panel / preferences

### 5.3 Fullscreen Screensaver Mode

- Click any screensaver to launch fullscreen
- Mouse movement shows minimal controls overlay
- ESC or click to exit
- Shuffle mode cycles through all screensavers in that era
- Cross-era shuffle mode for the adventurous

### 5.4 "SCRN Originals" Section

**Our effects deserve their own category.** This section uses a modern, minimal dark UI (the current SCRN aesthetic) and showcases:

- All 11 built-in effects from current index.html
- Future original creations
- Community contributions (if we open source)

---

## 6. Screensaver Implementation Priority

### Phase 1: MVP (Ship It)
Archive our current working effects and get basic era navigation working.

| Screensaver | Era | Status | Notes |
|-------------|-----|--------|-------|
| Starfield | Windows 3.1+ | Built-in | Classic |
| Mystify | Windows 3.1+ | Built-in | Bouncing polygons |
| Pipes | Windows NT/95+ | `pipes.js` | Full 3D, working |
| Flurry | Mac OS X | `flurry.js` | Working |
| Flying Toasters | After Dark | `toasters.js` | Working |
| Plasma | SCRN Original | Built-in | |
| Matrix | SCRN Original | Built-in | |
| + 7 more originals | SCRN Original | Built-in | |

### Phase 2: Windows Classics
| Screensaver | Era | Complexity | Reference |
|-------------|-----|------------|-----------|
| Flying Windows | Win 3.1 | Low | Logo starfield |
| Marquee | Win 3.1+ | Low | Scrolling text |
| Beziers | Win 95+ | Medium | Abstract curves |
| 3D Maze | Win 95 | High | First-person maze (see [GitHub](https://github.com/coco-monier/Windows-95-3D-Maze)) |
| 3D Flying Objects | Win 95+ | Medium | XP logo, ribbons |
| 3D Flower Box | Win 95 | Medium | Morphing shape |
| Bubbles | Vista+ | Medium | Reflective spheres |
| Ribbons | Vista+ | Medium | Flowing 3D ribbons |

### Phase 3: Mac & Linux
| Screensaver | Era | Complexity |
|-------------|-----|------------|
| Arabesque | Mac OS X | Medium |
| Shell | Mac OS X | Medium |
| GLMatrix | XScreenSaver | Medium (existing ports) |
| Gears | XScreenSaver | Medium |
| Boing Ball | Amiga | Low |

### Phase 4: Deep Cuts
| Screensaver | Era | Notes |
|-------------|-----|-------|
| Johnny Castaway | Third-party | Narrative screensaver - extremely complex |
| Electropaint | SGI IRIX | If we can find reference |
| Lunatic Fringe | After Dark | Playable game! |
| RSS Visualizer | Mac OS X Tiger | 3D news feed |

---

## 7. External Resources to Integrate

### Existing WebGL Ports (MIT Licensed - Can Adapt)

| Project | What It Is | Link |
|---------|------------|------|
| **Flurry-WebGL** | Mac Flurry port | [GitHub](https://github.com/RoyCurtis/Flurry-WebGL) |
| **webgl-pipes** | Three.js Pipes | [GitHub](https://github.com/Alex313031/webgl-pipes) |
| **Windows-95-3D-Maze** | Full maze recreation | [GitHub](https://github.com/coco-monier/Windows-95-3D-Maze) |

### CSS Libraries (All MIT/Open)

| Library | Use For | Link |
|---------|---------|------|
| **98.css** | Windows 3.1/95/98 | [Docs](https://jdan.github.io/98.css/) / [GitHub](https://github.com/jdan/98.css) |
| **XP.css** | Windows XP | [Docs](https://botoxparty.github.io/XP.css/) / [GitHub](https://github.com/botoxparty/XP.css) |
| **7.css** | Windows 7 | [Docs](https://khang-nd.github.io/7.css/) / [GitHub](https://github.com/khang-nd/7.css) |
| **system.css** | Classic Mac | [Docs](https://sakofchit.github.io/system.css/) / [GitHub](https://github.com/sakofchit/system.css) |
| **Classicy** | Mac OS 8 (React) | [GitHub](https://github.com/robbiebyrd/classicy) |
| **OS GUI** | Windows 98 + JS | [Demo](https://os-gui.js.org/) |

### Retro CSS Compilation Lists
- [matt-auckland/retro-css](https://github.com/matt-auckland/retro-css) - Comprehensive list
- [xguru/RetroCSS](https://github.com/xguru/RetroCSS) - Additional frameworks

---

## 8. Technical Requirements

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- WebGL2 required (WebGL1 fallback for older devices)
- No IE11 support (it's 2026)

### Performance Targets
- 60fps on mid-range hardware
- < 3s initial load (lazy load effects)
- < 500KB initial CSS/JS payload
- Effects load on-demand

### Accessibility
- Keyboard navigation throughout
- Screen reader support for UI (screensavers themselves are visual-only)
- Reduced motion option (static previews instead of animated)
- High contrast mode

### SEO / Shareability
- Clean URLs: `/win98/pipes`, `/macos/flurry`
- Open Graph tags with animated preview thumbnails
- JSON-LD structured data for screensaver metadata

---

## 9. Netlify Deployment

### Configuration

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Build Pipeline
1. **Development:** Vite dev server with hot reload
2. **Production:** Vite build → static assets → Netlify deploy
3. **Preview:** Netlify Deploy Previews for PRs

---

## 10. Implementation Roadmap

### Week 1-2: Foundation
- [ ] Extract SCRN engine into standalone module
- [ ] Set up Vite build pipeline
- [ ] Create base HTML structure with era routing
- [ ] Integrate 98.css, XP.css, 7.css, system.css
- [ ] Build theme switcher system

### Week 3-4: Era Pages
- [ ] Windows 98 museum page (flagship)
- [ ] SCRN Originals page
- [ ] Move existing effects into organized structure
- [ ] After Dark page with toasters

### Week 5-6: Polish & Expand
- [ ] Mac OS X page with Flurry
- [ ] Additional screensaver implementations (Marquee, Beziers, Bubbles)
- [ ] Settings dialogs per-screensaver
- [ ] Responsive design for tablets

### Week 7-8: Launch Prep
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Cross-browser testing
- [ ] Write launch blog post
- [ ] Set up analytics
- [ ] Netlify production deploy

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| Time to Interactive | < 3s |
| Screensavers Implemented | 20+ at launch |
| Eras Covered | All 9 |
| Monthly Visitors (6mo post-launch) | 10,000+ |

---

## 12. Future Considerations

### Potential Features (Post-MVP)
- **User Accounts:** Save favorite screensavers
- **Screensaver Creator:** In-browser shader editor for custom effects
- **Desktop App:** Electron wrapper to use these as actual screensavers
- **Mobile:** Touch-friendly mode, gyroscope integration
- **Merch:** Poster prints of iconic screensavers
- **API:** Embeddable screensaver widgets for other sites

### Community
- Open source on GitHub
- Accept community effect contributions
- Discord for screensaver nerds

---

## 13. Open Questions

1. **Sound?** Should startup sounds, effect sounds be included? (Accessibility concern)
2. **Realistic Mode?** Option to add CRT scanlines, color bleeding for extra nostalgia?
3. **3D Maze Gameplay?** Make the maze actually playable with WASD?
4. **After Dark Licensing?** Flying Toasters was trademarked - are we safe with "inspired by" implementations?

---

## Appendix A: Effect Quick Reference

See `ARCHIVE.md` for the complete historical reference of every screensaver by OS.

---

## Appendix B: Research Sources

### CSS Libraries
- [98.css Documentation](https://jdan.github.io/98.css/)
- [XP.css Documentation](https://botoxparty.github.io/XP.css/)
- [7.css Documentation](https://khang-nd.github.io/7.css/)
- [system.css Documentation](https://sakofchit.github.io/system.css/)
- [Classicy (Mac OS 8)](https://github.com/robbiebyrd/classicy)
- [Retro CSS List](https://github.com/matt-auckland/retro-css)

### WebGL Screensaver Ports
- [Flurry-WebGL](https://github.com/RoyCurtis/Flurry-WebGL)
- [webgl-pipes](https://github.com/Alex313031/webgl-pipes)
- [Windows-95-3D-Maze](https://github.com/coco-monier/Windows-95-3D-Maze)
- [XScreenSaver](https://www.jwz.org/xscreensaver/screenshots/)

---

*Last updated: February 2026*
