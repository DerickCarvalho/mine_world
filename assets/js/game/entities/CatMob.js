function createFace(vertices, normal, color, shade, alpha) {
    const center = vertices.reduce(function (accumulator, vertex) {
        accumulator.x += vertex.x;
        accumulator.y += vertex.y;
        accumulator.z += vertex.z;
        return accumulator;
    }, { x: 0, y: 0, z: 0 });

    center.x /= vertices.length;
    center.y /= vertices.length;
    center.z /= vertices.length;

    return {
        vertices: vertices,
        normal: normal,
        center: center,
        color: color,
        shade: shade,
        alpha: alpha
    };
}

function createCuboidFaces(bounds, palette) {
    return [
        createFace([
            { x: bounds.minX, y: bounds.maxY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ },
            { x: bounds.minX, y: bounds.maxY, z: bounds.maxZ }
        ], { x: 0, y: 1, z: 0 }, palette.top, 1, 1),
        createFace([
            { x: bounds.minX, y: bounds.minY, z: bounds.maxZ },
            { x: bounds.maxX, y: bounds.minY, z: bounds.maxZ },
            { x: bounds.maxX, y: bounds.minY, z: bounds.minZ },
            { x: bounds.minX, y: bounds.minY, z: bounds.minZ }
        ], { x: 0, y: -1, z: 0 }, palette.bottom, 0.56, 1),
        createFace([
            { x: bounds.minX, y: bounds.minY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.minY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.minZ },
            { x: bounds.minX, y: bounds.maxY, z: bounds.minZ }
        ], { x: 0, y: 0, z: -1 }, palette.side, 0.82, 1),
        createFace([
            { x: bounds.maxX, y: bounds.minY, z: bounds.maxZ },
            { x: bounds.minX, y: bounds.minY, z: bounds.maxZ },
            { x: bounds.minX, y: bounds.maxY, z: bounds.maxZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ }
        ], { x: 0, y: 0, z: 1 }, palette.side, 0.92, 1),
        createFace([
            { x: bounds.maxX, y: bounds.minY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.minZ },
            { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ },
            { x: bounds.maxX, y: bounds.minY, z: bounds.maxZ }
        ], { x: 1, y: 0, z: 0 }, palette.side, 0.86, 1),
        createFace([
            { x: bounds.minX, y: bounds.minY, z: bounds.maxZ },
            { x: bounds.minX, y: bounds.maxY, z: bounds.maxZ },
            { x: bounds.minX, y: bounds.maxY, z: bounds.minZ },
            { x: bounds.minX, y: bounds.minY, z: bounds.minZ }
        ], { x: -1, y: 0, z: 0 }, palette.side, 0.78, 1)
    ];
}

function angleToYaw(directionX, directionZ) {
    return Math.atan2(-directionX, directionZ);
}

function tintColor(color, tint, amount) {
    return {
        r: Math.round(color.r + (tint.r - color.r) * amount),
        g: Math.round(color.g + (tint.g - color.g) * amount),
        b: Math.round(color.b + (tint.b - color.b) * amount)
    };
}

function tintPalette(palette, tint, amount) {
    return {
        top: tintColor(palette.top, tint, amount),
        side: tintColor(palette.side, tint, amount),
        bottom: tintColor(palette.bottom, tint, amount)
    };
}

export class CatMob {
    constructor(id, spawnPoint) {
        this.id = id;
        this.position = {
            x: spawnPoint.x,
            y: spawnPoint.y,
            z: spawnPoint.z
        };
        this.following = false;
        this.aggressive = false;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        this.animationTime = Math.random() * Math.PI * 2;
        this.hurtTime = 0;
        this.attackCooldown = 0;
        this.yaw = 0;
        this.speed = 2.1;
        this.chaseSpeed = 3.15;
    }

    getDisplayName() {
        return this.aggressive ? 'Gato bravo' : 'Gato';
    }

    getBehaviorLabel() {
        if (this.aggressive) {
            return 'agressivo';
        }

        if (this.following) {
            return 'seguindo';
        }

        return 'vagando';
    }

    getAabb() {
        return {
            minX: this.position.x - 0.36,
            maxX: this.position.x + 0.36,
            minY: this.position.y,
            maxY: this.position.y + 0.95,
            minZ: this.position.z - 0.6,
            maxZ: this.position.z + 0.6
        };
    }

