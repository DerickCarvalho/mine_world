# PRD-TECNICA-020: Sprint Toggle e Fome Avançada

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-020-sprint-toggle-fome.md](./PRD-020-sprint-toggle-fome.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Técnico** | Codex |
| **Versão** | 1.0 proposta |

## Contexto Técnico

- **Projeto:** MineWorld
- **Stack:** JavaScript Vanilla
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Análise do Estado Atual

| Arquivo | Papel atual | Impacto esperado |
|---------|-------------|------------------|
| `assets/js/game/player/InputState.js` | Captura input de sprint (hold Ctrl) | Alterar — toggle + double-W |
| `assets/js/game/player/PlayerController.js` | Determina `this.sprinting` | Alterar — gerenciar estado toggle |
| `assets/js/game/world/WorldConfig.js` | Constantes de velocidade e fome | Alterar — novos multiplicadores |
| `assets/js/game/GameApp.js` | Loop principal, gerencia fome | Alterar — aplicar multiplicadores |
| `assets/js/game/render/webgl/WebGLRenderer.js` | Renderização 3D | Alterar — FOV dinâmico |

### Estado atual detalhado

**InputState.js:**
- `this.sprint = false` — estado hold
- `handleKeyDown`: `ControlLeft → this.sprint = true`
- `handleKeyUp`: `ControlLeft → this.sprint = false`
- `this.lastSpacePressedAt` — para double-space de voo (padrão a adaptar para W)

**PlayerController.js linha 153:**
```js
this.sprinting = !this.flying && !this.inWater && !this.crouching && this.input.sprint && forward > 0;
```
Apenas lê `this.input.sprint` sem estado persistente.

**WorldConfig.js:**
- `sprintMoveMultiplier: 1.45` — multiplicador de velocidade já existe
- `hungerDrainInterval: 24` — sem multiplicador de sprint
- `fov: 78` — FOV fixo

## Solução Técnica Proposta

### Fluxo de estado de sprint

```
InputState.handleKeyDown(Ctrl)
  → this.sprintToggleRequested = true

InputState.handleKeyDown(W) [segunda vez em < 300ms]
  → this.sprintToggleRequested = true

PlayerController.updateMovement()
  → consume sprintToggleRequested
  → toggle this.sprintActive
  → cancela sprintActive se: !forward || crouching || inWater || hitWall
  → this.sprinting = this.sprintActive && forward > 0

GameApp loop
  → getMovementState().sprinting → aplicar multiplicador de fome
  → jumpedThisFrame → drenar 0.5 fome

WebGLRenderer
  → lerp currentFov → sprintFov ou baseFov
  → atualizar projeção
```

## Implementação Detalhada

### InputState.js

**Remover:**
- `this.sprint = false` — estado hold
- `handleKeyDown(ControlLeft → this.sprint = true)`
- `handleKeyUp(ControlLeft → this.sprint = false)`

**Adicionar:**
```js
// No constructor:
this.sprintToggleRequested = false;
this.lastWPressedAt = 0; // para double-W

// handleKeyDown:
} else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
  if (!event.repeat) {
    this.sprintToggleRequested = true;
  }
  event.preventDefault();
} else if (event.code === 'KeyW') {
  if (!event.repeat) {
    const now = Date.now();
    if (now - this.lastWPressedAt < 300 && this.forward) {
      // Double-tap W — só ativa se já estava pressionando W
      this.sprintToggleRequested = true;
    }
    this.lastWPressedAt = now;
  }
  this.forward = true;
  // (resto existente)
}

// handleKeyUp: remover this.sprint = false para ControlLeft
```

**Em `consumeActions()`:** adicionar `sprintToggle: this.sprintToggleRequested` e resetar.

### PlayerController.js

**Adicionar estado:**
```js
// No constructor:
this.sprintActive = false;
this.wallHitCooldown = 0;
```

**Em `updateMovement()`:**
```js
// Consumir toggle request
const actions = this.input.consumeActions(); // já chamado no GameApp — passar via argumento
// OU: ler diretamente antes de consumir
if (this.input.sprintToggleRequested) {
  this.input.sprintToggleRequested = false;
  if (!this.flying && !this.inWater && !this.crouching) {
    this.sprintActive = !this.sprintActive;
  }
}

// Cancelar sprint automaticamente
if (forward <= 0 || this.inWater || this.crouching || this.flying) {
  this.sprintActive = false;
}
// Cancelar se colidiu lateralmente (hit wall)
if (this.wallHitCooldown > 0) {
  this.wallHitCooldown -= deltaTime;
} else if (this.sprintActive) {
  const prevX = this.position.x;
  const prevZ = this.position.z;
  // após resolveHorizontal, se posição não avançou mas havia input → wall hit
  // implementação: comparar speed real vs esperada
  const actualSpeed = Math.hypot(this.velocity.x, this.velocity.z);
  const expectedSpeed = moveSpeed;
  if (moveMagnitude > 0 && actualSpeed < expectedSpeed * 0.3) {
    this.sprintActive = false;
    this.wallHitCooldown = 0.5;
  }
}

// Determinar sprinting final
this.sprinting = this.sprintActive && !this.flying && !this.inWater && !this.crouching && forward > 0;
```

**Em `getMovementState()`:** já inclui `sprinting`; sem mudança necessária.

**Em `applyPose()`:** `this.sprintActive = false` (garantir reset ao respawn).

### WorldConfig.js

```js
// Adicionar ao WORLD_CONFIG:
sprintHungerMultiplier: 3,
jumpHungerMultiplier: 0.5,   // pontos de fome por pulo
sprintFovBoost: 5,           // graus extra de FOV
```

### GameApp.js — fome

Localizar onde `hungerDrainTimer` é decrementado e aplicar multiplicador:

```js
// Atual (aproximação):
this.hungerDrainTimer -= deltaTime;
if (this.hungerDrainTimer <= 0) {
  this.hungerState = Math.max(0, this.hungerState - 1);
  this.hungerDrainTimer = WORLD_CONFIG.hungerDrainInterval;
}

// Novo:
const movState = this.playerController.getMovementState();
const hungerMultiplier = movState.sprinting ? WORLD_CONFIG.sprintHungerMultiplier : 1;
this.hungerDrainTimer -= deltaTime * hungerMultiplier;
if (this.hungerDrainTimer <= 0) {
  this.hungerState = Math.max(0, this.hungerState - 1);
  this.hungerDrainTimer = WORLD_CONFIG.hungerDrainInterval;
}

// Fome por pulo — detectar quando salta pela primeira vez:
if (movState.jumping && !this.wasJumping && movState.grounded === false) {
  this.hungerState = Math.max(0, this.hungerState - WORLD_CONFIG.jumpHungerMultiplier);
}
this.wasJumping = movState.jumping;
```

### WebGLRenderer.js — FOV dinâmico

**Adicionar estado:**
```js
// No constructor:
this.currentFov = WORLD_CONFIG.fov;
```

**No método de render/update (chamado todo frame):**
```js
updateFov(isSprinting, deltaTime) {
  const targetFov = isSprinting ? WORLD_CONFIG.fov + WORLD_CONFIG.sprintFovBoost : WORLD_CONFIG.fov;
  this.currentFov += (targetFov - this.currentFov) * Math.min(1, deltaTime * 12);
}
```

**Na construção da matriz de projeção:**
```js
// Em vez de usar WORLD_CONFIG.fov diretamente:
const fovRad = (this.currentFov * Math.PI) / 180;
const projMatrix = mat4.perspective(fovRad, aspectRatio, nearPlane, farPlane);
```

**Em GameApp.js:**
```js
// Antes de renderizar:
this.renderer.updateFov(movementState.sprinting, deltaTime);
```

## Dados, Persistência e Contratos

- `sprintActive`: efêmero; não persistir
- `hungerState`: já persistido; sem mudança no schema
- `gameTick`/`wasJumping`: efêmeros

## Requisitos de Performance e Escala

- Toggle check: O(1) por frame
- FOV lerp: 1 float multiply + add por frame; imperceptível
- Fome multiplicada: apenas muda o divisor do timer; O(1)

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Double-W conflitando com forward input | Médio | Verificar `this.forward` ativo ao second press para garantir que foi intencional |
| Sprint ativado enquanto voa (Ctrl usado para sprint) | Baixo | `if (!this.flying)` antes de toggle |
| Wall-hit detection falso positivo em terreno irregular | Médio | Cooldown de 0.5s após cancelamento por wall; comparar actualSpeed/expectedSpeed |
| FOV mudar durante cutscene/menu | Baixo | Verificar `isGameplayEnabled` no updateFov |
| Fome drenar muito rápido com sprint 3× | Baixo | Ajustar multiplier nos testes; hungerDrainInterval base = 24s ÷ 3 = 8s de sprint até drenar 1 ponto |

## Plano de Testes

- Smoke: pressionar Ctrl → começar a correr sem segurar
- Smoke: pressionar Ctrl de novo → parar de correr
- Smoke: double-tap W → começar a correr
- Smoke: parar de pressionar W → sprint cancela
- Smoke: correr e agachar → sprint cancela
- Smoke: correr e bater numa parede → sprint cancela
- Verificar FOV aumenta ao correr (visualmente percebível)
- Verificar barra de fome cai mais rápido ao correr
- Smoke: pular → fome diminui 0.5
- `npm test`, `npm run test:harness`

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-world-config-multiplicadores.md) | Adicionar multiplicadores ao WorldConfig | Nenhuma |
| [TASK-002](./tasks/TASK-002-input-state-sprint-toggle.md) | Refatorar InputState: toggle + double-W | TASK-001 |
| [TASK-003](./tasks/TASK-003-player-controller-sprint.md) | Atualizar PlayerController com sprintActive | TASK-002 |
| [TASK-004](./tasks/TASK-004-fome-multiplicadores.md) | Aplicar multiplicadores de fome no GameApp | TASK-001, TASK-003 |
| [TASK-005](./tasks/TASK-005-fov-dinamico.md) | FOV dinâmico no WebGLRenderer | TASK-003 |
| [TASK-006](./tasks/TASK-006-validar-sprint.md) | Smoke e testes de sprint | TASK-002, TASK-003, TASK-004, TASK-005 |

## Rollback

- Reverter `InputState.js` para hold-to-sprint via git
- Reverter `PlayerController.js` remoção de `sprintActive`
- Remover novos campos de `WorldConfig.js`
- `GameApp.js`: remover `hungerMultiplier` (voltar divisor fixo)
- `WebGLRenderer.js`: usar `WORLD_CONFIG.fov` fixo em vez de `this.currentFov`
