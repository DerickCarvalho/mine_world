import { WORLD_CONFIG, clampNumber } from '../world/WorldConfig.js';
import { createCameraTransform, worldToCameraSpace } from '../core/CameraMath.js';

const FOG_COLOR = { r: 166, g: 206, b: 228 };
const SKY_TOP = '#76c7ff';
const SKY_BOTTOM = '#caecff';
const HORIZON = '#8bb873';
const BLOCK_HIGHLIGHT = 'rgba(255, 248, 171, 0.92)';

function mixColor(start, end, amount) {
    return Math.round(start + (end - start) * amount);
}

function projectPoint(point, transform, renderer) {
    const cameraPoint = worldToCameraSpace(point, transform);
    if (cameraPoint.z <= WORLD_CONFIG.nearPlane) {
        return null;
    }

    const scale = renderer.focalLength / cameraPoint.z;
    return {
        x: renderer.viewportWidth * 0.5 + cameraPoint.x * scale,
        y: renderer.viewportHeight * 0.5 - cameraPoint.y * scale,
        depth: cameraPoint.z
    };
}

function solveAffineTransform(source, destination) {
    const denominator = source[0].u * (source[1].v - source[2].v)
        + source[1].u * (source[2].v - source[0].v)
        + source[2].u * (source[0].v - source[1].v);

    if (Math.abs(denominator) < 0.000001) {
        return null;
    }

    const a = (destination[0].x * (source[1].v - source[2].v)
        + destination[1].x * (source[2].v - source[0].v)
        + destination[2].x * (source[0].v - source[1].v)) / denominator;
    const b = (destination[0].y * (source[1].v - source[2].v)
        + destination[1].y * (source[2].v - source[0].v)
        + destination[2].y * (source[0].v - source[1].v)) / denominator;
    const c = (destination[0].x * (source[2].u - source[1].u)
        + destination[1].x * (source[0].u - source[2].u)
        + destination[2].x * (source[1].u - source[0].u)) / denominator;
    const d = (destination[0].y * (source[2].u - source[1].u)
        + destination[1].y * (source[0].u - source[2].u)
        + destination[2].y * (source[1].u - source[0].u)) / denominator;
    const e = (destination[0].x * (source[1].u * source[2].v - source[2].u * source[1].v)
        + destination[1].x * (source[2].u * source[0].v - source[0].u * source[2].v)
        + destination[2].x * (source[0].u * source[1].v - source[1].u * source[0].v)) / denominator;
    const f = (destination[0].y * (source[1].u * source[2].v - source[2].u * source[1].v)
        + destination[1].y * (source[2].u * source[0].v - source[0].u * source[2].v)
        + destination[2].y * (source[0].u * source[1].v - source[1].u * source[0].v)) / denominator;

    return { a: a, b: b, c: c, d: d, e: e, f: f };
}

function polygonArea(points) {
    let total = 0;

    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        total += current.x * next.y - next.x * current.y;
    }

    return Math.abs(total) * 0.5;
}