    resetBehavior() {
        this.following = false;
        this.aggressive = false;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        this.attackCooldown = 0;
    }

    toggleFollow() {
        if (this.aggressive) {
            return null;
        }

        this.following = !this.following;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        return this.following;
    }

    takeHit(attackerPosition) {
        this.hurtTime = 0.34;
        this.aggressive = true;
        this.following = false;
        this.wanderTarget = null;
        this.wanderTimer = 0;

        if (attackerPosition) {
            const deltaX = attackerPosition.x - this.position.x;
            const deltaZ = attackerPosition.z - this.position.z;
            if (Math.hypot(deltaX, deltaZ) > 0.001) {
                this.yaw = angleToYaw(deltaX, deltaZ);
            }
        }
    }

    update(deltaTime, playerPosition, world, isWalkable) {
        this.animationTime += deltaTime * (this.aggressive ? 9 : (this.following ? 7 : 4));
        this.hurtTime = Math.max(0, this.hurtTime - deltaTime);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);

        if (this.aggressive) {
            const distance = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
            if (distance <= 0.95 && this.attackCooldown <= 0) {
                this.attackCooldown = 0.9;
                return {
                    type: 'player_hit',
                    damage: 1,
                    source: {
                        x: this.position.x,
                        y: this.position.y,
                        z: this.position.z
                    }
                };
            }

            this.moveTowards(playerPosition.x, playerPosition.z, deltaTime, world, isWalkable, 0.7, this.chaseSpeed);
            return null;
        }

        if (this.following) {
            this.moveTowards(playerPosition.x, playerPosition.z, deltaTime, world, isWalkable, 1.5, this.speed + 0.25);
            return null;
        }

        this.wanderTimer -= deltaTime;
        if (!this.wanderTarget || this.wanderTimer <= 0) {
            this.wanderTarget = this.chooseWanderTarget(world, isWalkable);
            this.wanderTimer = 2.5 + Math.random() * 3.5;
        }

        if (!this.wanderTarget) {
            return null;
        }

        const reached = this.moveTowards(this.wanderTarget.x, this.wanderTarget.z, deltaTime, world, isWalkable, 0.2, this.speed);
        if (reached) {
            this.wanderTarget = null;
        }

