export class InputState {
    constructor(targetElement) {
        this.targetElement = targetElement;
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.jump = false;
        this.descend = false;
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
        this.locked = false;
        this.gameplayEnabled = true;
        this.pauseToggleRequested = false;
        this.coordsToggleRequested = false;
        this.inventoryToggleRequested = false;
        this.chatToggleRequested = false;
        this.primaryActionRequested = false;
        this.secondaryActionRequested = false;
        this.toggleFlightRequested = false;
        this.hotbarIndexRequested = null;
        this.hotbarScrollDelta = 0;
        this.lastSpacePressedAt = 0;
        this.onPointerLockChange = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    attach() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        document.addEventListener('mousemove', this.handleMouseMove);
        this.targetElement.addEventListener('click', this.handleClick);
        this.targetElement.addEventListener('mousedown', this.handleMouseDown);
        this.targetElement.addEventListener('contextmenu', this.handleContextMenu);
        this.targetElement.addEventListener('wheel', this.handleWheel, { passive: false });
    }

    detach() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.targetElement.removeEventListener('click', this.handleClick);
        this.targetElement.removeEventListener('mousedown', this.handleMouseDown);
        this.targetElement.removeEventListener('contextmenu', this.handleContextMenu);
        this.targetElement.removeEventListener('wheel', this.handleWheel);

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
        this.primaryActionRequested = false;
        this.secondaryActionRequested = false;
        this.toggleFlightRequested = false;
    }

    resetMovement() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.jump = false;
        this.descend = false;
    }

    isTextEntryActive() {
        const active = document.activeElement;
        if (!active) {
            return false;
        }

        const tagName = active.tagName ? active.tagName.toUpperCase() : '';
        return tagName === 'INPUT' || tagName === 'TEXTAREA' || active.isContentEditable === true;
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

    handleMouseDown(event) {
        if (!this.gameplayEnabled || !this.locked) {
            return;
        }

        if (event.button === 0) {
            this.primaryActionRequested = true;
            event.preventDefault();
            return;
        }

        if (event.button === 2) {
            this.secondaryActionRequested = true;
            event.preventDefault();
        }
    }

    handleContextMenu(event) {
        event.preventDefault();
    }

    handleWheel(event) {
        if (!this.gameplayEnabled || this.isTextEntryActive()) {
            return;
        }

        const direction = Math.sign(event.deltaY || 0);
        if (direction !== 0) {
            this.hotbarScrollDelta += direction;
            event.preventDefault();
        }
    }

    handleKeyDown(event) {
        if (this.isTextEntryActive()) {
            return;
        }

        if (event.code === 'KeyP') {
            if (!event.repeat) {
                this.pauseToggleRequested = true;
            }

            event.preventDefault();
            return;
        }

        if (event.code === 'KeyE') {
            if (!event.repeat) {
                this.inventoryToggleRequested = true;
            }

            event.preventDefault();
            return;
        }

        if (event.code === 'KeyC') {
            if (!event.repeat) {
                this.coordsToggleRequested = true;
            }

            event.preventDefault();
            return;
        }

        if (event.code === 'KeyT') {
            if (!event.repeat) {
                this.chatToggleRequested = true;
            }

            event.preventDefault();
            return;
        }

        if (/^Digit[1-9]$/.test(event.code)) {
            this.hotbarIndexRequested = Number(event.code.replace('Digit', '')) - 1;
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
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.descend = true;
        } else if (event.code === 'Space') {
            if (!event.repeat) {
                const now = Date.now();
                if (now - this.lastSpacePressedAt <= 280) {
                    this.toggleFlightRequested = true;
                }
                this.lastSpacePressedAt = now;
            }

            this.jump = true;
            event.preventDefault();
        }
    }

    handleKeyUp(event) {
        if (this.isTextEntryActive()) {
            return;
        }

        if (event.code === 'KeyP' || event.code === 'KeyE' || event.code === 'KeyC' || event.code === 'KeyT' || /^Digit[1-9]$/.test(event.code)) {
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
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.descend = false;
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
            togglePause: this.pauseToggleRequested,
            toggleCoords: this.coordsToggleRequested,
            toggleInventory: this.inventoryToggleRequested,
            toggleChat: this.chatToggleRequested,
            primaryAction: this.primaryActionRequested,
            secondaryAction: this.secondaryActionRequested,
            toggleFlight: this.toggleFlightRequested,
            hotbarIndex: this.hotbarIndexRequested,
            hotbarScrollDelta: this.hotbarScrollDelta
        };

        this.pauseToggleRequested = false;
        this.coordsToggleRequested = false;
        this.inventoryToggleRequested = false;
        this.chatToggleRequested = false;
        this.primaryActionRequested = false;
        this.secondaryActionRequested = false;
        this.toggleFlightRequested = false;
        this.hotbarIndexRequested = null;
        this.hotbarScrollDelta = 0;
        return actions;
    }
}