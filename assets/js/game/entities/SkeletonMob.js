import { PassiveMob } from './PassiveMob.js';

export class SkeletonMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'skeleton', spawnPoint, {
            displayName: 'Skeleton',
            angryName: 'Skeleton',
            speed: 1.6,
            chaseSpeed: 2.4,
            followDistance: 0,
            attackDistance: 8,
            wanderRadius: 5.0,
            maxHealth: 8,
            attackDamage: 2,
            hostileByDefault: true,
            detectRange: 10,
            height: 1.95,
            width: 0.6,
            depth: 0.6,
            dropTable: [
                { block_id: 'bone', quantity: 1 },
                { block_id: 'arrow', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 222, g: 218, b: 202 },
                    side: { r: 206, g: 202, b: 186 },
                    bottom: { r: 186, g: 182, b: 166 }
                },
                accent: {
                    top: { r: 210, g: 206, b: 190 },
                    side: { r: 194, g: 190, b: 174 },
                    bottom: { r: 174, g: 170, b: 154 }
                },
                leg: {
                    top: { r: 218, g: 214, b: 198 },
                    side: { r: 200, g: 196, b: 180 },
                    bottom: { r: 180, g: 176, b: 160 }
                }
            }
        });
        this.shootCooldown = 0;
    }

    update(deltaTime, playerPosition, world, isWalkable) {
        if (!this.isAlive()) {
            return null;
        }

        this.animationTime += deltaTime * (this.aggressive ? 7.6 : 3.1);
        this.hurtTime = Math.max(0, this.hurtTime - deltaTime);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

        if (!this.aggressive) {
            const detectDist = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
            if (detectDist <= this.detectRange) {
                this.aggressive = true;
            }
        }

        if (this.aggressive) {
            const distance = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);

            if (distance <= 8 && this.shootCooldown <= 0) {
                this.shootCooldown = 2;
                return {
                    type: 'player_hit',
                    damage: this.attackDamage,
                    cause: this.type,
                    entityType: this.type,
                    source: { x: this.position.x, y: this.position.y, z: this.position.z }
                };
            }

            if (distance < 4) {
                const dx = this.position.x - playerPosition.x;
                const dz = this.position.z - playerPosition.z;
                const len = Math.hypot(dx, dz);
                if (len > 0.01) {
                    const fleeX = this.position.x + (dx / len) * 3;
                    const fleeZ = this.position.z + (dz / len) * 3;
                    this.moveTowards(fleeX, fleeZ, deltaTime, world, isWalkable, 0, this.chaseSpeed);
                }
            } else if (distance > 8) {
                this.moveTowards(playerPosition.x, playerPosition.z, deltaTime, world, isWalkable, 7, this.chaseSpeed);
            }

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
        const drops = [];
        const boneQty = Math.floor(Math.random() * 3);
        const arrowQty = Math.floor(Math.random() * 3);
        if (boneQty > 0) drops.push({ block_id: 'bone', quantity: boneQty });
        if (arrowQty > 0) drops.push({ block_id: 'arrow', quantity: arrowQty });
        return drops;
    }
}
