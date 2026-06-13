import { PassiveMob } from './PassiveMob.js';

export class ZombieMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'zombie', spawnPoint, {
            displayName: 'Zombie',
            angryName: 'Zombie',
            speed: 1.4,
            chaseSpeed: 2.1,
            followDistance: 0,
            attackDistance: 1.2,
            wanderRadius: 5.0,
            maxHealth: 10,
            attackDamage: 2,
            hostileByDefault: true,
            detectRange: 12,
            height: 1.95,
            width: 0.72,
            depth: 0.72,
            dropTable: [
                { block_id: 'rotten_flesh', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 82, g: 128, b: 90 },
                    side: { r: 70, g: 112, b: 78 },
                    bottom: { r: 58, g: 94, b: 64 }
                },
                accent: {
                    top: { r: 62, g: 88, b: 108 },
                    side: { r: 52, g: 76, b: 96 },
                    bottom: { r: 42, g: 64, b: 82 }
                },
                leg: {
                    top: { r: 68, g: 80, b: 106 },
                    side: { r: 56, g: 68, b: 92 },
                    bottom: { r: 46, g: 56, b: 76 }
                }
            }
        });
        this.attackCooldown = 1;
    }

    getDrops() {
        const qty = Math.floor(Math.random() * 3);
        return qty > 0 ? [{ block_id: 'rotten_flesh', quantity: qty }] : [];
    }
}