        return null;
    }

    chooseWanderTarget(world, isWalkable) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 2 + Math.random() * 5;
            const x = this.position.x + Math.cos(angle) * distance;
            const z = this.position.z + Math.sin(angle) * distance;
            const topY = world.getTopSolidYAt(x, z);

            if (topY < 0 || !isWalkable(x, z, topY)) {
                continue;
            }

            return {
                x: Math.floor(x) + 0.5,
                z: Math.floor(z) + 0.5,
                y: topY + 1
            };
        }

        return null;
    }

    moveTowards(targetX, targetZ, deltaTime, world, isWalkable, stopDistance, speed) {
        const deltaX = targetX - this.position.x;
        const deltaZ = targetZ - this.position.z;
        const distance = Math.hypot(deltaX, deltaZ);

        if (distance <= stopDistance) {
            return true;
        }

        const directionX = deltaX / distance;
        const directionZ = deltaZ / distance;
        const step = Math.min(distance, speed * deltaTime);
        const nextX = this.position.x + directionX * step;
        const nextZ = this.position.z + directionZ * step;
        const topY = world.getTopSolidYAt(nextX, nextZ);

        if (topY < 0 || !isWalkable(nextX, nextZ, topY) || Math.abs((topY + 1) - this.position.y) > 1.2) {
            this.wanderTarget = null;
            return false;
        }

        this.position.x = nextX;
        this.position.z = nextZ;
        this.position.y = topY + 1;
        this.yaw = angleToYaw(directionX, directionZ);
        return false;
    }

    getRenderable() {
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const legSwing = Math.sin(this.animationTime) * 0.06;
        const hurtPulse = this.hurtTime > 0 ? Math.abs(Math.sin((this.hurtTime / 0.34) * Math.PI * 5)) * 0.45 : 0;
        const tint = this.aggressive ? { r: 214, g: 108, b: 98 } : { r: 245, g: 182, b: 116 };
        const bodyPalette = tintPalette({
            top: { r: 212, g: 158, b: 92 },
            side: { r: 191, g: 132, b: 73 },
            bottom: { r: 150, g: 104, b: 58 }
        }, tint, hurtPulse + (this.aggressive ? 0.1 : 0));
        const earPalette = tintPalette({
            top: { r: 238, g: 187, b: 133 },
            side: { r: 216, g: 156, b: 108 },
            bottom: { r: 196, g: 140, b: 98 }
        }, tint, hurtPulse * 0.8);
        const tailPalette = tintPalette({
            top: { r: 185, g: 128, b: 71 },
            side: { r: 170, g: 118, b: 64 },
            bottom: { r: 138, g: 94, b: 53 }
        }, tint, hurtPulse * 0.6);
        const hurtLift = this.hurtTime > 0 ? Math.sin((this.hurtTime / 0.34) * Math.PI * 4) * 0.04 : 0;

        const parts = [
            { minX: -0.28, maxX: 0.28, minY: 0.28 + hurtLift, maxY: 0.64 + hurtLift, minZ: -0.42, maxZ: 0.38, palette: bodyPalette },
            { minX: -0.2, maxX: 0.2, minY: 0.42 + hurtLift, maxY: 0.82 + hurtLift, minZ: 0.34, maxZ: 0.72, palette: bodyPalette },
            { minX: -0.16, maxX: -0.03, minY: 0.76 + hurtLift, maxY: 0.92 + hurtLift, minZ: 0.54, maxZ: 0.68, palette: earPalette },
            { minX: 0.03, maxX: 0.16, minY: 0.76 + hurtLift, maxY: 0.92 + hurtLift, minZ: 0.54, maxZ: 0.68, palette: earPalette },
            { minX: -0.06, maxX: 0.06, minY: 0.44 + hurtLift, maxY: 0.54 + hurtLift, minZ: -0.7, maxZ: -0.32, palette: tailPalette },
            { minX: -0.22, maxX: -0.12, minY: 0, maxY: 0.34 + legSwing, minZ: 0.18, maxZ: 0.3, palette: bodyPalette },
            { minX: 0.12, maxX: 0.22, minY: 0, maxY: 0.34 - legSwing, minZ: 0.18, maxZ: 0.3, palette: bodyPalette },
            { minX: -0.22, maxX: -0.12, minY: 0, maxY: 0.34 - legSwing, minZ: -0.28, maxZ: -0.16, palette: bodyPalette },
            { minX: 0.12, maxX: 0.22, minY: 0, maxY: 0.34 + legSwing, minZ: -0.28, maxZ: -0.16, palette: bodyPalette }
        ];

        const faces = [];
        for (const part of parts) {
            const rotatedBounds = {
                minX: Number.POSITIVE_INFINITY,
                maxX: Number.NEGATIVE_INFINITY,
                minY: this.position.y + part.minY,
                maxY: this.position.y + part.maxY,
                minZ: Number.POSITIVE_INFINITY,
                maxZ: Number.NEGATIVE_INFINITY
            };

            const corners = [
                { x: part.minX, z: part.minZ },
                { x: part.maxX, z: part.minZ },
                { x: part.maxX, z: part.maxZ },
                { x: part.minX, z: part.maxZ }
            ];

            for (const corner of corners) {
                const worldX = this.position.x + corner.x * cosYaw - corner.z * sinYaw;
                const worldZ = this.position.z + corner.x * sinYaw + corner.z * cosYaw;
                rotatedBounds.minX = Math.min(rotatedBounds.minX, worldX);
                rotatedBounds.maxX = Math.max(rotatedBounds.maxX, worldX);
                rotatedBounds.minZ = Math.min(rotatedBounds.minZ, worldZ);
                rotatedBounds.maxZ = Math.max(rotatedBounds.maxZ, worldZ);
            }

            faces.push.apply(faces, createCuboidFaces(rotatedBounds, part.palette));
        }

        return {
            key: this.id,
            chunkX: null,
            chunkZ: null,
            faces: faces,
            center: { x: this.position.x, y: this.position.y + 0.45, z: this.position.z },
            radius: 1.2
        };
    }
}