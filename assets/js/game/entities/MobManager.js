import { BLOCK_TYPES } from '../world/BlockTypes.js';
import { CatMob } from './CatMob.js';

export class MobManager {
    constructor(world) {
        this.world = world;
        this.cats = [];
        this.spawnElapsed = 0;
        this.sequence = 1;
        this.maxCats = 5;
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
        if (typeof this.world.getSurfaceBiome !== 'function') {
            return true;
        }

        for (let offsetX = -8; offsetX <= 8; offsetX += 2) {
            for (let offsetZ = -8; offsetZ <= 8; offsetZ += 2) {
                const biome = this.world.getSurfaceBiome(x + offsetX, z + offsetZ);
                if (biome && biome.key === 'forest') {
                    return true;
                }
            }
        }

        return false;
    }

    findSpawnPointNearPlayer(playerPosition) {
        for (let attempt = 0; attempt < 16; attempt += 1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 6 + Math.random() * 7;
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

    spawnCatAt(spawnPoint) {
        if (!spawnPoint) {
            return null;
        }

        const cat = new CatMob('cat-' + this.sequence, spawnPoint);
        this.sequence += 1;
        this.cats.push(cat);
        return cat;
    }

    maybeSpawnNearPlayer(playerPosition) {
        if (this.cats.length >= this.maxCats || !this.hasForestNearby(playerPosition.x, playerPosition.z)) {
            return;
        }

        if (Math.floor(Math.random() * 5) !== 0) {
            return;
        }

        const spawnPoint = this.findSpawnPointNearPlayer(playerPosition);
        if (!spawnPoint) {
            return;
        }

        this.spawnCatAt(spawnPoint);
    }

    spawnCommandMob(type, playerPosition, playerRotation) {
        const normalizedType = String(type || 'gato').trim().toLowerCase();
        if (!['gato', 'cat'].includes(normalizedType)) {
            return null;
        }

        const yaw = playerRotation && Number.isFinite(Number(playerRotation.yaw)) ? Number(playerRotation.yaw) : 0;
        const candidateX = playerPosition.x - Math.sin(yaw) * 3.5;
        const candidateZ = playerPosition.z + Math.cos(yaw) * 3.5;
        const topY = this.world.getTopSolidYAt(candidateX, candidateZ);
        let spawnPoint = null;

        if (topY >= 0 && this.world.isInsideWorld(candidateX, candidateZ) && this.isWalkableSurface(candidateX, candidateZ, topY)) {
            spawnPoint = {
                x: Math.floor(candidateX) + 0.5,
                y: topY + 1,
                z: Math.floor(candidateZ) + 0.5
            };
        }

        if (!spawnPoint) {
            spawnPoint = this.findSpawnPointNearPlayer(playerPosition);
        }

        return this.spawnCatAt(spawnPoint);
    }

    update(deltaTime, playerPosition) {
        const events = [];

        this.spawnElapsed += deltaTime;
        if (this.spawnElapsed >= 2.1) {
            this.spawnElapsed = 0;
            this.maybeSpawnNearPlayer(playerPosition);
        }

        this.cats = this.cats.filter((cat) => {
            const distance = Math.hypot(cat.position.x - playerPosition.x, cat.position.z - playerPosition.z);
            return distance <= 56 || cat.following || cat.aggressive;
        });

        this.cats.forEach((cat) => {
            const event = cat.update(deltaTime, playerPosition, this.world, this.isWalkableSurface.bind(this));
            if (event) {
                events.push(Object.assign({ entityId: cat.id }, event));
            }
        });

        return events;
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

        const following = cat.toggleFollow();
        if (following === null) {
            return {
                entity: cat,
                blocked: true,
                message: 'Esse gato esta agressivo e nao vai obedecer agora.'
            };
        }

        return {
            entity: cat,
            following: following,
            blocked: false
        };
    }

    hitEntity(entityId, attackerPosition) {
        const cat = this.cats.find(function (entry) {
            return entry.id === entityId;
        });

        if (!cat) {
            return null;
        }

        cat.takeHit(attackerPosition);
        return {
            entity: cat,
            aggressive: true
        };
    }

    resetAfterRespawn() {
        this.cats.forEach(function (cat) {
            cat.resetBehavior();
        });
    }
}