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

export class PassiveMob {
    constructor(id, type, spawnPoint, config = {}) {
        this.id = id;
        this.type = type;
        this.position = {
            x: spawnPoint.x,
            y: spawnPoint.y,
            z: spawnPoint.z
        };
        this.following = false;
        this.aggressive = config.hostileByDefault === true;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        this.animationTime = Math.random() * Math.PI * 2;
        this.hurtTime = 0;
        this.attackCooldown = 0;
        this.yaw = 0;
        this.maxHealth = Math.max(1, Math.floor(Number(config.maxHealth || 4)));
        this.health = this.maxHealth;
        this.attackDamage = Math.max(1, Math.floor(Number(config.attackDamage || 1)));
        this.hostileByDefault = config.hostileByDefault === true;
        this.detectRange = Number(config.detectRange || 6.4);
        this.dropTable = Array.isArray(config.dropTable) ? config.dropTable.map(function (entry) {
            return {
                block_id: String(entry.block_id || 'air'),
                quantity: Math.max(1, Math.floor(Number(entry.quantity || 1)))
            };
        }) : [];
        this.speed = config.speed || 1.9;
        this.chaseSpeed = config.chaseSpeed || 2.8;
        this.followDistance = config.followDistance || 1.7;
        this.attackDistance = config.attackDistance || 0.95;
        this.wanderRadius = config.wanderRadius || 5;
        this.height = config.height || 1.1;
        this.width = config.width || 0.72;
        this.depth = config.depth || 0.92;
        this.displayName = config.displayName || 'Mob';
        this.angryName = config.angryName || this.displayName + ' bravo';
        this.palette = config.palette || {
            body: {
                top: { r: 210, g: 180, b: 120 },
                side: { r: 186, g: 154, b: 104 },
                bottom: { r: 150, g: 122, b: 82 }
            },
            accent: {
                top: { r: 240, g: 224, b: 200 },
                side: { r: 220, g: 203, b: 178 },
                bottom: { r: 196, g: 180, b: 160 }
            },
            leg: {
                top: { r: 172, g: 142, b: 96 },
                side: { r: 152, g: 122, b: 82 },
                bottom: { r: 124, g: 98, b: 68 }
            }
        };
        this.cachedRenderable = null;
        this.cachedPoseKey = '';
    }

