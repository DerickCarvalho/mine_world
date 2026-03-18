import { getFaceMaterial } from './ChunkMaterials.js';
import { WORLD_CONFIG, isWithinWorldBounds } from './WorldConfig.js';

function createFace(vertices, normal, material) {
    const center = vertices.reduce(function (accumulator, vertex) {
        accumulator.x += vertex.x;
        accumulator.y += vertex.y;
        accumulator.z += vertex.z;
        return accumulator;
    }, { x: 0, y: 0, z: 0 });

    center.x /= vertices.length;
    center.y /= vertices.length;
    center.z /= vertices.length;

    return {
        vertices: vertices,
        normal: normal,
        center: center,
        color: material.color,
        shade: material.shade
    };
}

function createChunkBounds(startX, startZ, minY, maxY) {
    const bounds = {
        minX: startX,
        maxX: startX + WORLD_CONFIG.chunkSize,
        minY: minY,
        maxY: maxY,
        minZ: startZ,
        maxZ: startZ + WORLD_CONFIG.chunkSize
    };

    const center = {
        x: (bounds.minX + bounds.maxX) * 0.5,
        y: (bounds.minY + bounds.maxY) * 0.5,
        z: (bounds.minZ + bounds.maxZ) * 0.5
    };

    const radius = Math.hypot(
        (bounds.maxX - bounds.minX) * 0.5,
        (bounds.maxY - bounds.minY) * 0.5,
        (bounds.maxZ - bounds.minZ) * 0.5
    );

    return {
        bounds: bounds,
        center: center,
        radius: radius
    };
}

export class ChunkMesher {
    constructor(terrainGenerator) {
        this.terrain = terrainGenerator;
    }

    generateChunk(chunkX, chunkZ) {
        const faces = [];
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        let minY = Number.POSITIVE_INFINITY;
        let maxY = 0;

        for (let offsetX = 0; offsetX < WORLD_CONFIG.chunkSize; offsetX += 1) {
            const worldX = startX + offsetX;
            if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                continue;
            }

            for (let offsetZ = 0; offsetZ < WORLD_CONFIG.chunkSize; offsetZ += 1) {
                const worldZ = startZ + offsetZ;
                if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                    continue;
                }

                const surfaceHeight = this.terrain.getSurfaceHeightAt(worldX, worldZ);
                if (surfaceHeight <= 0) {
                    continue;
                }

                minY = Math.min(minY, 0);
                maxY = Math.max(maxY, surfaceHeight);

                const topType = this.terrain.getBlockTypeAt(worldX, surfaceHeight - 1, worldZ);
                faces.push(createFace([
                    { x: worldX, y: surfaceHeight, z: worldZ },
                    { x: worldX + 1, y: surfaceHeight, z: worldZ },
                    { x: worldX + 1, y: surfaceHeight, z: worldZ + 1 },
                    { x: worldX, y: surfaceHeight, z: worldZ + 1 }
                ], { x: 0, y: 1, z: 0 }, getFaceMaterial(topType, 'top')));

                this.pushSideFace(faces, worldX, worldZ, surfaceHeight, worldX + 1, worldZ, 'east');
                this.pushSideFace(faces, worldX, worldZ, surfaceHeight, worldX - 1, worldZ, 'west');
                this.pushSideFace(faces, worldX, worldZ, surfaceHeight, worldX, worldZ - 1, 'north');
                this.pushSideFace(faces, worldX, worldZ, surfaceHeight, worldX, worldZ + 1, 'south');
            }
        }

        const chunkGeometry = createChunkBounds(startX, startZ, minY === Number.POSITIVE_INFINITY ? 0 : minY, maxY);

        return {
            key: chunkX + ',' + chunkZ,
            chunkX: chunkX,
            chunkZ: chunkZ,
            faces: faces,
            bounds: chunkGeometry.bounds,
            center: chunkGeometry.center,
            radius: chunkGeometry.radius
        };
    }

    resolveSideBlockType(worldX, worldZ, surfaceHeight, neighborHeight) {
        if (surfaceHeight - neighborHeight <= 2) {
            return this.terrain.getBlockTypeAt(worldX, surfaceHeight - 1, worldZ);
        }

        return this.terrain.getBlockTypeAt(worldX, Math.max(0, surfaceHeight - 3), worldZ);
    }

    pushSideFace(faces, worldX, worldZ, surfaceHeight, neighborX, neighborZ, direction) {
        const neighborHeight = isWithinWorldBounds(neighborX, neighborZ)
            ? this.terrain.getSurfaceHeightAt(neighborX, neighborZ)
            : 0;

        if (surfaceHeight <= neighborHeight) {
            return;
        }

        const baseY = Math.max(0, neighborHeight);
        const topY = surfaceHeight;
        const blockType = this.resolveSideBlockType(worldX, worldZ, surfaceHeight, neighborHeight);
        const material = getFaceMaterial(blockType, direction);

        if (direction === 'east') {
            faces.push(createFace([
                { x: worldX + 1, y: baseY, z: worldZ },
                { x: worldX + 1, y: topY, z: worldZ },
                { x: worldX + 1, y: topY, z: worldZ + 1 },
                { x: worldX + 1, y: baseY, z: worldZ + 1 }
            ], { x: 1, y: 0, z: 0 }, material));
            return;
        }

        if (direction === 'west') {
            faces.push(createFace([
                { x: worldX, y: baseY, z: worldZ + 1 },
                { x: worldX, y: topY, z: worldZ + 1 },
                { x: worldX, y: topY, z: worldZ },
                { x: worldX, y: baseY, z: worldZ }
            ], { x: -1, y: 0, z: 0 }, material));
            return;
        }

        if (direction === 'north') {
            faces.push(createFace([
                { x: worldX, y: baseY, z: worldZ },
                { x: worldX + 1, y: baseY, z: worldZ },
                { x: worldX + 1, y: topY, z: worldZ },
                { x: worldX, y: topY, z: worldZ }
            ], { x: 0, y: 0, z: -1 }, material));
            return;
        }

        faces.push(createFace([
            { x: worldX + 1, y: baseY, z: worldZ + 1 },
            { x: worldX, y: baseY, z: worldZ + 1 },
            { x: worldX, y: topY, z: worldZ + 1 },
            { x: worldX + 1, y: topY, z: worldZ + 1 }
        ], { x: 0, y: 0, z: 1 }, material));
    }
}
