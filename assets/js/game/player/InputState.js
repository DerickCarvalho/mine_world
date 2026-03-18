export class InputState {
    constructor(targetElement) {
        this.targetElement = targetElement;
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.jump = false;
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
        this.locked = false;
        this.gameplayEnabled = true;
        this.pauseToggleRequested = false;
        this.onPointerLockChange = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);
    }

    attach() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        document.addEventListener('mousemove', this.handleMouseMove);
        this.targetElement.addEventListener('click', this.handleClick);
    }

    detach() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.targetElement.removeEventListener('click', this.handleClick);

        if (document.pointerLockElement === this.targetElement) {
            document.exitPointerLock();
        }
    }

    setGameplayEnabled(enabled) {
        this.gameplayEnabled = Boolean(enabled);

        if (!this.gameplayEnabled) {
            this.clearTransientInput();
        }
    }

    requestPointerLock() {
        if (!this.gameplayEnabled || document.pointerLockElement === this.targetElement || !this.targetElement.requestPointerLock) {
            return;
        }

        this.targetElement.requestPointerLock();
    }

    releasePointerLock() {
        if (document.pointerLockElement === this.targetElement) {
            document.exitPointerLock();
        }
    }

    clearTransientInput() {
        this.resetMovement();
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
    }

    resetMovement() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.jump = false;
    }

    handleClick() {
        this.requestPointerLock();
    }

    handleMouseMove(event) {
        if (!this.locked || !this.gameplayEnabled) {
            return;
        }

        this.lookDeltaX += event.movementX || 0;
        this.lookDeltaY += event.movementY || 0;
    }

    handlePointerLockChange() {
        this.locked = document.pointerLockElement === this.targetElement;

        if (typeof this.onPointerLockChange === 'function') {
            this.onPointerLockChange(this.locked);
        }
    }

    handleWindowBlur() {
        this.clearTransientInput();
    }

    handleKeyDown(event) {
        if (event.code === 'KeyP') {
            if (!event.repeat) {
                this.pauseToggleRequested = true;
            }

            event.preventDefault();
            return;
        }

        if (!this.gameplayEnabled) {
            if (event.code === 'Space') {
                event.preventDefault();
            }

            return;
        }

        if (event.code === 'KeyW') {
            this.forward = true;
        } else if (event.code === 'KeyS') {
            this.backward = true;
        } else if (event.code === 'KeyA') {
            this.left = true;
        } else if (event.code === 'KeyD') {
            this.right = true;
        } else if (event.code === 'Space') {
            this.jump = true;
            event.preventDefault();
        }
    }

    handleKeyUp(event) {
        if (event.code === 'KeyP') {
            return;
        }

        if (event.code === 'KeyW') {
            this.forward = false;
        } else if (event.code === 'KeyS') {
            this.backward = false;
        } else if (event.code === 'KeyA') {
            this.left = false;
        } else if (event.code === 'KeyD') {
            this.right = false;
        } else if (event.code === 'Space') {
            this.jump = false;
            event.preventDefault();
        }
    }

    consumeLookDelta() {
        const delta = {
            x: this.lookDeltaX,
            y: this.lookDeltaY
        };

        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
        return delta;
    }

    consumeActions() {
        const actions = {
            togglePause: this.pauseToggleRequested
        };

        this.pauseToggleRequested = false;
        return actions;
    }
}
