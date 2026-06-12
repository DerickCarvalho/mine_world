import { getBlockHardness, getBlockIdByKey, isPlaceableBlock } from '../world/BlockTypes.js';

export class InteractionController {
    constructor() {
        this.breakingTargetKey = null;
        this.breakingElapsed = 0;
    }

    getTargetKey(target) {
        if (!target || !target.block) {
            return null;
        }
        return target.block.x + ':' + target.block.y + ':' + target.block.z;
    }

    resetBreaking() {
        this.breakingTargetKey = null;
        this.breakingElapsed = 0;
    }

    getBreakingProgress(target) {
        const key = this.getTargetKey(target);
        if (!key || key !== this.breakingTargetKey) {
            return 0;
        }
        return Math.min(1, this.breakingElapsed / getBlockHardness(target.blockId));
    }

    updateBreaking(options) {
        const target = options.target;
        if (!options.held || options.hasEntityTarget || !target || !target.breakable) {
            this.resetBreaking();
            return false;
        }

        const key = this.getTargetKey(target);
        if (key !== this.breakingTargetKey) {
            this.breakingTargetKey = key;
            this.breakingElapsed = 0;
        }
        this.breakingElapsed += Math.max(0, Number(options.deltaTime || 0));
        return this.breakingElapsed >= getBlockHardness(target.blockId);
    }

    getPlacementPreview(world, target, slot, playerAabb) {
        if (!world || !target || !target.place || !slot) {
            return null;
        }

        const blockId = getBlockIdByKey(slot.block_id);
        if (!isPlaceableBlock(blockId)) {
            return null;
        }

        return {
            cell: target.place,
            blockId: blockId,
            valid: world.canPlaceBlockAt(target.place.x, target.place.y, target.place.z, blockId, playerAabb)
        };
    }
}
