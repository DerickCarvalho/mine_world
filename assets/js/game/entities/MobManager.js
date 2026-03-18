import { BLOCK_TYPES } from '../world/BlockTypes.js';
import { CatMob } from './CatMob.js';

export class MobManager {
    constructor(world) {
        this.world = world;
        this.cats = [];
        this.spawnElapsed = 0;
        this.sequence = 1;
        this.maxCats = 3;
    }

    isWalkableSurface(x, z, topY) {
        const blockX = Math.floor(x);
        const blockZ = Math.floor(z);
        const topBlock = this.world.getBlockIdAtBlock(blockX, topY, blockZ);

        return topBlock !== BLOCK_TYPES.water
            && topBlock !== BLOCK_TYPES.leaves
            && topBlock !== BLOCK_TYPES.wood;
    }

    hasForestNearby(x, z) {
        for (let offsetX = -6; offsetX <= 6; offsetX += 2) {
            for (let offsetZ = -6; offsetZ <= 6; offsetZ += 2) {
                for (let y = 1; y <= 8; y += 1) {
                    const blockId = this.world.getBlockIdAtBlock(Math.floor(x) + offsetX, y + Math.floor(this.world.getTopSolidYAt(x, z) || 0), Math.floor(z) + offsetZ);
                    if (blockId === BLOCK_TYPES.leaves || blockId === BLOCK_TYPES.wood) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    findSpawnPointNearPlayer(playerPosition) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 8 + Math.random() * 6;
            const x = playerPosition.x + Math.cos(angle) * distance;
            const z = playerPosition.z + Math.sin(angle) * distance;
            const topY = this.world.getTopSolidYAt(x, z);

            if (topY < 0 || !this.world.isInsideWorld(x, z)) {
                continue;
            }

            if (!this.isWalkableSurface(x, z, topY) || !this.hasForestNearby(x, z)) {
                continue;
            }

            return {
                x: Math.floor(x) + 0.5,
                y: topY + 1,
                z: Math.floor(z) + 0.5
            };
        }

        return null;
    }

    maybeSpawnNearPlayer(playerPosition) {
        if (this.cats.length >= this.maxCats || !this.hasForestNearby(playerPosition.x, playerPosition.z)) {
            return;
        }

        if (Math.floor(Math.random() * 50) !== 0) {
            return;
        }

        const spawnPoint = this.findSpawnPointNearPlayer(playerPosition);
        if (!spawnPoint) {
            return;
        }

        this.cats.push(new CatMob('cat-' + this.sequence, spawnPoint));
        this.sequence += 1;
    }

    update(deltaTime, playerPosition) {
        this.spawnElapsed += deltaTime;
        if (this.spawnElapsed >= 2.4) {
            this.spawnElapsed = 0;
            this.maybeSpawnNearPlayer(playerPosition);
        }

        this.cats = this.cats.filter((cat) => {
            const distance = Math.hypot(cat.position.x - playerPosition.x, cat.position.z - playerPosition.z);
            return distance <= 48 || cat.following;
        });

        this.cats.forEach((cat) => {
            cat.update(deltaTime, playerPosition, this.world, this.isWalkableSurface.bind(this));
        });
    }

    getEntities() {
        return this.cats;
    }

    getRenderableEntities() {
        return this.cats.map(function (cat) {
            return cat.getRenderable();
        });
    }

    toggleFollow(entityId) {
        const cat = this.cats.find(function (entry) {
            return entry.id === entityId;
        });

        if (!cat) {
            return null;
        }

        return {
            entity: cat,
            following: cat.toggleFollow()
        };
    }
}
