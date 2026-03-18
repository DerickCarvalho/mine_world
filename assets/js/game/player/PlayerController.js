import { CollisionResolver } from './CollisionResolver.js';
import { InputState } from './InputState.js';
import { WORLD_CONFIG, normalizeRuntimeConfig } from '../world/WorldConfig.js';
import { clampPitch, getForwardVector, getRightVector, normalizeAngle } from '../core/CameraMath.js';

const DEFAULT_PITCH = -0.12;

export class PlayerController {
    constructor(options) {
        this.world = options.world;
        this.canvas = options.canvas;
        this.config = normalizeRuntimeConfig(options.config);
        this.position = {
            x: 0.5,
            y: 0,
            z: 0.5
        };
        this.velocity = { x: 0, z: 0 };
        this.velocityY = 0;
        this.yaw = 0;
        this.pitch = DEFAULT_PITCH;
        this.grounded = true;
        this.input = new InputState(this.canvas);
        this.collision = new CollisionResolver(this.world);
        this.onPointerLockChange = null;

        this.input.onPointerLockChange = (locked) => {
            if (typeof this.onPointerLockChange === 'function') {
                this.onPointerLockChange(locked);
            }
        };

        this.applyPose(options.spawn || {});
    }

    attach() {
        this.input.attach();
    }

    detach() {
        this.input.detach();
    }

    setGameplayEnabled(enabled) {
        this.input.setGameplayEnabled(enabled);
    }

    requestPointerLock() {
        this.input.requestPointerLock();
    }

    releasePointerLock() {
        this.input.releasePointerLock();
    }

    resetTransientInput() {
        this.input.clearTransientInput();
    }

    applyConfig(config) {
        this.config = normalizeRuntimeConfig(Object.assign({}, this.config, config || {}));
    }

    consumeInputActions() {
        return this.input.consumeActions();
    }

    update(deltaTime) {
        this.updateLook();
        this.updateMovement(deltaTime);
    }

    updateLook() {
        const lookDelta = this.input.consumeLookDelta();
        const sensitivity = 0.0022 * this.config.mouse_sensitivity;
        const invertFactor = this.config.invert_y === 1 ? -1 : 1;

        this.yaw = normalizeAngle(this.yaw - lookDelta.x * sensitivity);
        this.pitch = clampPitch(this.pitch - lookDelta.y * sensitivity * invertFactor);
    }

    updateMovement(deltaTime) {
        const forward = (this.input.forward ? 1 : 0) - (this.input.backward ? 1 : 0);
        const sideways = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
        const moveMagnitude = Math.hypot(forward, sideways);
        const normalizedForward = moveMagnitude > 0 ? forward / moveMagnitude : 0;
        const normalizedSideways = moveMagnitude > 0 ? sideways / moveMagnitude : 0;
        const forwardVector = getForwardVector(this.yaw);
        const rightVector = getRightVector(this.yaw);
        const targetVelocityX = (forwardVector.x * normalizedForward + rightVector.x * normalizedSideways) * WORLD_CONFIG.baseMoveSpeed;
        const targetVelocityZ = (forwardVector.z * normalizedForward + rightVector.z * normalizedSideways) * WORLD_CONFIG.baseMoveSpeed;
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

        const vertical = this.collision.resolveVertical(this.position, this.position.y + this.velocityY * deltaTime);
        this.position.y = vertical.y;
        this.grounded = vertical.grounded;

        if (this.grounded || vertical.hitCeiling) {
            this.velocityY = 0;
        }
    }

    applyPose(pose) {
        const nextX = Number.isFinite(Number(pose.x)) ? Number(pose.x) : 0.5;
        const nextZ = Number.isFinite(Number(pose.z)) ? Number(pose.z) : 0.5;
        const supportHeight = this.collision.getSupportHeight(nextX, nextZ, Number.isFinite(Number(pose.y)) ? Number(pose.y) : WORLD_CONFIG.height);
        const requestedY = Number.isFinite(Number(pose.y)) ? Number(pose.y) : supportHeight;

        this.position.x = nextX;
        this.position.z = nextZ;
        this.position.y = Math.max(requestedY, supportHeight);
        this.yaw = normalizeAngle(Number.isFinite(Number(pose.yaw)) ? Number(pose.yaw) : 0);
        this.pitch = clampPitch(Number.isFinite(Number(pose.pitch)) ? Number(pose.pitch) : DEFAULT_PITCH);
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.velocityY = 0;
        this.grounded = this.position.y <= supportHeight + 0.0001;
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

    getMovementState() {
        return {
            speed: Math.hypot(this.velocity.x, this.velocity.z),
            grounded: this.grounded
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

    getBodyAabb(footYOverride) {
        const footY = Number.isFinite(Number(footYOverride)) ? Number(footYOverride) : this.position.y;

        return {
            minX: this.position.x - WORLD_CONFIG.playerRadius,
            maxX: this.position.x + WORLD_CONFIG.playerRadius,
            minY: footY,
            maxY: footY + WORLD_CONFIG.playerHeight,
            minZ: this.position.z - WORLD_CONFIG.playerRadius,
            maxZ: this.position.z + WORLD_CONFIG.playerRadius
        };
    }

    getSavePose() {
        return {
            position: {
                x: Number(this.position.x.toFixed(3)),
                y: Number(this.position.y.toFixed(3)),
                z: Number(this.position.z.toFixed(3))
            },
            rotation: {
                yaw: Number(this.yaw.toFixed(6)),
                pitch: Number(this.pitch.toFixed(6))
            }
        };
    }
}
