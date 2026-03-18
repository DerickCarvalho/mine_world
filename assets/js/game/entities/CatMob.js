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

function createCuboidFaces(origin, part, palette) {
    const minX = origin.x + part.minX;
    const maxX = origin.x + part.maxX;
    const minY = origin.y + part.minY;
    const maxY = origin.y + part.maxY;
    const minZ = origin.z + part.minZ;
    const maxZ = origin.z + part.maxZ;

    return [
        createFace([
            { x: minX, y: maxY, z: minZ },
            { x: maxX, y: maxY, z: minZ },
            { x: maxX, y: maxY, z: maxZ },
            { x: minX, y: maxY, z: maxZ }
        ], { x: 0, y: 1, z: 0 }, palette.top, 1, 1),
        createFace([
            { x: minX, y: minY, z: maxZ },
            { x: maxX, y: minY, z: maxZ },
            { x: maxX, y: minY, z: minZ },
            { x: minX, y: minY, z: minZ }
        ], { x: 0, y: -1, z: 0 }, palette.bottom, 0.58, 1),
        createFace([
            { x: minX, y: minY, z: minZ },
            { x: maxX, y: minY, z: minZ },
            { x: maxX, y: maxY, z: minZ },
            { x: minX, y: maxY, z: minZ }
        ], { x: 0, y: 0, z: -1 }, palette.side, 0.82, 1),
        createFace([
            { x: maxX, y: minY, z: maxZ },
            { x: minX, y: minY, z: maxZ },
            { x: minX, y: maxY, z: maxZ },
            { x: maxX, y: maxY, z: maxZ }
        ], { x: 0, y: 0, z: 1 }, palette.side, 0.92, 1),
        createFace([
            { x: maxX, y: minY, z: minZ },
            { x: maxX, y: maxY, z: minZ },
            { x: maxX, y: maxY, z: maxZ },
            { x: maxX, y: minY, z: maxZ }
        ], { x: 1, y: 0, z: 0 }, palette.side, 0.86, 1),
        createFace([
            { x: minX, y: minY, z: maxZ },
            { x: minX, y: maxY, z: maxZ },
            { x: minX, y: maxY, z: minZ },
            { x: minX, y: minY, z: minZ }
        ], { x: -1, y: 0, z: 0 }, palette.side, 0.78, 1)
    ];
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
        this.cachedRenderable = null;
        this.cachedPoseKey = '';
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
            minX: this.position.x - 0.34,
            maxX: this.position.x + 0.34,
            minY: this.position.y,
            maxY: this.position.y + 0.98,
            minZ: this.position.z - 0.62,
            maxZ: this.position.z + 0.62
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
            const distance = Math.hypot(deltaX, deltaZ);
            if (distance > 0.001) {
                this.yaw = Math.atan2(-deltaX, deltaZ);
            }
        }
    }

    update(deltaTime, playerPosition, world, isWalkable) {
        this.animationTime += deltaTime * (this.aggressive ? 8 : (this.following ? 6 : 3.5));
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
        this.yaw = Math.atan2(-directionX, directionZ);
        return false;
    }

    getRenderable() {
        const legSwing = Math.sin(this.animationTime) * 0.07;
        const tailLift = Math.sin(this.animationTime * 0.75) * 0.03;
        const hurtPulse = this.hurtTime > 0 ? Math.abs(Math.sin((this.hurtTime / 0.34) * Math.PI * 5)) * 0.45 : 0;
        const tint = this.aggressive ? { r: 214, g: 108, b: 98 } : { r: 245, g: 182, b: 116 };
        const poseKey = [
            this.position.x.toFixed(2),
            this.position.y.toFixed(2),
            this.position.z.toFixed(2),
            legSwing.toFixed(3),
            tailLift.toFixed(3),
            hurtPulse.toFixed(3),
            this.aggressive ? 1 : 0
        ].join('|');

        if (this.cachedRenderable && this.cachedPoseKey === poseKey) {
            return this.cachedRenderable;
        }

        const bodyPalette = tintPalette({
            top: { r: 218, g: 160, b: 92 },
            side: { r: 194, g: 135, b: 73 },
            bottom: { r: 148, g: 102, b: 56 }
        }, tint, hurtPulse + (this.aggressive ? 0.12 : 0));
        const muzzlePalette = tintPalette({
            top: { r: 241, g: 205, b: 159 },
            side: { r: 226, g: 182, b: 139 },
            bottom: { r: 204, g: 160, b: 120 }
        }, tint, hurtPulse * 0.45);
        const earPalette = tintPalette({
            top: { r: 246, g: 209, b: 173 },
            side: { r: 224, g: 174, b: 134 },
            bottom: { r: 198, g: 150, b: 116 }
        }, tint, hurtPulse * 0.65);
        const tailPalette = tintPalette({
            top: { r: 192, g: 132, b: 71 },
            side: { r: 172, g: 118, b: 64 },
            bottom: { r: 140, g: 96, b: 54 }
        }, tint, hurtPulse * 0.5);
        const hurtLift = this.hurtTime > 0 ? Math.sin((this.hurtTime / 0.34) * Math.PI * 4) * 0.03 : 0;

        const parts = [
            { minX: -0.18, maxX: 0.18, minY: 0.31 + hurtLift, maxY: 0.6 + hurtLift, minZ: -0.5, maxZ: 0.2, palette: bodyPalette },
            { minX: -0.17, maxX: 0.17, minY: 0.4 + hurtLift, maxY: 0.75 + hurtLift, minZ: 0.2, maxZ: 0.56, palette: bodyPalette },
            { minX: -0.11, maxX: 0.11, minY: 0.34 + hurtLift, maxY: 0.54 + hurtLift, minZ: 0.54, maxZ: 0.72, palette: muzzlePalette },
            { minX: -0.14, maxX: -0.04, minY: 0.72 + hurtLift, maxY: 0.88 + hurtLift, minZ: 0.42, maxZ: 0.54, palette: earPalette },
            { minX: 0.04, maxX: 0.14, minY: 0.72 + hurtLift, maxY: 0.88 + hurtLift, minZ: 0.42, maxZ: 0.54, palette: earPalette },
            { minX: -0.23, maxX: -0.14, minY: 0, maxY: 0.38 + legSwing, minZ: 0.28, maxZ: 0.39, palette: bodyPalette },
            { minX: 0.14, maxX: 0.23, minY: 0, maxY: 0.38 - legSwing, minZ: 0.28, maxZ: 0.39, palette: bodyPalette },
            { minX: -0.23, maxX: -0.14, minY: 0, maxY: 0.38 - legSwing, minZ: -0.36, maxZ: -0.25, palette: bodyPalette },
            { minX: 0.14, maxX: 0.23, minY: 0, maxY: 0.38 + legSwing, minZ: -0.36, maxZ: -0.25, palette: bodyPalette },
            { minX: -0.04, maxX: 0.04, minY: 0.44 + hurtLift + tailLift, maxY: 0.52 + hurtLift + tailLift, minZ: -0.78, maxZ: -0.24, palette: tailPalette }
        ];

        const faces = [];
        for (const part of parts) {
            faces.push.apply(faces, createCuboidFaces(this.position, part, part.palette));
        }

        this.cachedPoseKey = poseKey;
        this.cachedRenderable = {
            key: this.id,
            chunkX: null,
            chunkZ: null,
            faces: faces,
            center: { x: this.position.x, y: this.position.y + 0.44, z: this.position.z },
            radius: 1.04
        };

        return this.cachedRenderable;
    }
}