export class SoftwareRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d', { alpha: false });

        if (!this.context) {
            throw new Error('O navegador nao conseguiu iniciar o renderer 2D do MineWorld.');
        }

        this.viewportWidth = 1;
        this.viewportHeight = 1;
        this.focalLength = 1;
        this.gradient = null;
        this.renderScale = 1;
        this.minRenderScale = 0.68;
        this.textureEntries = new Map();
        this.setPerformanceProfile({});
        this.resize();
    }

    setPerformanceProfile(profile) {
        const normalizedProfile = profile && typeof profile === 'object' ? profile : {};
        const hardwareConcurrency = Math.max(2, Math.min(16, Math.floor(Number(normalizedProfile.hardwareConcurrency || 4))));
        const deviceMemory = Math.max(2, Math.min(16, Number(normalizedProfile.deviceMemory || 4)));
        const turboEnabled = normalizedProfile.turboEnabled === true;

        this.textureMaxDistance = turboEnabled
            ? (hardwareConcurrency >= 8 ? 34 : 28)
            : (hardwareConcurrency >= 8 ? 28 : 22);
        this.texturedPolygonBudget = turboEnabled
            ? Math.round(hardwareConcurrency * 110 + deviceMemory * 35)
            : Math.round(hardwareConcurrency * 70 + deviceMemory * 18);
        this.minTexturedArea = turboEnabled ? 22 : 32;
        this.minRenderScale = turboEnabled ? 0.58 : 0.68;
        this.setRenderScale(this.renderScale);
    }

    prepareTextureSurface(image) {
        const maxTextureSize = 24;
        const largestDimension = Math.max(image.width || 1, image.height || 1);
        const scale = largestDimension > maxTextureSize ? maxTextureSize / largestDimension : 1;
        const width = Math.max(1, Math.round((image.width || 1) * scale));
        const height = Math.max(1, Math.round((image.height || 1) * scale));
        const surface = document.createElement('canvas');
        surface.width = width;
        surface.height = height;
        const context = surface.getContext('2d', { alpha: true });

        if (context) {
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
        }

        return surface;
    }

    setTextureCatalog(catalog) {
        const queue = [];

        Object.values(catalog || {}).forEach((faces) => {
            ['top', 'side', 'bottom'].forEach((face) => {
                const texture = faces && faces[face] ? faces[face] : null;
                if (!texture || !texture.path || this.textureEntries.has(texture.path)) {
                    return;
                }

                const image = new Image();
                image.decoding = 'async';
                const entry = {
                    image: image,
                    source: null,
                    ready: false,
                    failed: false
                };
                this.textureEntries.set(texture.path, entry);
                queue.push(new Promise((resolve) => {
                    image.onload = () => {
                        entry.source = this.prepareTextureSurface(image);
                        entry.ready = true;
                        resolve();
                    };
                    image.onerror = function () {
                        entry.failed = true;
                        resolve();
                    };
                    image.src = new URL(texture.path, window.ENV.DOMAIN + '/').toString();
                }));
            });
        });

        return Promise.all(queue);
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
        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || window.innerWidth));
        const height = Math.max(1, Math.round(rect.height || window.innerHeight));
        const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const internalScale = pixelRatio * this.renderScale;

        this.canvas.width = Math.max(1, Math.round(width * internalScale));
        this.canvas.height = Math.max(1, Math.round(height * internalScale));
        this.context.setTransform(internalScale, 0, 0, internalScale, 0, 0);
        this.context.imageSmoothingEnabled = false;
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.focalLength = width / (2 * Math.tan((WORLD_CONFIG.fov * Math.PI / 180) / 2));
        this.gradient = this.context.createLinearGradient(0, 0, 0, height);
        this.gradient.addColorStop(0, SKY_TOP);
        this.gradient.addColorStop(0.56, SKY_BOTTOM);
        this.gradient.addColorStop(1, HORIZON);
    }

    isChunkVisible(transform, chunk) {
        if (!chunk || !chunk.center || !Number.isFinite(chunk.radius)) {
            return true;
        }

        const center = worldToCameraSpace(chunk.center, transform);
        const radius = chunk.radius;

        if (center.z + radius <= WORLD_CONFIG.nearPlane) {
            return false;
        }

        if (center.z - radius > WORLD_CONFIG.farPlane) {
            return false;
        }

        const safeDepth = Math.max(center.z, WORLD_CONFIG.nearPlane);
        const safeExtentDepth = Math.max(safeDepth - radius, WORLD_CONFIG.nearPlane);
        const projectedRadius = (this.focalLength * radius) / safeExtentDepth;
        const screenX = this.viewportWidth * 0.5 + center.x * (this.focalLength / safeDepth);
        const screenY = this.viewportHeight * 0.5 - center.y * (this.focalLength / safeDepth);

        return !(screenX + projectedRadius < -180
            || screenX - projectedRadius > this.viewportWidth + 180
            || screenY + projectedRadius < -180
            || screenY - projectedRadius > this.viewportHeight + 180);
    }

    render(camera, chunks, highlight, entities) {
        if (!camera) {
            return;
        }

        this.drawBackground();

        const polygons = [];
        const transform = createCameraTransform(camera);
        const renderables = [];

        (chunks || []).forEach(function (chunk) {
            renderables.push(chunk);
        });
        (entities || []).forEach(function (entity) {
            renderables.push(entity);
        });

        for (const chunk of renderables) {
            if (!this.isChunkVisible(transform, chunk)) {
                continue;
            }

            for (const face of chunk.faces) {
                const facing = (camera.position.x - face.center.x) * face.normal.x
                    + (camera.position.y - face.center.y) * face.normal.y
                    + (camera.position.z - face.center.z) * face.normal.z;

                if (facing <= 0) {
                    continue;
                }

                let depthSum = 0;
                let minX = Number.POSITIVE_INFINITY;
                let minY = Number.POSITIVE_INFINITY;
                let maxX = Number.NEGATIVE_INFINITY;
                let maxY = Number.NEGATIVE_INFINITY;
                const points = [];
                let clipped = false;

                for (const vertex of face.vertices) {
                    const cameraPoint = worldToCameraSpace(vertex, transform);
                    if (cameraPoint.z <= WORLD_CONFIG.nearPlane) {
                        clipped = true;
                        break;
                    }

                    const scale = this.focalLength / cameraPoint.z;
                    const screenX = this.viewportWidth * 0.5 + cameraPoint.x * scale;
                    const screenY = this.viewportHeight * 0.5 - cameraPoint.y * scale;

                    depthSum += cameraPoint.z;
                    minX = Math.min(minX, screenX);
                    minY = Math.min(minY, screenY);
                    maxX = Math.max(maxX, screenX);
                    maxY = Math.max(maxY, screenY);
                    points.push({ x: screenX, y: screenY });
                }

                if (clipped) {
                    continue;
                }

                const depth = depthSum / face.vertices.length;
                if (depth > WORLD_CONFIG.farPlane) {
                    continue;
                }

                if (maxX < -120 || minX > this.viewportWidth + 120 || maxY < -120 || minY > this.viewportHeight + 120) {
                    continue;
                }

                const area = polygonArea(points);
                if (area < 0.5) {
                    continue;
                }

                const fog = clampNumber((depth - 30) / (WORLD_CONFIG.farPlane - 26), 0, 1);
                polygons.push({
                    points: points,
                    depth: depth,
                    area: area,
                    fogAmount: fog,
                    shade: face.shade,
                    fill: this.buildColor(face.color, face.shade, fog, face.alpha || 1),
                    stroke: this.buildColor(face.color, face.shade * 0.64, fog, Math.min(1, (face.alpha || 1) * 0.95)),
                    textureKey: face.textureKey || null,
                    uvs: face.uvs || null
                });
            }
        }

        polygons.sort(function (left, right) {
            return right.depth - left.depth;
        });

        this.context.lineJoin = 'round';
        this.context.imageSmoothingEnabled = false;

        let texturedPolygons = 0;
        for (const polygon of polygons) {
            const textureEntry = polygon.textureKey ? this.textureEntries.get(polygon.textureKey) : null;
            const canUseTexture = textureEntry
                && textureEntry.ready
                && textureEntry.source
                && polygon.uvs
                && polygon.depth <= this.textureMaxDistance
                && polygon.area >= this.minTexturedArea
                && texturedPolygons < this.texturedPolygonBudget;

            if (canUseTexture) {
                this.drawTexturedQuad(polygon.points, polygon.uvs, textureEntry.source);
                this.applyTextureLighting(polygon.points, polygon.shade, polygon.fogAmount);
                texturedPolygons += 1;
                continue;
            }

            this.context.beginPath();
            this.context.moveTo(polygon.points[0].x, polygon.points[0].y);

            for (let index = 1; index < polygon.points.length; index += 1) {
                this.context.lineTo(polygon.points[index].x, polygon.points[index].y);
            }

            this.context.closePath();
            this.context.fillStyle = polygon.fill;
            this.context.fill();
            this.context.strokeStyle = polygon.stroke;
            this.context.lineWidth = 1;
            this.context.stroke();
        }

        if (highlight && highlight.block) {
            this.drawBlockOutline(transform, highlight.block);
        }
    }

    drawTexturedQuad(points, uvs, source) {
        if (!source || points.length < 4 || !Array.isArray(uvs) || uvs.length < 4) {
            return;
        }

        const sourceWidth = source.width || 1;
        const sourceHeight = source.height || 1;
        const mappedUvs = uvs.map(function (uv) {
            return {
                u: Number(uv.u || 0) * sourceWidth,
                v: Number(uv.v || 0) * sourceHeight
            };
        });

        this.drawTexturedTriangle(
            [points[0], points[1], points[2]],
            [mappedUvs[0], mappedUvs[1], mappedUvs[2]],
            source
        );
        this.drawTexturedTriangle(
            [points[0], points[2], points[3]],
            [mappedUvs[0], mappedUvs[2], mappedUvs[3]],
            source
        );
    }

    drawTexturedTriangle(destination, source, image) {
        const matrix = solveAffineTransform(source, destination);
        if (!matrix) {
            return;
        }

        this.context.save();
        this.context.beginPath();
        this.context.moveTo(destination[0].x, destination[0].y);
        this.context.lineTo(destination[1].x, destination[1].y);
        this.context.lineTo(destination[2].x, destination[2].y);
        this.context.closePath();
        this.context.clip();
        this.context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
        this.context.drawImage(image, 0, 0);
        this.context.restore();
    }

    applyTextureLighting(points, shade, fogAmount) {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);

        for (let index = 1; index < points.length; index += 1) {
            this.context.lineTo(points[index].x, points[index].y);
        }

        this.context.closePath();

        if (shade < 1) {
            this.context.fillStyle = 'rgba(0, 0, 0, ' + ((1 - shade) * 0.72) + ')';
            this.context.fill();
        }

        if (fogAmount > 0) {
            this.context.fillStyle = 'rgba(' + FOG_COLOR.r + ', ' + FOG_COLOR.g + ', ' + FOG_COLOR.b + ', ' + (fogAmount * 0.9) + ')';
            this.context.fill();
        }

        this.context.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        this.context.lineWidth = 1;
        this.context.stroke();
        this.context.restore();
    }

    drawBlockOutline(transform, block) {
        const vertices = [
            { x: block.x, y: block.y, z: block.z },
            { x: block.x + 1, y: block.y, z: block.z },
            { x: block.x + 1, y: block.y + 1, z: block.z },
            { x: block.x, y: block.y + 1, z: block.z },
            { x: block.x, y: block.y, z: block.z + 1 },
            { x: block.x + 1, y: block.y, z: block.z + 1 },
            { x: block.x + 1, y: block.y + 1, z: block.z + 1 },
            { x: block.x, y: block.y + 1, z: block.z + 1 }
        ];
        const projected = vertices.map((vertex) => projectPoint(vertex, transform, this));
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        this.context.strokeStyle = BLOCK_HIGHLIGHT;
        this.context.lineWidth = 2;

        for (const edge of edges) {
            const start = projected[edge[0]];
            const end = projected[edge[1]];

            if (!start || !end) {
                continue;
            }

            this.context.beginPath();
            this.context.moveTo(start.x, start.y);
            this.context.lineTo(end.x, end.y);
            this.context.stroke();
        }
    }

    buildColor(color, shade, fogAmount, alpha) {
        const litRed = Math.round(color.r * shade);
        const litGreen = Math.round(color.g * shade);
        const litBlue = Math.round(color.b * shade);

        return 'rgba('
            + mixColor(litRed, FOG_COLOR.r, fogAmount) + ','
            + mixColor(litGreen, FOG_COLOR.g, fogAmount) + ','
            + mixColor(litBlue, FOG_COLOR.b, fogAmount) + ','
            + alpha + ')';
    }

    drawBackground() {
        this.context.fillStyle = this.gradient;
        this.context.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.context.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this.context.fillRect(0, this.viewportHeight * 0.64, this.viewportWidth, this.viewportHeight * 0.36);
    }

    destroy() {
        this.context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    }
}