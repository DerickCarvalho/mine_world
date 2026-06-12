import { PassiveMob } from './PassiveMob.js';

export class SheepMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'sheep', spawnPoint, {
            displayName: 'Ovelha',
            angryName: 'Ovelha assustada',
            speed: 1.7,
            chaseSpeed: 2.55,
            followDistance: 1.85,
            wanderRadius: 4.8,
            maxHealth: 5,
            attackDamage: 1,
            height: 1.12,
            width: 0.88,
            depth: 0.98,
            dropTable: [
                { block_id: 'cloth', quantity: 2 }
            ],
            palette: {
                body: {
                    top: { r: 232, g: 236, b: 238 },
                    side: { r: 218, g: 222, b: 226 },
                    bottom: { r: 190, g: 194, b: 198 }
                },
                accent: {
                    top: { r: 176, g: 148, b: 130 },
                    side: { r: 154, g: 128, b: 112 },
                    bottom: { r: 126, g: 102, b: 88 }
                },
                leg: {
                    top: { r: 150, g: 124, b: 108 },
                    side: { r: 132, g: 106, b: 92 },
                    bottom: { r: 110, g: 88, b: 74 }
                }
            }
        });
    }
}
