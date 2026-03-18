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
        this.knockbackVelocity = { x: 0, z: 0 };
        this.velocityY = 0;
        this.yaw = 0;
        this.pitch = DEFAULT_PITCH;
        this.grounded = true;
        this.maxAirborneY = 0;
        this.flyEnabled = Boolean(options.flyEnabled);
        this.flying = this.flyEnabled && Boolean(options.flying);
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

    setFlyEnabled(enabled) {
        this.flyEnabled = Boolean(enabled);
        if (!this.flyEnabled) {
            this.flying = false;
            this.velocityY = Math.min(0, this.velocityY);
        }
    }

    isFlyEnabled() {
        return this.flyEnabled;
    }

    isFlying() {
        return this.flying;
    }

    toggleFlightMode(forceState) {
        if (!this.flyEnabled) {
            return this.flying;
        }

        const nextState = typeof forceState === 'boolean' ? forceState : !this.flying;
        this.flying = nextState;
        this.velocityY = 0;
        this.maxAirborneY = this.position.y;
        if (this.flying) {
            this.grounded = false;
        }

        return this.flying;
    }

    applyKnockback(fromPosition) {
        if (!fromPosition) {
            return;
        }

        const deltaX = this.position.x - Number(fromPosition.x || 0);
        const deltaZ = this.position.z - Number(fromPosition.z || 0);
        const distance = Math.hypot(deltaX, deltaZ) || 1;
        const directionX = deltaX / distance;
        const directionZ = deltaZ / distance;
        const impulse = 6.4;

        this.knockbackVelocity.x = directionX * impulse;
        this.knockbackVelocity.z = directionZ * impulse;
        this.velocityY = Math.max(this.velocityY, WORLD_CONFIG.jumpVelocity * 0.42);
        this.grounded = false;
        this.maxAirborneY = Math.max(this.maxAirborneY, this.position.y + 0.5);
    }

    update(deltaTime) {
        this.updateLook();
        return this.updateMovement(deltaTime);
    }

    updateLook() {
        const lookDelta = this.input.consumeLookDelta();
        const sensitivity = 0.0022 * this.config.mouse_sensitivity;
        const invertFactor = this.config.invert_y === 1 ? -1 : 1;

        this.yaw = normalizeAngle(this.yaw - lookDelta.x * sensitivity);
        this.pitch = clampPitch(this.pitch - lookDelta.y * sensitivity * invertFactor);
    }

    updateMovement(deltaTime) {
        const events = [];
        const wasGrounded = this.grounded;
        const previousY = this.position.y;
        const forward = (this.input.forward ? 1 : 0) - (this.input.backward ? 1 : 0);
        const sideways = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
        const moveMagnitude = Math.hypot(forward, sideways);
        const normalizedForward = moveMagnitude > 0 ? forward / moveMagnitude : 0;
        const normalizedSideways = moveMagnitude > 0 ? sideways / moveMagnitude : 0;
        const forwardVector = getForwardVector(this.yaw);
        const rightVector = getRightVector(this.yaw);
        const moveSpeed = this.flying ? WORLD_CONFIG.flightMoveSpeed : WORLD_CONFIG.baseMoveSpeed;
        const targetVelocityX = (forwardVector.x * normalizedForward + rightVector.x * normalizedSideways) * moveSpeed;
        const targetVelocityZ = (forwardVector.z * normalizedForward + rightVector.z * normalizedSideways) * moveSpeed;
        const smoothing = Math.min(1, deltaTime * (this.flying ? 12 : 10));

        this.velocity.x += (targetVelocityX - this.velocity.x) * smoothing;
        this.velocity.z += (targetVelocityZ - this.velocity.z) * smoothing;

        if (this.flying) {
            const ascend = this.input.jump ? 1 : 0;
            const descend = this.input.descend ? 1 : 0;
            const targetVerticalVelocity = (ascend - descend) * WORLD_CONFIG.flightVerticalSpeed;
            this.velocityY += (targetVerticalVelocity - this.velocityY) * Math.min(1, deltaTime * 16);
        } else {
            if (this.grounded && this.input.jump) {
                this.velocityY = WORLD_CONFIG.jumpVelocity;
                this.grounded = false;
                this.maxAirborneY = this.position.y;
            }

            if (!this.grounded) {
                this.maxAirborneY = Math.max(this.maxAirborneY, this.position.y);
                this.velocityY -= WORLD_CONFIG.gravity * deltaTime;
            }
        }

        const knockbackDamping = Math.min(1, deltaTime * (this.grounded ? 10 : 6));
        this.knockbackVelocity.x += (0 - this.knockbackVelocity.x) * knockbackDamping;
        this.knockbackVelocity.z += (0 - this.knockbackVelocity.z) * knockbackDamping;

        const horizontal = this.collision.resolveHorizontal(
            this.position,
            (this.velocity.x + this.knockbackVelocity.x) * deltaTime,
            (this.velocity.z + this.knockbackVelocity.z) * deltaTime
        );
        this.position.x = horizontal.x;
        this.position.z = horizontal.z;

        if (this.flying) {
            const vertical = this.collision.resolveFlyingVertical(this.position, this.velocityY * deltaTime);
            this.position.y = vertical.y;
            this.grounded = false;

            if ((vertical.hitCeiling && this.velocityY > 0) || (vertical.hitFloor && this.velocityY < 0)) {
                this.velocityY = 0;
            } else if (!this.input.jump && !this.input.descend) {
                this.velocityY *= Math.max(0, 1 - deltaTime * 10);
            }

            return events;
        }

        const vertical = this.collision.resolveVertical(this.position, this.position.y + this.velocityY * deltaTime);
        this.position.y = vertical.y;
        this.grounded = vertical.grounded;

        if (wasGrounded && !vertical.grounded) {
            this.maxAirborneY = previousY;
        }

        if (!wasGrounded && !vertical.grounded) {
            this.maxAirborneY = Math.max(this.maxAirborneY, previousY, this.position.y);
        }

        if (!wasGrounded && vertical.grounded) {
            const fallDistance = Math.max(0, this.maxAirborneY - this.position.y);
            if (fallDistance >= WORLD_CONFIG.fallDamageStart) {
                events.push({
                    type: 'fall_damage',
                    distance: fallDistance
                });
            }

            this.maxAirborneY = this.position.y;
        }

        if (vertical.hitCeiling || this.grounded) {
            this.velocityY = 0;
        }

        if (this.grounded) {
            this.maxAirborneY = this.position.y;
        }

        return events;
    }

    applyPose(pose) {
        const nextX = Number.isFinite(Number(pose.x)) ? Number(pose.x) : 0.5;
        const nextZ = Number.isFinite(Number(pose.z)) ? Number(pose.z) : 0.5;
        const requestedY = Number.isFinite(Number(pose.y)) ? Number(pose.y) : WORLD_CONFIG.height;
        const supportHeight = this.collision.getSupportHeight(nextX, nextZ, requestedY);

        this.position.x = nextX;
        this.position.z = nextZ;
        this.position.y = this.flying ? requestedY : Math.max(requestedY, supportHeight);
        this.yaw = normalizeAngle(Number.isFinite(Number(pose.yaw)) ? Number(pose.yaw) : 0);
        this.pitch = clampPitch(Number.isFinite(Number(pose.pitch)) ? Number(pose.pitch) : DEFAULT_PITCH);
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.velocityY = 0;
        this.knockbackVelocity.x = 0;
        this.knockbackVelocity.z = 0;
        this.grounded = !this.flying && this.position.y <= supportHeight + 0.0001;
        this.maxAirborneY = this.position.y;
    }

    teleportTo(position) {
        this.applyPose({
            x: position.x,
            y: position.y,
            z: position.z,
            yaw: this.yaw,
            pitch: this.pitch
        });
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

    getRotation() {
        return {
            yaw: this.yaw,
            pitch: this.pitch
        };
    }

    getMovementState() {
        return {
            speed: Math.hypot(this.velocity.x + this.knockbackVelocity.x, this.velocity.z + this.knockbackVelocity.z),
            grounded: this.grounded,
            flying: this.flying,
            flyEnabled: this.flyEnabled,
            movingVertically: Math.abs(this.velocityY) > 0.18,
            descending: this.input.descend === true,
            jumping: this.input.jump === true
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
            },
            fly_enabled: this.flyEnabled ? 1 : 0,
            fly_active: this.flying ? 1 : 0
        };
    }
}
