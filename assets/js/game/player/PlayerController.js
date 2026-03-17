import { CollisionResolver } from './CollisionResolver.js';
import { InputState } from './InputState.js';
import { WORLD_CONFIG, clampNumber, normalizeRuntimeConfig } from '../world/WorldConfig.js';

export class PlayerController {
    constructor(options) {
        this.terrain = options.terrain;
        this.canvas = options.canvas;
        this.config = normalizeRuntimeConfig(options.config);
        this.position = {
            x: options.spawn.x,
            y: options.spawn.y,
            z: options.spawn.z
        };
        this.velocity = { x: 0, z: 0 };
        this.velocityY = 0;
        this.yaw = Math.PI * 0.25;
        this.pitch = 0.18;
        this.grounded = true;
        this.input = new InputState(this.canvas);
        this.collision = new CollisionResolver(this.terrain);
        this.onPointerLockChange = null;

        this.input.onPointerLockChange = (locked) => {
            if (typeof this.onPointerLockChange === 'function') {
                this.onPointerLockChange(locked);
            }
        };
    }

    attach() {
        this.input.attach();
    }

    detach() {
        this.input.detach();
    }

    update(deltaTime) {
        this.updateLook();
        this.updateMovement(deltaTime);
    }

    updateLook() {
        const lookDelta = this.input.consumeLookDelta();
        const sensitivity = 0.0022 * this.config.mouse_sensitivity;
        const invertFactor = this.config.invert_y === 1 ? -1 : 1;

        this.yaw += lookDelta.x * sensitivity;
        this.pitch = clampNumber(this.pitch + lookDelta.y * sensitivity * invertFactor, -1.3, 1.3);
    }

    updateMovement(deltaTime) {
        const forward = (this.input.forward ? 1 : 0) - (this.input.backward ? 1 : 0);
        const sideways = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
        const moveMagnitude = Math.hypot(forward, sideways);
        const normalizedForward = moveMagnitude > 0 ? forward / moveMagnitude : 0;
        const normalizedSideways = moveMagnitude > 0 ? sideways / moveMagnitude : 0;
        const forwardVectorX = Math.sin(this.yaw);
        const forwardVectorZ = Math.cos(this.yaw);
        const rightVectorX = Math.cos(this.yaw);
        const rightVectorZ = -Math.sin(this.yaw);
        const targetVelocityX = (forwardVectorX * normalizedForward + rightVectorX * normalizedSideways) * WORLD_CONFIG.baseMoveSpeed;
        const targetVelocityZ = (forwardVectorZ * normalizedForward + rightVectorZ * normalizedSideways) * WORLD_CONFIG.baseMoveSpeed;
        const smoothing = Math.min(1, deltaTime * 10);

        this.velocity.x += (targetVelocityX - this.velocity.x) * smoothing;
        this.velocity.z += (targetVelocityZ - this.velocity.z) * smoothing;

        if (this.grounded && this.input.jump) {
            this.velocityY = WORLD_CONFIG.jumpVelocity;
            this.grounded = false;
        }

        if (!this.grounded) {
            this.velocityY -= WORLD_CONFIG.gravity * deltaTime;
        }

        const horizontal = this.collision.resolveHorizontal(this.position, this.velocity.x * deltaTime, this.velocity.z * deltaTime);
        this.position.x = horizontal.x;
        this.position.z = horizontal.z;

        const nextY = this.position.y + this.velocityY * deltaTime;
        const supportHeight = horizontal.supportHeight;

        if (nextY <= supportHeight) {
            this.position.y = supportHeight;
            this.velocityY = 0;
            this.grounded = true;
        } else {
            this.position.y = nextY;
            this.grounded = false;
        }
    }

    isPointerLocked() {
        return this.input.locked;
    }

    getFeetPosition() {
        return {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        };
    }

    getCameraState() {
        return {
            position: {
                x: this.position.x,
                y: this.position.y + WORLD_CONFIG.playerHeight,
                z: this.position.z
            },
            yaw: this.yaw,
            pitch: this.pitch
        };
    }
}
