import { PassiveMob } from './PassiveMob.js';

export class CowMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'cow', spawnPoint, {
            displayName: 'Vaca',
            angryName: 'Vaca assustada',
            speed: 1.4,
            chaseSpeed: 2.2,
            followDistance: 1.9,
            wanderRadius: 5.0,
            maxHealth: 5,
            attackDamage: 1,
            height: 1.4,
            width: 0.9,
            depth: 1.2,
            dropTable: [
                { block_id: 'raw_beef', quantity: 2 },
                { block_id: 'leather', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 46, g: 38, b: 32 },
                    side: { r: 54, g: 44, b: 36 },
                    bottom: { r: 38, g: 30, b: 24 }
                },
                accent: {
                    top: { r: 206, g: 196, b: 186 },
                    side: { r: 188, g: 178, b: 168 },
                    bottom: { r: 164, g: 154, b: 144 }
                },
                leg: {
                    top: { r: 42, g: 34, b: 28 },
                    side: { r: 36, g: 28, b: 22 },
                    bottom: { r: 30, g: 22, b: 16 }
                }
            }
        });
    }

    getDrops() {
        return [
            { block_id: 'raw_beef', quantity: 1 + Math.floor(Math.random() * 3) },
            { block_id: 'leather', quantity: 1 + Math.floor(Math.random() * 2) }
        ];
    }
}
