import { isOpaqueBlock, BLOCK_TYPES } from './BlockTypes.js';
import { getFaceMaterial } from './ChunkMaterials.js';
import { WORLD_CONFIG } from './WorldConfig.js';

function createFace(vertices, normal, material, uvs) {
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
        alpha: material.alpha || 1,
        textureKey: material.textureKey || null,
        uvs: Array.isArray(uvs) ? uvs : null
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

function emitGreedyQuads(mask, width, height, callback) {
    for (let v = 0; v < height; v += 1) {
        for (let u = 0; u < width; u += 1) {
            const index = v * width + u;
            const cell = mask[index];
            if (!cell) {
                continue;
            }

            if (!cell.material.mergeable || !cell.material.mergeKey) {
                callback(u, v, 1, 1, cell);
                mask[index] = null;
                continue;
            }

            let quadWidth = 1;
            while (u + quadWidth < width) {
                const next = mask[v * width + (u + quadWidth)];
                if (!next || !next.material.mergeable || next.material.mergeKey !== cell.material.mergeKey) {
                    break;
                }
                quadWidth += 1;
            }

            let quadHeight = 1;
            let canExpand = true;
            while (v + quadHeight < height && canExpand) {
                for (let offset = 0; offset < quadWidth; offset += 1) {
                    const next = mask[(v + quadHeight) * width + (u + offset)];
                    if (!next || !next.material.mergeable || next.material.mergeKey !== cell.material.mergeKey) {
                        canExpand = false;
                        break;
                    }
                }

                if (canExpand) {
                    quadHeight += 1;
                }
            }

            callback(u, v, quadWidth, quadHeight, cell);

            for (let clearV = 0; clearV < quadHeight; clearV += 1) {
                for (let clearU = 0; clearU < quadWidth; clearU += 1) {
                    mask[(v + clearV) * width + (u + clearU)] = null;
                }
            }
        }
    }
}

function createFaceUvs(width, height) {
    return [
        { u: 0, v: 0 },
        { u: width, v: 0 },
        { u: width, v: height },
        { u: 0, v: height }
    ];
}

export class ChunkMesher {
    constructor(world) {
        this.world = world;
    }

    getDataIndex(localX, y, localZ) {
        return y * WORLD_CONFIG.chunkSize * WORLD_CONFIG.chunkSize + localZ * WORLD_CONFIG.chunkSize + localX;
    }

    getBlockId(data, localX, y, localZ) {
        return data[this.getDataIndex(localX, y, localZ)] || BLOCK_TYPES.air;
    }

    scanChunkBounds(data) {
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (let localX = 0; localX < WORLD_CONFIG.chunkSize; localX += 1) {
            for (let localZ = 0; localZ < WORLD_CONFIG.chunkSize; localZ += 1) {
                for (let y = 0; y < WORLD_CONFIG.height; y += 1) {
                    const blockId = this.getBlockId(data, localX, y, localZ);
                    if (blockId === BLOCK_TYPES.air) {
                        continue;
                    }

                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y + 1);
                }
            }
        }

        return {
            minY: minY === Number.POSITIVE_INFINITY ? 0 : minY,
            maxY: maxY === Number.NEGATIVE_INFINITY ? 0 : maxY
        };
    }

    generateChunk(chunkX, chunkZ) {
        const snapshot = this.world.getChunkSnapshot(chunkX, chunkZ);
        const data = snapshot.data;
        const faces = [];
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        const bounds = this.scanChunkBounds(data);

        this.emitTopAndBottomFaces(faces, data, startX, startZ, 'top');
        this.emitTopAndBottomFaces(faces, data, startX, startZ, 'bottom');
        this.emitNorthSouthFaces(faces, data, startX, startZ, 'north');
        this.emitNorthSouthFaces(faces, data, startX, startZ, 'south');
        this.emitEastWestFaces(faces, data, startX, startZ, 'east');
        this.emitEastWestFaces(faces, data, startX, startZ, 'west');

        const chunkGeometry = createChunkBounds(startX, startZ, bounds.minY, bounds.maxY);

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

    emitTopAndBottomFaces(faces, data, startX, startZ, direction) {
        const size = WORLD_CONFIG.chunkSize;

        for (let y = 0; y < WORLD_CONFIG.height; y += 1) {
            const mask = new Array(size * size).fill(null);

            for (let localX = 0; localX < size; localX += 1) {
                const worldX = startX + localX;
                if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                    continue;
                }

                for (let localZ = 0; localZ < size; localZ += 1) {
                    const worldZ = startZ + localZ;
                    if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                        continue;
                    }

                    const blockId = this.getBlockId(data, localX, y, localZ);
                    if (blockId === BLOCK_TYPES.air) {
                        continue;
                    }

                    const neighborId = direction === 'top'
                        ? this.world.getBlockIdAtBlock(worldX, y + 1, worldZ)
                        : this.world.getBlockIdAtBlock(worldX, y - 1, worldZ);

                    if (!shouldRenderFace(blockId, neighborId)) {
                        continue;
                    }

                    mask[localZ * size + localX] = {
                        localX: localX,
                        localZ: localZ,
                        y: y,
                        material: getFaceMaterial(blockId, direction)
                    };
                }
            }

            emitGreedyQuads(mask, size, size, (u, v, quadWidth, quadHeight, cell) => {
                const worldX = startX + u;
                const worldZ = startZ + v;
                const planeY = direction === 'top' ? cell.y + 1 : cell.y;
                const uvs = createFaceUvs(quadWidth, quadHeight);

                faces.push(createFace([
                    { x: worldX, y: planeY, z: worldZ },
                    { x: worldX + quadWidth, y: planeY, z: worldZ },
                    { x: worldX + quadWidth, y: planeY, z: worldZ + quadHeight },
                    { x: worldX, y: planeY, z: worldZ + quadHeight }
                ], { x: 0, y: direction === 'top' ? 1 : -1, z: 0 }, cell.material, uvs));
            });
        }
    }

    emitNorthSouthFaces(faces, data, startX, startZ, direction) {
        const size = WORLD_CONFIG.chunkSize;

        for (let localZ = 0; localZ < size; localZ += 1) {
            const worldZ = startZ + localZ;
            if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                continue;
            }

            const mask = new Array(size * WORLD_CONFIG.height).fill(null);

            for (let localX = 0; localX < size; localX += 1) {
                const worldX = startX + localX;
                if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                    continue;
                }

                for (let y = 0; y < WORLD_CONFIG.height; y += 1) {
                    const blockId = this.getBlockId(data, localX, y, localZ);
                    if (blockId === BLOCK_TYPES.air) {
                        continue;
                    }

                    const neighborId = direction === 'north'
                        ? this.world.getBlockIdAtBlock(worldX, y, worldZ - 1)
                        : this.world.getBlockIdAtBlock(worldX, y, worldZ + 1);

                    if (!shouldRenderFace(blockId, neighborId)) {
                        continue;
                    }

                    mask[y * size + localX] = {
                        localX: localX,
                        localZ: localZ,
                        y: y,
                        material: getFaceMaterial(blockId, direction)
                    };
                }
            }

            emitGreedyQuads(mask, size, WORLD_CONFIG.height, (u, v, quadWidth, quadHeight, cell) => {
                const worldX = startX + u;
                const planeZ = direction === 'north' ? startZ + cell.localZ : startZ + cell.localZ + 1;
                const worldY = v;
                const uvs = createFaceUvs(quadWidth, quadHeight);

                if (direction === 'north') {
                    faces.push(createFace([
                        { x: worldX, y: worldY + quadHeight, z: planeZ },
                        { x: worldX + quadWidth, y: worldY + quadHeight, z: planeZ },
                        { x: worldX + quadWidth, y: worldY, z: planeZ },
                        { x: worldX, y: worldY, z: planeZ }
                    ], { x: 0, y: 0, z: -1 }, cell.material, uvs));
                    return;
                }

                faces.push(createFace([
                    { x: worldX + quadWidth, y: worldY + quadHeight, z: planeZ },
                    { x: worldX, y: worldY + quadHeight, z: planeZ },
                    { x: worldX, y: worldY, z: planeZ },
                    { x: worldX + quadWidth, y: worldY, z: planeZ }
                ], { x: 0, y: 0, z: 1 }, cell.material, uvs));
            });
        }
    }

    emitEastWestFaces(faces, data, startX, startZ, direction) {
        const size = WORLD_CONFIG.chunkSize;

        for (let localX = 0; localX < size; localX += 1) {
            const worldX = startX + localX;
            if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                continue;
            }

            const mask = new Array(size * WORLD_CONFIG.height).fill(null);

            for (let localZ = 0; localZ < size; localZ += 1) {
                const worldZ = startZ + localZ;
                if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                    continue;
                }

                for (let y = 0; y < WORLD_CONFIG.height; y += 1) {
                    const blockId = this.getBlockId(data, localX, y, localZ);
                    if (blockId === BLOCK_TYPES.air) {
                        continue;
                    }

                    const neighborId = direction === 'east'
                        ? this.world.getBlockIdAtBlock(worldX + 1, y, worldZ)
                        : this.world.getBlockIdAtBlock(worldX - 1, y, worldZ);

                    if (!shouldRenderFace(blockId, neighborId)) {
                        continue;
                    }

                    mask[y * size + localZ] = {
                        localX: localX,
                        localZ: localZ,
                        y: y,
                        material: getFaceMaterial(blockId, direction)
                    };
                }
            }

            emitGreedyQuads(mask, size, WORLD_CONFIG.height, (u, v, quadWidth, quadHeight, cell) => {
                const planeX = direction === 'east' ? startX + cell.localX + 1 : startX + cell.localX;
                const worldY = v;
                const worldZ = startZ + u;
                const uvs = createFaceUvs(quadWidth, quadHeight);

                if (direction === 'east') {
                    faces.push(createFace([
                        { x: planeX, y: worldY + quadHeight, z: worldZ },
                        { x: planeX, y: worldY + quadHeight, z: worldZ + quadWidth },
                        { x: planeX, y: worldY, z: worldZ + quadWidth },
                        { x: planeX, y: worldY, z: worldZ }
                    ], { x: 1, y: 0, z: 0 }, cell.material, uvs));
                    return;
                }

                faces.push(createFace([
                    { x: planeX, y: worldY + quadHeight, z: worldZ + quadWidth },
                    { x: planeX, y: worldY + quadHeight, z: worldZ },
                    { x: planeX, y: worldY, z: worldZ },
                    { x: planeX, y: worldY, z: worldZ + quadWidth }
                ], { x: -1, y: 0, z: 0 }, cell.material, uvs));
            });
        }
    }
}