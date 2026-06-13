import { PassiveMob } from './PassiveMob.js';

export class SpiderMob extends PassiveMob {
    constructor(id, spawnPoint) {
        super(id, 'spider', spawnPoint, {
            displayName: 'Aranha',
            angryName: 'Aranha',
            speed: 2.4,
            chaseSpeed: 3.6,
            followDistance: 0,
            attackDistance: 1.2,
            wanderRadius: 6.0,
            maxHealth: 8,
            attackDamage: 2,
            hostileByDefault: false,
            detectRange: 9,
            height: 0.95,
            width: 1.4,
            depth: 1.2,
            dropTable: [
                { block_id: 'string', quantity: 1 }
            ],
            palette: {
                body: {
                    top: { r: 52, g: 38, b: 28 },
                    side: { r: 44, g: 32, b: 22 },
                    bottom: { r: 36, g: 26, b: 18 }
                },
                accent: {
                    top: { r: 148, g: 38, b: 38 },
                    side: { r: 132, g: 32, b: 32 },
                    bottom: { r: 112, g: 26, b: 26 }
                },
                leg: {
                    top: { r: 48, g: 34, b: 24 },
                    side: { r: 40, g: 28, b: 18 },
                    bottom: { r: 32, g: 22, b: 14 }
                }
            }
        });
        this._hitByPlayer = false;
        this._nightMode = false;
    }

    takeHit(attackerPosition, damage) {
        this._hitByPlayer = true;
        return super.takeHit(attackerPosition, damage);
    }

    setTimeOfDay(isNight) {
        if (isNight && !this._nightMode) {
            this._nightMode = true;
            this.hostileByDefault = true;
            this.aggressive = true;
        } else if (!isNight && this._nightMode) {
            this._nightMode = false;
            this.hostileByDefault = false;
            if (!this._hitByPlayer) {
                this.aggressive = false;
                this.wanderTarget = null;
            }
        }
    }

    resetBehavior() {
        super.resetBehavior();
        this._hitByPlayer = false;
        this._nightMode = false;
    }

    getDrops() {
        const qty = Math.floor(Math.random() * 3);
        return qty > 0 ? [{ block_id: 'string', quantity: qty }] : [];
    }
}
