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

export class ChunkMesher {
    constructor(terrainGenerator) {
        this.terrain = terrainGenerator;
    }

    generateChunk(chunkX, chunkZ) {
        const faces = [];
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

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

                const topType = this.terrain.getBlockTypeAt(worldX, surfaceHeight - 1, worldZ);
                faces.push(createFace([
                    { x: worldX, y: surfaceHeight, z: worldZ },
                    { x: worldX + 1, y: surfaceHeight, z: worldZ },
                    { x: worldX + 1, y: surfaceHeight, z: worldZ + 1 },
                    { x: worldX, y: surfaceHeight, z: worldZ + 1 }
                ], { x: 0, y: 1, z: 0 }, getFaceMaterial(topType, 'top')));

                this.pushSideFaces(faces, worldX, worldZ, surfaceHeight, worldX + 1, worldZ, 'east');
                this.pushSideFaces(faces, worldX, worldZ, surfaceHeight, worldX - 1, worldZ, 'west');
                this.pushSideFaces(faces, worldX, worldZ, surfaceHeight, worldX, worldZ - 1, 'north');
                this.pushSideFaces(faces, worldX, worldZ, surfaceHeight, worldX, worldZ + 1, 'south');
            }
        }

        return {
            key: chunkX + ',' + chunkZ,
            chunkX: chunkX,
            chunkZ: chunkZ,
            faces: faces
        };
    }

    pushSideFaces(faces, worldX, worldZ, surfaceHeight, neighborX, neighborZ, direction) {
        const neighborHeight = isWithinWorldBounds(neighborX, neighborZ)
            ? this.terrain.getSurfaceHeightAt(neighborX, neighborZ)
            : 0;

        if (surfaceHeight <= neighborHeight) {
            return;
        }

        for (let y = Math.max(0, neighborHeight); y < surfaceHeight; y += 1) {
            const blockType = this.terrain.getBlockTypeAt(worldX, y, worldZ);
            const material = getFaceMaterial(blockType, direction);

            if (direction === 'east') {
                faces.push(createFace([
                    { x: worldX + 1, y: y, z: worldZ },
                    { x: worldX + 1, y: y + 1, z: worldZ },
                    { x: worldX + 1, y: y + 1, z: worldZ + 1 },
                    { x: worldX + 1, y: y, z: worldZ + 1 }
                ], { x: 1, y: 0, z: 0 }, material));
                continue;
            }

            if (direction === 'west') {
                faces.push(createFace([
                    { x: worldX, y: y, z: worldZ + 1 },
                    { x: worldX, y: y + 1, z: worldZ + 1 },
                    { x: worldX, y: y + 1, z: worldZ },
                    { x: worldX, y: y, z: worldZ }
                ], { x: -1, y: 0, z: 0 }, material));
                continue;
            }

            if (direction === 'north') {
                faces.push(createFace([
                    { x: worldX, y: y, z: worldZ },
                    { x: worldX + 1, y: y, z: worldZ },
                    { x: worldX + 1, y: y + 1, z: worldZ },
                    { x: worldX, y: y + 1, z: worldZ }
                ], { x: 0, y: 0, z: -1 }, material));
                continue;
            }

            faces.push(createFace([
                { x: worldX + 1, y: y, z: worldZ + 1 },
                { x: worldX, y: y, z: worldZ + 1 },
                { x: worldX, y: y + 1, z: worldZ + 1 },
                { x: worldX + 1, y: y + 1, z: worldZ + 1 }
            ], { x: 0, y: 0, z: 1 }, material));
        }
    }
}
