import { WORLD_CONFIG, clampNumber } from '../world/WorldConfig.js';

const FOG_COLOR = { r: 154, g: 208, b: 241 };
const SKY_TOP = '#7ec7ff';
const SKY_BOTTOM = '#d0f0ff';
const HORIZON = '#93d46d';

function mixColor(start, end, amount) {
    return Math.round(start + (end - start) * amount);
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
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || window.innerWidth));
        const height = Math.max(1, Math.round(rect.height || window.innerHeight));
        const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        this.canvas.width = Math.round(width * pixelRatio);
        this.canvas.height = Math.round(height * pixelRatio);
        this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.focalLength = width / (2 * Math.tan((WORLD_CONFIG.fov * Math.PI / 180) / 2));
        this.gradient = this.context.createLinearGradient(0, 0, 0, height);
        this.gradient.addColorStop(0, SKY_TOP);
        this.gradient.addColorStop(0.6, SKY_BOTTOM);
        this.gradient.addColorStop(1, HORIZON);
    }

    render(camera, chunks) {
        if (!camera) {
            return;
        }

        this.drawBackground();

        const polygons = [];
        const sinYaw = Math.sin(-camera.yaw);
        const cosYaw = Math.cos(-camera.yaw);
        const sinPitch = Math.sin(-camera.pitch);
        const cosPitch = Math.cos(-camera.pitch);

        for (const chunk of chunks) {
            for (const face of chunk.faces) {
                const facing = (camera.position.x - face.center.x) * face.normal.x
                    + (camera.position.y - face.center.y) * face.normal.y
                    + (camera.position.z - face.center.z) * face.normal.z;

                if (facing <= 0) {
                    continue;
                }

                let allBehind = true;
                let depthSum = 0;
                let minX = Number.POSITIVE_INFINITY;
                let minY = Number.POSITIVE_INFINITY;
                let maxX = Number.NEGATIVE_INFINITY;
                let maxY = Number.NEGATIVE_INFINITY;
                const points = [];

                for (const vertex of face.vertices) {
                    const dx = vertex.x - camera.position.x;
                    const dy = vertex.y - camera.position.y;
                    const dz = vertex.z - camera.position.z;
                    const yawX = dx * cosYaw - dz * sinYaw;
                    const yawZ = dx * sinYaw + dz * cosYaw;
                    const pitchY = dy * cosPitch - yawZ * sinPitch;
                    const pitchZ = dy * sinPitch + yawZ * cosPitch;

                    if (pitchZ > WORLD_CONFIG.nearPlane) {
                        allBehind = false;
                    }

                    const safeDepth = Math.max(pitchZ, WORLD_CONFIG.nearPlane);
                    const scale = this.focalLength / safeDepth;
                    const screenX = this.viewportWidth * 0.5 + yawX * scale;
                    const screenY = this.viewportHeight * 0.5 - pitchY * scale;

                    depthSum += safeDepth;
                    minX = Math.min(minX, screenX);
                    minY = Math.min(minY, screenY);
                    maxX = Math.max(maxX, screenX);
                    maxY = Math.max(maxY, screenY);
                    points.push({ x: screenX, y: screenY });
                }

                const depth = depthSum / face.vertices.length;
                if (allBehind || depth > WORLD_CONFIG.farPlane) {
                    continue;
                }

                if (maxX < -120 || minX > this.viewportWidth + 120 || maxY < -120 || minY > this.viewportHeight + 120) {
                    continue;
                }

                const fog = clampNumber((depth - 42) / (WORLD_CONFIG.farPlane - 42), 0, 1);
                polygons.push({
                    points: points,
                    depth: depth,
                    fill: this.buildColor(face.color, face.shade, fog),
                    stroke: this.buildColor(face.color, face.shade * 0.62, fog)
                });
            }
        }

        polygons.sort(function (left, right) {
            return right.depth - left.depth;
        });

        this.context.lineJoin = 'round';

        for (const polygon of polygons) {
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
    }

    buildColor(color, shade, fogAmount) {
        const litRed = Math.round(color.r * shade);
        const litGreen = Math.round(color.g * shade);
        const litBlue = Math.round(color.b * shade);

        return 'rgb('
            + mixColor(litRed, FOG_COLOR.r, fogAmount) + ','
            + mixColor(litGreen, FOG_COLOR.g, fogAmount) + ','
            + mixColor(litBlue, FOG_COLOR.b, fogAmount) + ')';
    }

    drawBackground() {
        this.context.fillStyle = this.gradient;
        this.context.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.context.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this.context.fillRect(0, this.viewportHeight * 0.62, this.viewportWidth, this.viewportHeight * 0.38);
    }

    destroy() {
        this.context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    }
}
