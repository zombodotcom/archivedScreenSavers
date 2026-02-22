/**
 * Windows 3D Pipes Emulation (Rasterized)
 * Authentic procedural generation using standard WebGL geometry for maximum performance.
 */

SCRN.register({
    id: 'pipes',
    name: '3D Pipes',

    init(ctx) {
        const gl = ctx.gl;

        const vs = `#version 300 es
      in vec3 a_pos;
      in vec3 a_nor;
      out vec3 v_nor;
      out vec3 v_pos;
      uniform mat4 u_mvp;
      uniform mat4 u_m;
      void main() {
        v_nor = mat3(u_m) * a_nor;
        v_pos = vec3(u_m * vec4(a_pos, 1.0));
        gl_Position = u_mvp * vec4(a_pos, 1.0);
      }`;

        const fs = `#version 300 es
      precision highp float;
      in vec3 v_nor;
      in vec3 v_pos;
      out vec4 fragColor;
      uniform vec3 u_color;
      uniform vec3 u_camPos;

      void main() {
        vec3 n = normalize(v_nor);
        vec3 lightDir = normalize(vec3(0.5, 0.8, -0.5));
        vec3 viewDir = normalize(u_camPos - v_pos);
        vec3 reflectDir = reflect(-lightDir, n);

        float amb = 0.25;
        float diff = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shiny plastic

        vec3 col = u_color * (amb + diff * 0.75) + vec3(1.0) * spec * 0.4;
        fragColor = vec4(col, 1.0);
      }`;

        this.program = ctx.createProgram(vs, fs);
        this.uniforms = ctx.getUniforms(this.program, ['u_mvp', 'u_m', 'u_color', 'u_camPos']);

        // Mini Matrix Math
        this.m4 = {
            identity: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            perspective: (fovy, aspect, nz, fz) => {
                let out = new Float32Array(16);
                let f = 1.0 / Math.tan(fovy / 2);
                out[0] = f / aspect; out[5] = f; out[10] = (fz + nz) / (nz - fz); out[11] = -1; out[14] = (2 * fz * nz) / (nz - fz);
                return out;
            },
            lookAt: (eye, center, up) => {
                let z0 = eye[0] - center[0], z1 = eye[1] - center[1], z2 = eye[2] - center[2];
                let len = 1 / Math.hypot(z0, z1, z2); z0 *= len; z1 *= len; z2 *= len;
                let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
                len = 1 / Math.hypot(x0, x1, x2); x0 *= len; x1 *= len; x2 *= len;
                let y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
                return new Float32Array([
                    x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
                    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]), -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]), -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1
                ]);
            },
            multiply: (a, b) => {
                let o = new Float32Array(16);
                for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
                    o[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j];
                return o;
            },
            translation: (v) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, v[0], v[1], v[2], 1]),
            scaling: (s) => new Float32Array([s[0], 0, 0, 0, 0, s[1], 0, 0, 0, 0, s[2], 0, 0, 0, 0, 1]),
            rotationY: (rad) => {
                let s = Math.sin(rad), c = Math.cos(rad);
                return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
            },
            rotationX: (rad) => {
                let s = Math.sin(rad), c = Math.cos(rad);
                return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
            }
        };

        // Geometry generators
        const createSphere = (r, lats, lons) => {
            let p = [], n = [], i = [];
            for (let lat = 0; lat <= lats; lat++) {
                let th = lat * Math.PI / lats, st = Math.sin(th), ct = Math.cos(th);
                for (let lon = 0; lon <= lons; lon++) {
                    let phi = lon * 2 * Math.PI / lons, sp = Math.sin(phi), cp = Math.cos(phi);
                    let x = cp * st, y = ct, z = sp * st;
                    n.push(x, y, z); p.push(r * x, r * y, r * z);
                }
            }
            for (let lat = 0; lat < lats; lat++) {
                for (let lon = 0; lon < lons; lon++) {
                    let first = (lat * (lons + 1)) + lon, second = first + lons + 1;
                    i.push(first, second, first + 1, second, second + 1, first + 1);
                }
            }
            return { pos: new Float32Array(p), nor: new Float32Array(n), idx: new Uint16Array(i), len: i.length };
        };

        const createCylinder = (r, len, segs) => {
            let p = [], n = [], i = [];
            for (let j = 0; j <= segs; j++) {
                let u = j / segs * Math.PI * 2, c = Math.cos(u), s = Math.sin(u);
                p.push(r * c, r * s, 0); n.push(c, s, 0);
                p.push(r * c, r * s, len); n.push(c, s, 0);
            }
            for (let j = 0; j < segs; j++) {
                let a = j * 2, b = j * 2 + 1, c = j * 2 + 2, d = j * 2 + 3;
                i.push(a, b, c, b, d, c);
            }
            return { pos: new Float32Array(p), nor: new Float32Array(n), idx: new Uint16Array(i), len: i.length };
        };

        const setupBuffer = (geo) => {
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);

            const pB = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pB);
            gl.bufferData(gl.ARRAY_BUFFER, geo.pos, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            const nB = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nB);
            gl.bufferData(gl.ARRAY_BUFFER, geo.nor, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            const iB = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iB);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);

            gl.bindVertexArray(null);
            return { vao, len: geo.len, pB, nB, iB };
        };

        this.sphere = setupBuffer(createSphere(0.18, 12, 16));
        this.cylinder = setupBuffer(createCylinder(0.15, 1.0, 16));

        // Simulation state
        this.gridMap = new Set();
        this.pipes = [];
        this.maxPipes = 6;
        this.gridSize = 20;

        this.getDirMatrix = (dir) => {
            if (Math.abs(dir[0]) > 0.5) return dir[0] > 0 ? this.m4.rotationY(Math.PI / 2) : this.m4.rotationY(-Math.PI / 2);
            if (Math.abs(dir[1]) > 0.5) return dir[1] > 0 ? this.m4.rotationX(-Math.PI / 2) : this.m4.rotationX(Math.PI / 2);
            if (Math.abs(dir[2]) > 0.5) return dir[2] > 0 ? this.m4.identity() : this.m4.rotationY(Math.PI);
            return this.m4.identity();
        };

        this.resetWorld();
    },

    resetWorld() {
        this.gridMap.clear();
        this.pipes = [];
        const colors = [[1, 0.2, 0.2], [0.2, 1, 0.2], [0.2, 0.4, 1], [1, 1, 0.2], [1, 0.2, 1], [0.2, 1, 1], [1, 1, 1]];
        this.colors = colors;
        this.worldAge = 0;
    },

    spawnPipe() {
        const p = {
            pos: [
                Math.floor(Math.random() * this.gridSize - this.gridSize / 2),
                Math.floor(Math.random() * this.gridSize - this.gridSize / 2),
                Math.floor(Math.random() * this.gridSize - this.gridSize / 2)
            ],
            dir: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]][Math.floor(Math.random() * 6)],
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            segments: [],
            progress: 0.0,
            speed: 6.0 + Math.random() * 4.0, // 6-10 grids per second
            stuck: false
        };
        p.segments.push({ pos: [...p.pos], dir: [...p.dir] });
        this.gridMap.add(p.pos.join(','));
        this.pipes.push(p);
    },

    updateSim(dt) {
        this.worldAge += dt;
        if (this.worldAge > 20.0) { // Reset every 20s
            this.resetWorld();
        }

        if (this.pipes.length < this.maxPipes && Math.random() < 0.05) {
            this.spawnPipe();
        }

        for (let p of this.pipes) {
            if (p.stuck) continue;
            p.progress += dt * p.speed;
            while (p.progress >= 1.0) {
                p.progress -= 1.0;

                // finalize current segment length
                p.pos[0] += p.dir[0];
                p.pos[1] += p.dir[1];
                p.pos[2] += p.dir[2];
                this.gridMap.add(p.pos.join(','));

                const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
                const valid = dirs.filter(d => {
                    if (d[0] === -p.dir[0] && d[1] === -p.dir[1] && d[2] === -p.dir[2]) return false;
                    let nx = p.pos[0] + d[0], ny = p.pos[1] + d[1], nz = p.pos[2] + d[2];
                    if (Math.abs(nx) > this.gridSize / 2 || Math.abs(ny) > this.gridSize / 2 || Math.abs(nz) > this.gridSize / 2) return false;
                    if (this.gridMap.has([nx, ny, nz].join(','))) return false;
                    return true;
                });

                if (valid.length === 0) {
                    p.stuck = true;
                    break;
                } else {
                    let straight = valid.find(d => d[0] === p.dir[0] && d[1] === p.dir[1] && d[2] === p.dir[2]);
                    if (straight && Math.random() < 0.6) p.dir = straight;
                    else p.dir = valid[Math.floor(Math.random() * valid.length)];

                    p.segments.push({ pos: [...p.pos], dir: [...p.dir] });
                }
            }
        }
    },

    draw(ctx, dt) {
        const gl = ctx.gl;
        this.updateSim(dt);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.useProgram(this.program);

        // Camera orbits slowly
        const camAngle = ctx.time * 0.2;
        const r = 25.0;
        const eye = [Math.sin(camAngle) * r, Math.sin(ctx.time * 0.1) * 5.0, Math.cos(camAngle) * r];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const proj = this.m4.perspective(Math.PI / 3, ctx.width / ctx.height, 0.1, 100.0);
        const view = this.m4.lookAt(eye, target, up);
        const vp = this.m4.multiply(proj, view);

        gl.uniform3f(this.uniforms.u_camPos, eye[0], eye[1], eye[2]);

        const drawMesh = (meshVao, meshLen, model, color) => {
            let mvp = this.m4.multiply(vp, model);
            gl.uniformMatrix4fv(this.uniforms.u_mvp, false, mvp);
            gl.uniformMatrix4fv(this.uniforms.u_m, false, model);
            gl.uniform3f(this.uniforms.u_color, color[0], color[1], color[2]);
            gl.bindVertexArray(meshVao);
            gl.drawElements(gl.TRIANGLES, meshLen, gl.UNSIGNED_SHORT, 0);
        };

        for (let p of this.pipes) {
            for (let i = 0; i < p.segments.length; i++) {
                let seg = p.segments[i];

                // Draw joint sphere
                let tSphere = this.m4.translation(seg.pos);
                drawMesh(this.sphere.vao, this.sphere.len, tSphere, p.color);

                // Draw cylinder to next joint (or partial if current active segment)
                let isLast = (i === p.segments.length - 1);
                let len = isLast && !p.stuck ? p.progress : 1.0;

                if (len > 0.0) {
                    let rot = this.getDirMatrix(seg.dir);
                    let scale = this.m4.scaling([1, 1, len]);
                    let tr = this.m4.translation(seg.pos);
                    let model = this.m4.multiply(this.m4.multiply(tr, rot), scale);
                    drawMesh(this.cylinder.vao, this.cylinder.len, model, p.color);

                    // Add tip sphere for the actively growing pipe
                    if (isLast && !p.stuck) {
                        let tipPos = [
                            seg.pos[0] + seg.dir[0] * len,
                            seg.pos[1] + seg.dir[1] * len,
                            seg.pos[2] + seg.dir[2] * len
                        ];
                        let mTip = this.m4.translation(tipPos);
                        drawMesh(this.sphere.vao, this.sphere.len, mTip, p.color);
                    }
                }
            }
        }

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
    },

    destroy(ctx) {
        const gl = ctx.gl;
        if (this.program) gl.deleteProgram(this.program);

        gl.deleteBuffer(this.sphere.pB); gl.deleteBuffer(this.sphere.nB); gl.deleteBuffer(this.sphere.iB); gl.deleteVertexArray(this.sphere.vao);
        gl.deleteBuffer(this.cylinder.pB); gl.deleteBuffer(this.cylinder.nB); gl.deleteBuffer(this.cylinder.iB); gl.deleteVertexArray(this.cylinder.vao);

        this.program = null;
    }
});
