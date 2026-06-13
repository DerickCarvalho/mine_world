import { PassiveMob } from './PassiveMob.js';

export class ChickenMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'chicken', spawnPoint, {
            displayName: 'Galinha',
            angryName: 'Galinha assustada',
            speed: 1.6,
            chaseSpeed: 2.5,
            followDistance: 1.5,
            wanderRadius: 4.5,
            maxHealth: 2,
            attackDamage: 1,
            height: 0.7,
            width: 0.4,
            depth: 0.6,
            dropTable: [
                { block_id: 'raw_chicken', quantity: 1 },
                { block_id: 'feather', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 248, g: 248, b: 248 },
                    side: { r: 232, g: 232, b: 232 },
                    bottom: { r: 210, g: 210, b: 210 }
                },
                accent: {
                    top: { r: 186, g: 52, b: 52 },
                    side: { r: 168, g: 44, b: 44 },
                    bottom: { r: 148, g: 38, b: 38 }
                },
                leg: {
                    top: { r: 220, g: 178, b: 52 },
                    side: { r: 200, g: 158, b: 42 },
                    bottom: { r: 176, g: 136, b: 32 }
                }
            }
        });
    }

    getDrops() {
        return [
            { block_id: 'raw_chicken', quantity: 1 },
            { block_id: 'feather', quantity: 1 + Math.floor(Math.random() * 2) }
        ];
    }
}
