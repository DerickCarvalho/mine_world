import { WORLD_CONFIG, clampNumber } from '../../world/WorldConfig.js';

const FOG_COLOR = [166 / 255, 206 / 255, 228 / 255];
const SKY_COLOR = [118 / 255, 199 / 255, 255 / 255, 1];
const BLOCK_HIGHLIGHT = [255 / 255, 248 / 255, 171 / 255, 0.92];
const TRIANGLE_INDICES = [0, 1, 2, 0, 2, 3];
const VERTEX_COMPONENTS = 9;
const VERTEX_STRIDE = VERTEX_COMPONENTS * Float32Array.BYTES_PER_ELEMENT;

const VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec4 aColor;
layout(location = 2) in vec2 aUv;

uniform vec3 uCameraPosition;
uniform vec2 uYaw;
uniform vec2 uPitch;
uniform vec4 uProjection;

out vec4 vColor;
out vec2 vUv;
out float vDepth;

void main() {
    vec3 delta = aPosition - uCameraPosition;
    float cameraX = delta.x * uYaw.y - delta.z * uYaw.x;
    float yawZ = delta.x * uYaw.x + delta.z * uYaw.y;
    float cameraY = delta.y * uPitch.y - yawZ * uPitch.x;
    float cameraZ = delta.y * uPitch.x + yawZ * uPitch.y;

    gl_Position = vec4(cameraX * uProjection.x, cameraY * uProjection.y,
        cameraZ * uProjection.z + uProjection.w, cameraZ);
    vColor = aColor;
    vUv = aUv;
    vDepth = cameraZ;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform bool uUseTexture;
uniform vec3 uFogColor;
uniform vec2 uFogRange;

in vec4 vColor;
in vec2 vUv;
in float vDepth;
out vec4 outputColor;

void main() {
    vec4 color = vColor;
    if (uUseTexture) {
        color *= texture(uTexture, vUv);
    }
    if (color.a <= 0.01) {
        discard;
    }

    float fog = clamp((vDepth - uFogRange.x) / (uFogRange.y - uFogRange.x), 0.0, 1.0);
    outputColor = vec4(mix(color.rgb, uFogColor, fog * 0.9), color.a);
}`;

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Falha desconhecida ao compilar shader.';
        gl.deleteShader(shader);
        throw new Error(message);
    }

    return shader;
}

function createProgram(gl) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program) || 'Falha desconhecida ao vincular shaders.';
        gl.deleteProgram(program);
        throw new Error(message);
    }

    return program;
}

function getTextureUrl(path) {
    const baseUrl = window.ENV && window.ENV.DOMAIN ? window.ENV.DOMAIN + '/' : window.location.href;
    return new URL(path, baseUrl).toString();
}

function appendFace(target, face) {
    if (!face || !Array.isArray(face.vertices) || face.vertices.length < 4) {
        return;
    }

    const color = face.color || { r: 255, g: 255, b: 255 };
    const shade = Number.isFinite(face.shade) ? face.shade : 1;
    const alpha = Number.isFinite(face.alpha) ? face.alpha : 1;
    const uvs = Array.isArray(face.uvs) && face.uvs.length >= 4 ? face.uvs : null;

    for (const index of TRIANGLE_INDICES) {
        const vertex = face.vertices[index];
        const uv = uvs ? uvs[index] : null;
        target.push(
            Number(vertex.x), Number(vertex.y), Number(vertex.z),
            clampNumber((Number(color.r) / 255) * shade, 0, 1),
            clampNumber((Number(color.g) / 255) * shade, 0, 1),
            clampNumber((Number(color.b) / 255) * shade, 0, 1),
            clampNumber(alpha, 0, 1),
            uv ? Number(uv.u || 0) : 0,
            uv ? Number(uv.v || 0) : 0
        );
    }
}

function groupFaces(faces) {
    const groups = new Map();

    for (const face of faces || []) {
        const transparent = Number.isFinite(face.alpha) && face.alpha < 0.999;
        const textureKey = face.textureKey || '';
        const key = (transparent ? 'transparent|' : 'opaque|') + textureKey;

        if (!groups.has(key)) {
            groups.set(key, {
                transparent: transparent,
                textureKey: textureKey,
                vertices: []
            });
        }
        appendFace(groups.get(key).vertices, face);
    }

    return Array.from(groups.values());
}

function createOutlineVertices(block, color) {
    if (!block) {
        return [];
    }

    const inset = 0.002;
    const minX = Number(block.x) - inset;
    const minY = Number(block.y) - inset;
    const minZ = Number(block.z) - inset;
    const maxX = Number(block.x) + 1 + inset;
    const maxY = Number(block.y) + 1 + inset;
    const maxZ = Number(block.z) + 1 + inset;
    const corners = [
        [minX, minY, minZ], [maxX, minY, minZ], [maxX, maxY, minZ], [minX, maxY, minZ],
        [minX, minY, maxZ], [maxX, minY, maxZ], [maxX, maxY, maxZ], [minX, maxY, maxZ]
    ];
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    const vertices = [];

    for (const edge of edges) {
        for (const index of edge) {
            const point = corners[index];
            vertices.push(point[0], point[1], point[2], color[0], color[1], color[2], color[3], 0, 0);
        }
    }

    return vertices;
}

export class WebGLRenderer {
    static isSupported() {
        try {
            const probe = document.createElement('canvas');
            const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
            if (!gl) {
                return false;
            }
            const program = createProgram(gl);
            gl.deleteProgram(program);
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) {
                loseContext.loseContext();
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: true,
            depth: true,
            failIfMajorPerformanceCaveat: true,
            premultipliedAlpha: false
        });

        if (!this.gl) {
            throw new Error('O navegador nao conseguiu iniciar o renderer WebGL 2 do MineWorld.');
        }

        this.program = createProgram(this.gl);
        this.uniforms = {
            cameraPosition: this.gl.getUniformLocation(this.program, 'uCameraPosition'),
            yaw: this.gl.getUniformLocation(this.program, 'uYaw'),
            pitch: this.gl.getUniformLocation(this.program, 'uPitch'),
            projection: this.gl.getUniformLocation(this.program, 'uProjection'),
            texture: this.gl.getUniformLocation(this.program, 'uTexture'),
            useTexture: this.gl.getUniformLocation(this.program, 'uUseTexture'),
            fogColor: this.gl.getUniformLocation(this.program, 'uFogColor'),
            fogRange: this.gl.getUniformLocation(this.program, 'uFogRange')
        };
        this.chunkResources = new Map();
        this.textureEntries = new Map();
        this.dynamicResources = [];
        this.outlineResource = this.createResource(new Float32Array(0), this.gl.DYNAMIC_DRAW);
        this.renderScale = 1;
        this.minRenderScale = 0.68;
        this.destroyed = false;
        this.setPerformanceProfile({});
        this.configureContext();
        this.resize();
    }

    configureContext() {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);
        gl.clearColor(SKY_COLOR[0], SKY_COLOR[1], SKY_COLOR[2], SKY_COLOR[3]);
        gl.uniform1i(this.uniforms.texture, 0);
        gl.uniform3fv(this.uniforms.fogColor, FOG_COLOR);
        gl.uniform2f(this.uniforms.fogRange, 30, WORLD_CONFIG.farPlane);
    }

    setPerformanceProfile(profile) {
        const normalizedProfile = profile && typeof profile === 'object' ? profile : {};
        this.minRenderScale = normalizedProfile.turboEnabled === true ? 0.58 : 0.68;
        this.setRenderScale(this.renderScale);
    }

    setTextureCatalog(catalog) {
        const queue = [];

        Object.values(catalog || {}).forEach((faces) => {
            ['top', 'side', 'bottom'].forEach((face) => {
                const texture = faces && faces[face] ? faces[face] : null;
                if (!texture || !texture.path || this.textureEntries.has(texture.path)) {
                    return;
                }

                const entry = { texture: null, ready: false, failed: false };
                this.textureEntries.set(texture.path, entry);
                queue.push(new Promise((resolve) => {
                    const image = new Image();
                    image.decoding = 'async';
                    image.onload = () => {
                        if (!this.destroyed) {
                            entry.texture = this.createTexture(image);
                            entry.ready = Boolean(entry.texture);
                        }
                        resolve();
                    };
                    image.onerror = () => {
                        entry.failed = true;
                        resolve();
                    };
                    image.src = getTextureUrl(texture.path);
                }));
            });
        });

        return Promise.all(queue);
    }

    createTexture(image) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    setRenderScale(scale) {
        const normalized = clampNumber(Number(scale || 1), this.minRenderScale, 1);
        if (Math.abs(normalized - this.renderScale) < 0.01) {
            return;
        }

        this.renderScale = normalized;
        this.resize();
    }

    resize() {
        if (this.destroyed) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || window.innerWidth));
        const height = Math.max(1, Math.round(rect.height || window.innerHeight));
        const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const internalScale = pixelRatio * this.renderScale;
        const bufferWidth = Math.max(1, Math.round(width * internalScale));
        const bufferHeight = Math.max(1, Math.round(height * internalScale));

        if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
            this.canvas.width = bufferWidth;
            this.canvas.height = bufferHeight;
        }
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.gl.viewport(0, 0, bufferWidth, bufferHeight);
    }

    createResource(vertices, usage = this.gl.STATIC_DRAW) {
        const gl = this.gl;
        const vao = gl.createVertexArray();
        const buffer = gl.createBuffer();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, usage);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, VERTEX_STRIDE, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, VERTEX_STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, VERTEX_STRIDE, 7 * Float32Array.BYTES_PER_ELEMENT);
        gl.bindVertexArray(null);

        return {
            vao: vao,
            buffer: buffer,
            count: vertices.length / VERTEX_COMPONENTS,
            transparent: false,
            textureKey: ''
        };
    }

    createRenderableResources(renderable, usage = this.gl.STATIC_DRAW) {
        return groupFaces(renderable && renderable.faces).map((group) => {
            const resource = this.createResource(new Float32Array(group.vertices), usage);
            resource.transparent = group.transparent;
            resource.textureKey = group.textureKey;
            resource.center = renderable.center || null;
            return resource;
        });
    }

    deleteResource(resource) {
        if (!resource) {
            return;
        }
        this.gl.deleteBuffer(resource.buffer);
        this.gl.deleteVertexArray(resource.vao);
    }

    deleteResources(resources) {
        for (const resource of resources || []) {
            this.deleteResource(resource);
        }
    }

    syncChunkResources(chunks) {
        const activeKeys = new Set();

        for (const chunk of chunks || []) {
            if (!chunk || !chunk.key) {
                continue;
            }
            activeKeys.add(chunk.key);
            const cached = this.chunkResources.get(chunk.key);
            if (cached && cached.faces === chunk.faces) {
                continue;
            }
            if (cached) {
                this.deleteResources(cached.resources);
            }
            this.chunkResources.set(chunk.key, {
                faces: chunk.faces,
                resources: this.createRenderableResources(chunk)
            });
        }

        for (const [key, cached] of this.chunkResources) {
            if (!activeKeys.has(key)) {
                this.deleteResources(cached.resources);
                this.chunkResources.delete(key);
            }
        }
    }

    updateCamera(camera) {
        const gl = this.gl;
        const yaw = Number(camera.yaw || 0);
        const pitch = clampNumber(Number(camera.pitch || 0), -1.555, 1.555);
        const fovRadians = WORLD_CONFIG.fov * Math.PI / 180;
        const focal = 1 / Math.tan(fovRadians * 0.5);
        const aspect = Math.max(0.001, this.canvas.width / this.canvas.height);
        const near = WORLD_CONFIG.nearPlane;
        const far = WORLD_CONFIG.farPlane;

        gl.uniform3f(this.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z);
        gl.uniform2f(this.uniforms.yaw, Math.sin(-yaw), Math.cos(-yaw));
        gl.uniform2f(this.uniforms.pitch, Math.sin(pitch), Math.cos(pitch));
        gl.uniform4f(
            this.uniforms.projection,
            focal / aspect,
            focal,
            (far + near) / (far - near),
            (-2 * far * near) / (far - near)
        );
    }

    drawResource(resource, mode = this.gl.TRIANGLES) {
        if (!resource || resource.count <= 0) {
            return;
        }

        const gl = this.gl;
        const textureEntry = resource.textureKey ? this.textureEntries.get(resource.textureKey) : null;
        const useTexture = Boolean(textureEntry && textureEntry.ready && textureEntry.texture);
        gl.uniform1i(this.uniforms.useTexture, useTexture ? 1 : 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, useTexture ? textureEntry.texture : null);
        gl.bindVertexArray(resource.vao);
        gl.drawArrays(mode, 0, resource.count);
    }

    drawPass(resources, transparent, cameraPosition) {
        const matchingResources = resources.filter((resource) => resource.transparent === transparent);
        if (transparent && cameraPosition) {
            matchingResources.sort((left, right) => {
                const leftCenter = left.center || cameraPosition;
                const rightCenter = right.center || cameraPosition;
                const leftDistance = Math.hypot(
                    leftCenter.x - cameraPosition.x,
                    leftCenter.y - cameraPosition.y,
                    leftCenter.z - cameraPosition.z
                );
                const rightDistance = Math.hypot(
                    rightCenter.x - cameraPosition.x,
                    rightCenter.y - cameraPosition.y,
                    rightCenter.z - cameraPosition.z
                );
                return rightDistance - leftDistance;
            });
        }

        for (const resource of matchingResources) {
            this.drawResource(resource);
        }
    }

    drawOutlines(highlight) {
        const vertices = [];
        if (highlight && highlight.block) {
            vertices.push(...createOutlineVertices(highlight.block, BLOCK_HIGHLIGHT));
        }
        if (vertices.length === 0) {
            return;
        }

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.outlineResource.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        this.outlineResource.count = vertices.length / VERTEX_COMPONENTS;
        this.outlineResource.textureKey = '';
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        this.drawResource(this.outlineResource, gl.LINES);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
    }

    render(camera, chunks, highlight, entities) {
        if (!camera || this.destroyed) {
            return;
        }

        const gl = this.gl;
        this.syncChunkResources(chunks);
        this.deleteResources(this.dynamicResources);
        this.dynamicResources = [];
        for (const entity of entities || []) {
            this.dynamicResources.push(...this.createRenderableResources(entity, gl.DYNAMIC_DRAW));
        }

        const chunkResources = [];
        for (const cached of this.chunkResources.values()) {
            chunkResources.push(...cached.resources);
        }
        const resources = chunkResources.concat(this.dynamicResources);

        gl.useProgram(this.program);
        this.updateCamera(camera);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);
        gl.depthMask(true);
        this.drawPass(resources, false, camera.position);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        this.drawPass(resources, true, camera.position);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        this.drawOutlines(highlight);
        gl.bindVertexArray(null);
    }

    destroy() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;

        for (const cached of this.chunkResources.values()) {
            this.deleteResources(cached.resources);
        }
        this.chunkResources.clear();
        this.deleteResources(this.dynamicResources);
        this.dynamicResources = [];
        this.deleteResource(this.outlineResource);

        for (const entry of this.textureEntries.values()) {
            if (entry.texture) {
                this.gl.deleteTexture(entry.texture);
            }
        }
        this.textureEntries.clear();
        this.gl.deleteProgram(this.program);

        const loseContext = this.gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
            loseContext.loseContext();
        }
    }
}
