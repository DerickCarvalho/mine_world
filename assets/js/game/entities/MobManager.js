import { BLOCK_TYPES } from '../world/BlockTypes.js';
import { CatMob } from './CatMob.js';
import { CrawlerMob } from './CrawlerMob.js';
import { PigMob } from './PigMob.js';
import { SheepMob } from './SheepMob.js';

export class MobManager {
    constructor(world) {
        this.world = world;
        this.entities = [];
        this.spawnElapsed = 0;
        this.sequence = 1;
        this.maxEntities = 9;
    }

    isWalkableSurface(x, z, topY) {
        const blockX = Math.floor(x);
        const blockZ = Math.floor(z);
        const topBlock = this.world.getBlockIdAtBlock(blockX, topY, blockZ);

        return topBlock !== BLOCK_TYPES.water
            && topBlock !== BLOCK_TYPES.leaves
            && topBlock !== BLOCK_TYPES.wood;
    }

    hasBiomeNearby(x, z, allowedBiomes) {
        if (typeof this.world.getSurfaceBiome !== 'function') {
            return true;
        }

        for (let offsetX = -8; offsetX <= 8; offsetX += 2) {
            for (let offsetZ = -8; offsetZ <= 8; offsetZ += 2) {
                const biome = this.world.getSurfaceBiome(x + offsetX, z + offsetZ);
                if (biome && allowedBiomes.includes(biome.key)) {
                    return true;
                }
            }
        }

        return false;
    }

    findSpawnPointNearPlayer(playerPosition, allowedBiomes) {
        for (let attempt = 0; attempt < 16; attempt += 1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 6 + Math.random() * 7;
            const x = playerPosition.x + Math.cos(angle) * distance;
            const z = playerPosition.z + Math.sin(angle) * distance;
            const topY = this.world.getTopSolidYAt(x, z);

            if (topY < 0 || !this.world.isInsideWorld(x, z)) {
                continue;
            }

            if (!this.isWalkableSurface(x, z, topY) || !this.hasBiomeNearby(x, z, allowedBiomes)) {
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

    spawnMob(type, spawnPoint) {
        if (!spawnPoint) {
            return null;
        }

        let entity = null;
        if (type === 'pig') {
            entity = new PigMob('pig-' + this.sequence, spawnPoint);
        } else if (type === 'sheep') {
            entity = new SheepMob('sheep-' + this.sequence, spawnPoint);
        } else if (type === 'crawler') {
            entity = new CrawlerMob('crawler-' + this.sequence, spawnPoint);
        } else {
            entity = new CatMob('cat-' + this.sequence, spawnPoint);
        }

        this.sequence += 1;
        this.entities.push(entity);
        return entity;
    }

    maybeSpawnNearPlayer(playerPosition) {
        if (this.entities.length >= this.maxEntities) {
            return;
        }

        if (Math.floor(Math.random() * 5) !== 0) {
            return;
        }

        const biome = typeof this.world.getSurfaceBiome === 'function'
            ? this.world.getSurfaceBiome(playerPosition.x, playerPosition.z)
            : { key: 'plains' };
        let type = 'cat';
        let allowedBiomes = ['forest', 'taiga'];

        if (biome && (biome.key === 'mountains' || biome.key === 'mountain' || biome.key === 'badlands')) {
            type = 'crawler';
            allowedBiomes = ['mountains', 'mountain', 'badlands'];
        } else if (biome && biome.key === 'desert' && Math.random() > 0.58) {
            type = 'crawler';
            allowedBiomes = ['desert', 'badlands'];
        } else if (biome && (biome.key === 'plains' || biome.key === 'meadow')) {
            type = Math.random() > 0.45 ? 'sheep' : 'pig';
            allowedBiomes = ['plains', 'meadow'];
        } else if (biome && biome.key === 'taiga') {
            type = 'sheep';
            allowedBiomes = ['taiga', 'forest', 'meadow'];
        }

        const spawnPoint = this.findSpawnPointNearPlayer(playerPosition, allowedBiomes);
        if (!spawnPoint) {
            return;
        }

        this.spawnMob(type, spawnPoint);
    }

    spawnCommandMob(type, playerPosition, playerRotation) {
        const normalizedType = String(type || 'gato').trim().toLowerCase();
        const aliases = {
            gato: 'cat',
            cat: 'cat',
            porco: 'pig',
            pig: 'pig',
            ovelha: 'sheep',
            sheep: 'sheep',
            crawler: 'crawler'
        };
        const mobType = aliases[normalizedType];
        if (!mobType) {
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
            const spawnBiomes = mobType === 'cat'
                ? ['forest', 'taiga']
                : ['plains', 'meadow', 'forest', 'taiga'];
            spawnPoint = this.findSpawnPointNearPlayer(playerPosition, spawnBiomes);
        }

        return this.spawnMob(mobType, spawnPoint);
    }

    update(deltaTime, playerPosition) {
        const events = [];

        this.spawnElapsed += deltaTime;
        if (this.spawnElapsed >= 2.1) {
            this.spawnElapsed = 0;
            this.maybeSpawnNearPlayer(playerPosition);
        }

        this.entities = this.entities.filter((entity) => {
            const distance = Math.hypot(entity.position.x - playerPosition.x, entity.position.z - playerPosition.z);
            return distance <= 56 || entity.following || entity.aggressive;
        });

        this.entities.forEach((entity) => {
            const event = entity.update(deltaTime, playerPosition, this.world, this.isWalkableSurface.bind(this));
            if (event) {
                events.push(Object.assign({ entityId: entity.id }, event));
            }
        });

        return events;
    }

    getEntities() {
        return this.entities;
    }

    getRenderableEntities() {
        return this.entities.map(function (entity) {
            return entity.getRenderable();
        });
    }

    toggleFollow(entityId) {
        const cat = this.entities.find(function (entry) {
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

    hitEntity(entityId, attackerPosition, damage) {
        const cat = this.entities.find(function (entry) {
            return entry.id === entityId;
        });

        if (!cat) {
            return null;
        }

        const impact = cat.takeHit(attackerPosition, damage);
        if (impact && impact.dead) {
            this.entities = this.entities.filter(function (entry) {
                return entry.id !== entityId;
            });

            return {
                entity: cat,
                aggressive: true,
                died: true,
                drops: typeof cat.getDrops === 'function' ? cat.getDrops() : []
            };
        }

        return {
            entity: cat,
            aggressive: true,
            died: false,
            health: impact && Number.isFinite(impact.health) ? impact.health : null
        };
    }

    resetAfterRespawn() {
        this.entities.forEach(function (entity) {
            entity.resetBehavior();
        });
    }
}
