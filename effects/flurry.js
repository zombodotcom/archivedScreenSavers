/**
 * Mac OS X Flurry Emulation
 * Multi-layered colorful particle trails using a ping-pong history buffer.
 */

SCRN.register({
    id: 'flurry',
    name: 'Flurry',

    init(ctx) {
        const gl = ctx.gl;
        this.width = Math.floor(ctx.width / 2); // downsample for performance and slight blur
        this.height = Math.floor(ctx.height / 2);

        // Fullscreen Quad VS
        const vs = `#version 300 es
            in vec2 a_pos;
            out vec2 v_uv;
            void main() {
                v_uv = a_pos * 0.5 + 0.5;
                gl_Position = vec4(a_pos, 0.0, 1.0);
            }`;

        // Particle generation FS
        const flurryFs = `#version 300 es
            precision highp float;
            in vec2 v_uv;
            out vec4 fragColor;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform sampler2D u_prev; // The history buffer

            // Flurry stream math
            vec2 getFlurryPos(float t, float offset) {
                float r = 0.4 * sin(t * 0.7 + offset);
                float x = r * cos(t * 1.3 + offset * 2.0);
                float y = r * sin(t * 0.9 + offset * 1.5) + 0.1 * sin(t * 2.0);
                return vec2(x, y);
            }

            vec3 getFlurryColor(float t, float offset) {
                return 0.5 + 0.5 * cos(t * 0.5 + offset + vec3(0, 2, 4));
            }

            void main() {
                vec2 uv = v_uv;
                vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
                vec2 p = (uv - 0.5) * aspect;

                // Read previous frame, fade it out, slightly scale it out to create trailing blur
                vec2 centerDist = uv - 0.5;
                vec2 uvPrev = uv - centerDist * 0.002;
                vec3 prevCol = texture(u_prev, uvPrev).rgb;
                
                // Additive trails decay
                prevCol *= 0.95; 

                vec3 col = prevCol;

                // Draw new streams
                for(int i=0; i<3; i++) {
                    float offset = float(i) * 2.0;
                    vec2 pos = getFlurryPos(u_time, offset);
                    
                    float dist = length(p - pos);
                    float intensity = exp(-dist * 80.0) * 0.3; // Soft glowing core
                    
                    col += intensity * getFlurryColor(u_time, offset);
                }

                fragColor = vec4(col, 1.0);
            }`;

        // Render to screen FS
        const screenFs = `#version 300 es
            precision highp float;
            in vec2 v_uv;
            out vec4 fragColor;
            uniform sampler2D u_tex;
            void main() {
                fragColor = texture(u_tex, v_uv);
            }`;

        this.flurryProg = ctx.createProgram(vs, flurryFs);
        this.screenProg = ctx.createProgram(vs, screenFs);

        this.fUnifs = ctx.getUniforms(this.flurryProg, ['u_time', 'u_resolution', 'u_prev']);
        this.sUnifs = ctx.getUniforms(this.screenProg, ['u_tex']);

        // Framebuffers for ping-pong
        this.createFBOs(gl);
        this.ping = 0;
    },

    createFBOs(gl) {
        this.fbos = [];
        this.texs = [];
        for (let i = 0; i < 2; i++) {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

            this.texs.push(tex);
            this.fbos.push(fbo);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    resize(ctx) {
        const gl = ctx.gl;
        this.width = Math.floor(ctx.width / 2);
        this.height = Math.floor(ctx.height / 2);

        // Clean up old
        this.fbos.forEach(f => gl.deleteFramebuffer(f));
        this.texs.forEach(t => gl.deleteTexture(t));

        this.createFBOs(gl);
    },

    draw(ctx, dt) {
        const gl = ctx.gl;
        const pong = 1 - this.ping;

        gl.disable(gl.DEPTH_TEST);

        // 1. Draw to FBO (Update trails)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos[pong]);
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.flurryProg);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texs[this.ping]);
        gl.uniform1i(this.fUnifs.u_prev, 0);

        gl.uniform1f(this.fUnifs.u_time, ctx.time);
        gl.uniform2f(this.fUnifs.u_resolution, this.width, this.height);

        ctx.drawQuad();

        // 2. Draw FBO to Screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, ctx.width, ctx.height);
        gl.useProgram(this.screenProg);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texs[pong]);
        gl.uniform1i(this.sUnifs.u_tex, 0);

        ctx.drawQuad();

        this.ping = pong;
    },

    destroy(ctx) {
        const gl = ctx.gl;
        if (this.flurryProg) gl.deleteProgram(this.flurryProg);
        if (this.screenProg) gl.deleteProgram(this.screenProg);
        this.fbos.forEach(f => gl.deleteFramebuffer(f));
        this.texs.forEach(t => gl.deleteTexture(t));
        this.flurryProg = null;
    }
});
