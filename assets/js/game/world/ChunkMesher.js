import { isOpaqueBlock, BLOCK_TYPES } from './BlockTypes.js';
import { getFaceMaterial } from './ChunkMaterials.js';
import { WORLD_CONFIG } from './WorldConfig.js';

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
        shade: material.shade,
        alpha: material.alpha || 1
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

function shouldRenderFace(blockId, neighborId) {
    if (blockId === BLOCK_TYPES.air) {
        return false;
    }

    if (blockId === BLOCK_TYPES.water) {
        return neighborId !== BLOCK_TYPES.water && !isOpaqueBlock(neighborId);
    }

    if (blockId === BLOCK_TYPES.leaves) {
        return neighborId === BLOCK_TYPES.air || neighborId === BLOCK_TYPES.water;
    }

    return neighborId === BLOCK_TYPES.air || !isOpaqueBlock(neighborId);
}

export class ChunkMesher {
    constructor(world) {
        this.world = world;
    }

    generateChunk(chunkX, chunkZ) {
        const snapshot = this.world.getChunkSnapshot(chunkX, chunkZ);
        const data = snapshot.data;
        const faces = [];
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (let localX = 0; localX < WORLD_CONFIG.chunkSize; localX += 1) {
            const worldX = startX + localX;
            if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                continue;
            }

            for (let localZ = 0; localZ < WORLD_CONFIG.chunkSize; localZ += 1) {
                const worldZ = startZ + localZ;
                if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                    continue;
                }

                for (let y = 0; y < WORLD_CONFIG.height; y += 1) {
                    const blockId = data[y * WORLD_CONFIG.chunkSize * WORLD_CONFIG.chunkSize + localZ * WORLD_CONFIG.chunkSize + localX];
                    if (blockId === BLOCK_TYPES.air) {
                        continue;
                    }

                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y + 1);

                    this.pushFace(faces, blockId, worldX, y, worldZ, 'top');
                    this.pushFace(faces, blockId, worldX, y, worldZ, 'bottom');
                    this.pushFace(faces, blockId, worldX, y, worldZ, 'north');
                    this.pushFace(faces, blockId, worldX, y, worldZ, 'south');
                    this.pushFace(faces, blockId, worldX, y, worldZ, 'east');
                    this.pushFace(faces, blockId, worldX, y, worldZ, 'west');
                }
            }
        }

        const chunkGeometry = createChunkBounds(startX, startZ, minY === Number.POSITIVE_INFINITY ? 0 : minY, maxY === Number.NEGATIVE_INFINITY ? 0 : maxY);

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

    pushFace(faces, blockId, worldX, y, worldZ, direction) {
        const neighbor = this.getNeighbor(worldX, y, worldZ, direction);

        if (!shouldRenderFace(blockId, neighbor.blockId)) {
            return;
        }

        const material = getFaceMaterial(blockId, direction);
        if (direction === 'top') {
            faces.push(createFace([
                { x: worldX, y: y + 1, z: worldZ },
                { x: worldX + 1, y: y + 1, z: worldZ },
                { x: worldX + 1, y: y + 1, z: worldZ + 1 },
                { x: worldX, y: y + 1, z: worldZ + 1 }
            ], { x: 0, y: 1, z: 0 }, material));
            return;
        }

        if (direction === 'bottom') {
            faces.push(createFace([
                { x: worldX, y: y, z: worldZ + 1 },
                { x: worldX + 1, y: y, z: worldZ + 1 },
                { x: worldX + 1, y: y, z: worldZ },
                { x: worldX, y: y, z: worldZ }
            ], { x: 0, y: -1, z: 0 }, material));
            return;
        }

        if (direction === 'east') {
            faces.push(createFace([
                { x: worldX + 1, y: y, z: worldZ },
                { x: worldX + 1, y: y + 1, z: worldZ },
                { x: worldX + 1, y: y + 1, z: worldZ + 1 },
                { x: worldX + 1, y: y, z: worldZ + 1 }
            ], { x: 1, y: 0, z: 0 }, material));
            return;
        }

        if (direction === 'west') {
            faces.push(createFace([
                { x: worldX, y: y, z: worldZ + 1 },
                { x: worldX, y: y + 1, z: worldZ + 1 },
                { x: worldX, y: y + 1, z: worldZ },
                { x: worldX, y: y, z: worldZ }
            ], { x: -1, y: 0, z: 0 }, material));
            return;
        }

        if (direction === 'north') {
            faces.push(createFace([
                { x: worldX, y: y, z: worldZ },
                { x: worldX + 1, y: y, z: worldZ },
                { x: worldX + 1, y: y + 1, z: worldZ },
                { x: worldX, y: y + 1, z: worldZ }
            ], { x: 0, y: 0, z: -1 }, material));
            return;
        }

        faces.push(createFace([
            { x: worldX + 1, y: y, z: worldZ + 1 },
            { x: worldX, y: y, z: worldZ + 1 },
            { x: worldX, y: y + 1, z: worldZ + 1 },
            { x: worldX + 1, y: y + 1, z: worldZ + 1 }
        ], { x: 0, y: 0, z: 1 }, material));
    }

    getNeighbor(worldX, y, worldZ, direction) {
        if (direction === 'top') {
            return { blockId: this.world.getBlockIdAtBlock(worldX, y + 1, worldZ) };
        }

        if (direction === 'bottom') {
            return { blockId: this.world.getBlockIdAtBlock(worldX, y - 1, worldZ) };
        }

        if (direction === 'east') {
            return { blockId: this.world.getBlockIdAtBlock(worldX + 1, y, worldZ) };
        }

        if (direction === 'west') {
            return { blockId: this.world.getBlockIdAtBlock(worldX - 1, y, worldZ) };
        }

        if (direction === 'north') {
            return { blockId: this.world.getBlockIdAtBlock(worldX, y, worldZ - 1) };
        }

        return { blockId: this.world.getBlockIdAtBlock(worldX, y, worldZ + 1) };
    }
}
