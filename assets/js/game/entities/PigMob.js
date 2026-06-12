import { PassiveMob } from './PassiveMob.js';

export class PigMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'pig', spawnPoint, {
            displayName: 'Porco',
            angryName: 'Porco bravo',
            speed: 1.8,
            chaseSpeed: 2.7,
            followDistance: 1.9,
            wanderRadius: 5.5,
            maxHealth: 5,
            attackDamage: 1,
            height: 1.08,
            width: 0.84,
            depth: 1.02,
            dropTable: [
                { block_id: 'raw_pork', quantity: 2 }
            ],
            palette: {
                body: {
                    top: { r: 222, g: 160, b: 168 },
                    side: { r: 206, g: 142, b: 152 },
                    bottom: { r: 176, g: 116, b: 126 }
                },
                accent: {
                    top: { r: 238, g: 188, b: 194 },
                    side: { r: 228, g: 172, b: 178 },
                    bottom: { r: 198, g: 145, b: 151 }
                },
                leg: {
                    top: { r: 198, g: 136, b: 148 },
                    side: { r: 182, g: 120, b: 132 },
                    bottom: { r: 154, g: 96, b: 108 }
                }
            }
        });
    }
}
