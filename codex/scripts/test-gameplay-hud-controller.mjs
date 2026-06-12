import assert from 'node:assert/strict';
import { GameplayHudController } from '../../assets/js/game/ui/GameplayHudController.js';

const calls = [];
const controller = new GameplayHudController({
    hotbar: { render: (...args) => calls.push(['hotbar', ...args]) },
    inventoryPanel: { render: (...args) => calls.push(['inventory', ...args]) },
    hand: { setItem: (item) => calls.push(['hand', item]) },
    healthBar: { innerHTML: '' },
    healthText: { textContent: '' },
    flyChip: { dataset: {} },
    flyText: { textContent: '' },
    overlay: {
        showInstruction: (text) => calls.push(['instruction', text]),
        hideInstruction: () => calls.push(['instruction-hide']),
        setStatus: (text) => calls.push(['status', text])
    },
    crosshair: {
        show: () => calls.push(['crosshair-show']),
        hide: () => calls.push(['crosshair-hide']),
        setTargetActive: (active) => calls.push(['crosshair-active', active])
    },
    pauseMenu: {
        setWorldData: (data) => calls.push(['pause', data])
    }
});

controller.render({
    inventorySlots: [{ block_id: 'stone', quantity: 4 }],
    selectedHotbarIndex: 0,
    inventorySelectedSlotIndex: null,
    inventoryCursorStack: null,
    gameMode: 'survival',
    recipes: [],
    creativePalette: [],
    health: 7,
    hunger: 6,
    healthFlashTime: 0.2,
    player: {
        isFlyEnabled: () => true,
        isFlying: () => false
    }
});

assert.equal(controller.healthText.textContent, '7/10');
assert.deepEqual(calls.find((entry) => entry[0] === 'hand'), ['hand', { block_id: 'stone', quantity: 4 }]);
assert.equal(controller.flyChip.dataset.state, 'on');
assert.equal(controller.flyText.textContent, 'ON');
assert.ok(controller.healthBar.innerHTML.includes('is-recent'));

controller.updatePauseMenu({ nome: 'Teste', seed: 'abc', algorithm_version: 'v4.0' }, {
    getFeetPosition: () => ({ x: 1, y: 2, z: 3 })
}, { getLoadedChunkCount: () => 9 }, 11);
assert.equal(calls.find((entry) => entry[0] === 'pause')[1].loadedChunks, 9);

const state = controller.handlePointerLockChange(true, {
    sessionState: 'running',
    sessionStates: { RUNNING: 'running', DEAD: 'dead', DYING: 'dying', SAVING: 'saving' },
    chatOpen: false,
    inventoryOpen: false,
    pointerLockHint: 'A',
    inventoryHint: 'B',
    chatHint: 'C'
});
assert.equal(state, 'locked');

console.log('GameplayHudController: HUD, pausa e ponteiro ficam desacoplados do GameApp.');
