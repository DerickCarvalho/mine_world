import { PassiveMob } from './PassiveMob.js';

const FUSE_TRIGGER_DISTANCE = 2.5;
const FUSE_DURATION = 3.0;

export class CreeperMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'creeper', spawnPoint, {
            displayName: 'Creeper',
            angryName: 'Creeper',
            speed: 2.1,
            chaseSpeed: 2.8,
            followDistance: 0,
            attackDistance: FUSE_TRIGGER_DISTANCE,
            wanderRadius: 5.0,
            maxHealth: 10,
            attackDamage: 6,
            hostileByDefault: true,
            detectRange: 8,
            height: 1.7,
            width: 0.6,
            depth: 0.6,
            dropTable: [
                { block_id: 'gunpowder', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 84, g: 148, b: 74 },
                    side: { r: 72, g: 130, b: 62 },
                    bottom: { r: 58, g: 110, b: 50 }
                },
                accent: {
                    top: { r: 34, g: 34, b: 34 },
                    side: { r: 26, g: 26, b: 26 },
                    bottom: { r: 18, g: 18, b: 18 }
                },
                leg: {
                    top: { r: 74, g: 136, b: 64 },
                    side: { r: 62, g: 118, b: 52 },
                    bottom: { r: 50, g: 98, b: 42 }
                }
            }
        });
        this.fuseTimer = 0;
        this.fuseActive = false;
        this.exploded = false;
    }

    update(deltaTime, playerPosition, world, isWalkable) {
        if (!this.isAlive() || this.exploded) {
            return null;
        }

        this.animationTime += deltaTime * (this.aggressive ? 7.6 : 3.1);
        this.hurtTime = Math.max(0, this.hurtTime - deltaTime);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);

        if (!this.aggressive) {
            const detectDist = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
            if (detectDist <= this.detectRange) {
                this.aggressive = true;
            }
        }

        if (this.aggressive) {
            const distance = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);

            if (distance <= FUSE_TRIGGER_DISTANCE) {
                this.fuseActive = true;
                this.fuseTimer += deltaTime;

                if (this.fuseTimer >= FUSE_DURATION) {
                    this.exploded = true;
                    this.health = 0;
                    return {
                        type: 'creeper_explode',
                        damage: this.attackDamage,
                        radius: 3,
                        entityId: this.id,
                        position: { x: this.position.x, y: this.position.y, z: this.position.z }
                    };
                }

                return null;
            }

            if (this.fuseActive) {
                this.fuseActive = false;
                this.fuseTimer = 0;
            }

            this.moveTowards(playerPosition.x, playerPosition.z, deltaTime, world, isWalkable, FUSE_TRIGGER_DISTANCE - 0.3, this.chaseSpeed);
            return null;
        }

        this.wanderTimer -= deltaTime;
        if (!this.wanderTarget || this.wanderTimer <= 0) {
            this.wanderTarget = this.chooseWanderTarget(world, isWalkable);
            this.wanderTimer = 2.4 + Math.random() * 3.6;
        }

        if (this.wanderTarget) {
            const reached = this.moveTowards(this.wanderTarget.x, this.wanderTarget.z, deltaTime, world, isWalkable, 0.24, this.speed);
            if (reached) {
                this.wanderTarget = null;
            }
        }

        return null;
    }

    getDrops() {
        const qty = Math.random() < 0.5 ? 1 : 0;
        return qty > 0 ? [{ block_id: 'gunpowder', quantity: qty }] : [];
    }
}
