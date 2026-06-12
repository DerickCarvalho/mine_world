import { PassiveMob } from './PassiveMob.js';

export class CrawlerMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'crawler', spawnPoint, {
            displayName: 'Crawler',
            angryName: 'Crawler',
            speed: 1.95,
            chaseSpeed: 3.1,
            followDistance: 0,
            attackDistance: 1.05,
            wanderRadius: 4.4,
            maxHealth: 6,
            attackDamage: 2,
            hostileByDefault: true,
            detectRange: 8.5,
            height: 1.02,
            width: 0.96,
            depth: 1.08,
            dropTable: [
                { block_id: 'fang', quantity: 2 }
            ],
            palette: {
                body: {
                    top: { r: 82, g: 110, b: 86 },
                    side: { r: 68, g: 92, b: 72 },
                    bottom: { r: 42, g: 58, b: 46 }
                },
                accent: {
                    top: { r: 136, g: 150, b: 112 },
                    side: { r: 112, g: 126, b: 92 },
                    bottom: { r: 84, g: 96, b: 72 }
                },
                leg: {
                    top: { r: 64, g: 78, b: 66 },
                    side: { r: 52, g: 64, b: 54 },
                    bottom: { r: 36, g: 44, b: 38 }
                }
            }
        });
    }
}
