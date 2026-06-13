import { BLOCK_TYPES } from '../world/BlockTypes.js';
import { PigMob } from './PigMob.js';
import { SheepMob } from './SheepMob.js';
import { CowMob } from './CowMob.js';
import { ChickenMob } from './ChickenMob.js';
import { ZombieMob } from './ZombieMob.js';
import { SkeletonMob } from './SkeletonMob.js';
import { SpiderMob } from './SpiderMob.js';
import { CreeperMob } from './CreeperMob.js';

const MAX_PASSIVE = 12;
const MAX_HOSTILE = 8;
const DESPAWN_DISTANCE = 64;

export class MobManager {
    constructor(world) {
        this.world = world;
        this.entities = [];
        this.spawnElapsed = 0;
        this.sequence = 1;
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
            const distance = 8 + Math.random() * 12;
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

        const id = type + '-' + this.sequence;
        let entity = null;

        if (type === 'pig') {
            entity = new PigMob(id, spawnPoint);
        } else if (type === 'sheep') {
            entity = new SheepMob(id, spawnPoint);
        } else if (type === 'cow') {
            entity = new CowMob(id, spawnPoint);
        } else if (type === 'chicken') {
            entity = new ChickenMob(id, spawnPoint);
        } else if (type === 'zombie') {
            entity = new ZombieMob(id, spawnPoint);
        } else if (type === 'skeleton') {
            entity = new SkeletonMob(id, spawnPoint);
        } else if (type === 'spider') {
            entity = new SpiderMob(id, spawnPoint);
        } else if (type === 'creeper') {
            entity = new CreeperMob(id, spawnPoint);
        }

        if (!entity) {
            return null;
        }

        this.sequence += 1;
        this.entities.push(entity);
        return entity;
    }

    _countPassive() {
        return this.entities.filter(function (e) { return !e.hostileByDefault; }).length;
    }

    _countHostile() {
        return this.entities.filter(function (e) { return e.hostileByDefault; }).length;
    }

    maybeSpawnNearPlayer(playerPosition, isDaytime) {
        if (Math.floor(Math.random() * 5) !== 0) {
            return;
        }

        const biome = typeof this.world.getSurfaceBiome === 'function'
            ? this.world.getSurfaceBiome(playerPosition.x, playerPosition.z)
            : { key: 'plains' };
        const biomeKey = biome ? biome.key : 'plains';

        if (isDaytime) {
            if (this._countPassive() >= MAX_PASSIVE) {
                return;
            }

            let type = null;
            let allowedBiomes = null;

            if (biomeKey === 'plains' || biomeKey === 'meadow') {
                const r = Math.random();
                if (r < 0.35) {
                    type = 'pig';
                } else if (r < 0.65) {
                    type = 'cow';
                } else {
                    type = 'sheep';
                }
                allowedBiomes = ['plains', 'meadow'];
            } else if (biomeKey === 'forest' || biomeKey === 'taiga') {
                type = Math.random() < 0.5 ? 'chicken' : 'sheep';
                allowedBiomes = ['forest', 'taiga', 'meadow'];
            } else if (biomeKey === 'desert' || biomeKey === 'badlands') {
                return;
            } else if (biomeKey === 'mountains' || biomeKey === 'mountain') {
                type = 'sheep';
                allowedBiomes = ['mountains', 'mountain', 'plains'];
            } else {
                const r = Math.random();
                type = r < 0.5 ? 'pig' : 'sheep';
                allowedBiomes = ['plains', 'meadow', 'forest'];
            }

            const spawnPoint = this.findSpawnPointNearPlayer(playerPosition, allowedBiomes);
            if (spawnPoint) {
                this.spawnMob(type, spawnPoint);
            }
        } else {
            if (this._countHostile() >= MAX_HOSTILE) {
                return;
            }

            const r = Math.random();
            let type;
            if (r < 0.3) {
                type = 'zombie';
            } else if (r < 0.55) {
                type = 'skeleton';
            } else if (r < 0.75) {
                type = 'spider';
            } else {
                type = 'creeper';
            }

            const allowedBiomes = ['plains', 'meadow', 'forest', 'taiga', 'desert', 'mountains', 'mountain', 'badlands'];
            const spawnPoint = this.findSpawnPointNearPlayer(playerPosition, allowedBiomes);
            if (spawnPoint) {
                this.spawnMob(type, spawnPoint);
            }
        }
    }

    spawnCommandMob(type, playerPosition, playerRotation) {
        const normalizedType = String(type || 'pig').trim().toLowerCase();
        const aliases = {
            pig: 'pig', porco: 'pig',
            cow: 'cow', vaca: 'cow',
            sheep: 'sheep', ovelha: 'sheep',
            chicken: 'chicken', galinha: 'chicken',
            zombie: 'zombie', zumbi: 'zombie',
            skeleton: 'skeleton', esqueleto: 'skeleton',
            spider: 'spider', aranha: 'spider',
            creeper: 'creeper'
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
            spawnPoint = this.findSpawnPointNearPlayer(playerPosition, ['plains', 'meadow', 'forest', 'taiga']);
        }

        return this.spawnMob(mobType, spawnPoint);
    }

    update(deltaTime, playerPosition, isDaytime) {
        const isDay = isDaytime !== false;
        const events = [];

        this.spawnElapsed += deltaTime;
        if (this.spawnElapsed >= 2.1) {
            this.spawnElapsed = 0;
            this.maybeSpawnNearPlayer(playerPosition, isDay);
        }

        this.entities = this.entities.filter(function (entity) {
            if (!entity.isAlive()) {
                return false;
            }
            const distance = Math.hypot(entity.position.x - playerPosition.x, entity.position.z - playerPosition.z);
            return distance <= DESPAWN_DISTANCE || entity.following || entity.aggressive;
        });

        this.entities.forEach(function (entity) {
            if (typeof entity.setTimeOfDay === 'function') {
                entity.setTimeOfDay(!isDay);
            }

            const event = entity.update(deltaTime, playerPosition, this.world, this.isWalkableSurface.bind(this));
            if (event) {
                events.push(Object.assign({ entityId: entity.id }, event));
            }
        }, this);

        this.entities = this.entities.filter(function (entity) {
            return entity.isAlive();
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

    toggleFollow() {
        return null;
    }

    hitEntity(entityId, attackerPosition, damage) {
        const entity = this.entities.find(function (entry) {
            return entry.id === entityId;
        });

        if (!entity) {
            return null;
        }

        const impact = entity.takeHit(attackerPosition, damage);
        if (impact && impact.dead) {
            this.entities = this.entities.filter(function (entry) {
                return entry.id !== entityId;
            });

            return {
                entity: entity,
                aggressive: true,
                died: true,
                drops: typeof entity.getDrops === 'function' ? entity.getDrops() : []
            };
        }

        return {
            entity: entity,
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
