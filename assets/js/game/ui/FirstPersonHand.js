import { renderItemIconMarkup } from './ItemIcon.js';

const STEVE_SKIN_URL = '/assets/textures/mc/entity/steve.png';
let _steveSkin = null;
let _steveSkinLoading = false;

function loadSteveSkin() {
    if (_steveSkin || _steveSkinLoading) { return; }
    _steveSkinLoading = true;
    const img = new Image();
    img.onload = function () { _steveSkin = img; };
    img.src = STEVE_SKIN_URL;
}

export class FirstPersonHand {
    constructor(root) {
        this.root = root;
        this.motion = 0;
        this.useTime = 0;
        this.currentKey = '';
        this.mode = 'survival';
        this.armCanvas = null;
        this._armDrawn = false;
    }

    show() {
        if (this.root) {
            this.root.hidden = false;
        }
    }

    hide() {
        if (this.root) {
            this.root.hidden = true;
        }
    }

    _drawArm() {
        if (!this.armCanvas || !_steveSkin) { return; }
        const ctx = this.armCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.armCanvas.width, this.armCanvas.height);
        ctx.imageSmoothingEnabled = false;
        // Crop the front face of Steve's right arm (x=44, y=20, w=4, h=12) and scale to fill canvas
        ctx.drawImage(_steveSkin, 44, 20, 4, 12, 0, 0, this.armCanvas.width, this.armCanvas.height);
        this._armDrawn = true;
    }

    setItem(slot, gameMode = 'survival') {
        if (!this.root) {
            return;
        }

        this.mode = String(gameMode || 'survival');
        const nextKey = slot && slot.block_id ? String(slot.block_id) : '';
        if (nextKey === this.currentKey) {
            return;
        }

        this.currentKey = nextKey;
        this.armCanvas = null;
        this._armDrawn = false;
        this.root.dataset.state = nextKey ? 'item' : 'empty';

        if (nextKey) {
            this.root.innerHTML = '<div class="game-held-item__model">' + renderItemIconMarkup(nextKey, 'game-item-icon--held', 'equipped') + '</div>';
        } else {
            loadSteveSkin();
            this.root.innerHTML = '<div class="game-held-item__empty-hand" aria-hidden="true">'
                + '<canvas class="game-held-item__arm-canvas" width="64" height="96" style="width:48px;height:72px;image-rendering:pixelated;display:block;"></canvas>'
                + '</div>';
            this.armCanvas = this.root.querySelector('.game-held-item__arm-canvas');
            this._drawArm();
        }
    }

    triggerUse() {
        this.useTime = 0.18;
    }

    update(deltaTime, movementState, isVisible) {
        if (!this.root) {
            return;
        }

        if (!isVisible) {
            this.hide();
            return;
        }

        this.show();

        // Draw arm once skin is loaded (may have been pending at setItem time)
        if (!this.currentKey && this.armCanvas && !this._armDrawn && _steveSkin) {
            this._drawArm();
        }

        const speed = movementState && Number.isFinite(movementState.speed) ? movementState.speed : 0;
        const flying = movementState && movementState.flying === true;
        const walking = movementState && movementState.grounded === true && speed > 0.08;
        const walkFactor = walking ? Math.min(1, speed / 4.8) : 0;

        this.motion += deltaTime * (2.2 + walkFactor * 5.2);
        this.useTime = Math.max(0, this.useTime - deltaTime);

        const bobX = Math.sin(this.motion) * 6 * walkFactor;
        const bobY = Math.abs(Math.cos(this.motion * 0.86)) * 5 * walkFactor;
        const useFactor = this.useTime > 0 ? Math.sin((1 - this.useTime / 0.18) * Math.PI) : 0;
        const emptyHand = !this.currentKey;
        const translateX = emptyHand ? -8 + bobX * 0.55 : 2 + bobX - useFactor * 10;
        const translateY = emptyHand
            ? -8 + bobY * 0.65 + (flying ? -3 : 0)
            : -20 + bobY + useFactor * 8 + (flying ? -4 : 0);
        const rotateZ = emptyHand ? (-15 + bobX * 0.2) : (-10 + bobX * 0.12 - useFactor * 8);
        const rotateX = emptyHand ? (-14 - walkFactor * 6) : (-8 - useFactor * 5);

        this.root.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) rotateZ(' + rotateZ + 'deg) rotateX(' + rotateX + 'deg)';
    }
}