    getDisplayName() {
        return this.aggressive ? this.angryName : this.displayName;
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
            minX: this.position.x - (this.width * 0.5),
            maxX: this.position.x + (this.width * 0.5),
            minY: this.position.y,
            maxY: this.position.y + this.height,
            minZ: this.position.z - (this.depth * 0.5),
            maxZ: this.position.z + (this.depth * 0.5)
        };
    }

    resetBehavior() {
        this.following = false;
        this.aggressive = this.hostileByDefault;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        this.attackCooldown = 0;
        this.health = this.maxHealth;
    }

    isAlive() {
        return this.health > 0;
    }

    getDrops() {
        return this.dropTable.map(function (entry) {
            return { ...entry };
        });
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

    takeHit(attackerPosition, damage = 1) {
        this.hurtTime = 0.34;
        this.aggressive = true;
        this.following = false;
        this.wanderTarget = null;
        this.wanderTimer = 0;
        this.health = Math.max(0, this.health - Math.max(1, Math.floor(Number(damage || 1))));

        if (attackerPosition) {
            const deltaX = attackerPosition.x - this.position.x;
            const deltaZ = attackerPosition.z - this.position.z;
            const distance = Math.hypot(deltaX, deltaZ);
            if (distance > 0.001) {
                this.yaw = Math.atan2(-deltaX, deltaZ);
            }
        }

        return {
            dead: this.health <= 0,
            health: this.health
        };
    }

    update(deltaTime, playerPosition, world, isWalkable) {
        if (!this.isAlive()) {
            return null;
        }

        this.animationTime += deltaTime * (this.aggressive ? 7.6 : (this.following ? 5.3 : 3.1));
        this.hurtTime = Math.max(0, this.hurtTime - deltaTime);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);

        if (!this.aggressive && this.hostileByDefault) {
            const detectDistance = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
            if (detectDistance <= this.detectRange) {
                this.aggressive = true;
            }
        }

        if (this.aggressive) {
            const distance = Math.hypot(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
            if (distance <= this.attackDistance && this.attackCooldown <= 0) {
                this.attackCooldown = 1;
                return {
                    type: 'player_hit',
                    damage: this.attackDamage,
                    cause: this.type,
                    entityType: this.type,
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
            this.moveTowards(playerPosition.x, playerPosition.z, deltaTime, world, isWalkable, this.followDistance, this.speed + 0.2);
            return null;
        }

        this.wanderTimer -= deltaTime;
        if (!this.wanderTarget || this.wanderTimer <= 0) {
            this.wanderTarget = this.chooseWanderTarget(world, isWalkable);
            this.wanderTimer = 2.4 + Math.random() * 3.6;
        }

        if (!this.wanderTarget) {
            return null;
        }

        const reached = this.moveTowards(this.wanderTarget.x, this.wanderTarget.z, deltaTime, world, isWalkable, 0.24, this.speed);
        if (reached) {
            this.wanderTarget = null;
        }

        return null;
    }

    chooseWanderTarget(world, isWalkable) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 2 + Math.random() * this.wanderRadius;
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

    buildParts() {
        const legSwing = Math.sin(this.animationTime) * 0.08;
        const bodyBob = Math.abs(Math.sin(this.animationTime * 0.5)) * 0.035;
        const headBob = Math.sin(this.animationTime * 0.42) * 0.018;
        const hurtPulse = this.hurtTime > 0 ? Math.abs(Math.sin((this.hurtTime / 0.34) * Math.PI * 5)) * 0.45 : 0;
        const tint = this.aggressive ? { r: 216, g: 104, b: 100 } : { r: 255, g: 255, b: 255 };
        const bodyPalette = tintPalette(this.palette.body, tint, this.aggressive ? 0.12 + hurtPulse : hurtPulse * 0.5);
        const accentPalette = tintPalette(this.palette.accent, tint, hurtPulse * 0.55);
        const legPalette = tintPalette(this.palette.leg, tint, hurtPulse * 0.55);
        const width = this.width;
        const depth = this.depth;
        const bodyHeight = this.height * 0.38;
        const shoulderY = this.height * 0.42 + bodyBob;
        const headHeight = this.height * 0.3;
        const headDepth = depth * 0.34;
        const legWidth = width * 0.18;
        const legDepth = depth * 0.18;
        const legHeight = this.height * 0.38;

        return [
            {
                minX: -(width * 0.42),
                maxX: width * 0.42,
                minY: shoulderY,
                maxY: shoulderY + bodyHeight,
                minZ: -(depth * 0.44),
                maxZ: depth * 0.26,
                palette: bodyPalette
            },
            {
                minX: -(width * 0.34),
                maxX: width * 0.34,
                minY: shoulderY + bodyHeight * 0.14 + headBob,
                maxY: shoulderY + bodyHeight * 0.14 + headBob + headHeight,
                minZ: depth * 0.22,
                maxZ: depth * 0.22 + headDepth,
                palette: accentPalette
            },
            {
                minX: -(width * 0.5),
                maxX: -(width * 0.5) + legWidth,
                minY: 0,
                maxY: legHeight + legSwing,
                minZ: depth * 0.14,
                maxZ: depth * 0.14 + legDepth,
                palette: legPalette
            },
            {
                minX: width * 0.5 - legWidth,
                maxX: width * 0.5,
                minY: 0,
                maxY: legHeight - legSwing,
                minZ: depth * 0.14,
                maxZ: depth * 0.14 + legDepth,
                palette: legPalette
            },
            {
                minX: -(width * 0.5),
                maxX: -(width * 0.5) + legWidth,
                minY: 0,
                maxY: legHeight - legSwing,
                minZ: -(depth * 0.34),
                maxZ: -(depth * 0.34) + legDepth,
                palette: legPalette
            },
            {
                minX: width * 0.5 - legWidth,
                maxX: width * 0.5,
                minY: 0,
                maxY: legHeight + legSwing,
                minZ: -(depth * 0.34),
                maxZ: -(depth * 0.34) + legDepth,
                palette: legPalette
            }
        ];
    }

    getRenderable() {
        const poseKey = [
            this.type,
            this.position.x.toFixed(2),
            this.position.y.toFixed(2),
            this.position.z.toFixed(2),
            this.animationTime.toFixed(2),
            this.hurtTime.toFixed(2),
            this.aggressive ? 1 : 0,
            this.health
        ].join('|');

        if (this.cachedRenderable && this.cachedPoseKey === poseKey) {
            return this.cachedRenderable;
        }

        const faces = [];
        const parts = this.buildParts();
        for (const part of parts) {
            faces.push.apply(faces, createCuboidFaces(this.position, part, part.palette));
        }

        this.cachedPoseKey = poseKey;
        this.cachedRenderable = {
            key: this.id,
            chunkX: null,
            chunkZ: null,
            faces: faces,
            center: { x: this.position.x, y: this.position.y + (this.height * 0.5), z: this.position.z },
            radius: Math.max(this.width, this.depth, this.height) + 0.18
        };

        return this.cachedRenderable;
    }
}
