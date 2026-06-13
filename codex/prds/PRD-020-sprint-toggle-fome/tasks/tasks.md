# Tasks — PRD-020: Sprint Toggle e Fome Avançada

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Adicionar ao `WorldConfig.js`: `sprintHungerMultiplier: 3`, `jumpHungerMultiplier: 0.5`, `sprintFovBoost: 5` | Nenhuma |
| TASK-002 | Refatorar `InputState.js`: sprint como toggle (pressionar Ctrl = toggle), double-W detection (< 300ms), remover hold-to-sprint | TASK-001 |
| TASK-003 | Atualizar `PlayerController.js`: adicionar `sprintActive` (estado toggle persistente), lógica de cancelamento (para ao parar de andar, agachar, water, wall-hit) | TASK-002 |
| TASK-004 | Atualizar `GameApp.js` (lógica de fome): aplicar `sprintHungerMultiplier` ao `hungerDrainTimer` quando sprinting; detectar pulo e drenar `jumpHungerMultiplier` | TASK-001, TASK-003 |
| TASK-005 | Atualizar `WebGLRenderer.js`: adicionar `currentFov` com lerp (fator 12×deltaTime) entre `fov` e `fov + sprintFovBoost`; atualizar matriz de projeção | TASK-001, TASK-003 |
| TASK-006 | Smoke: toggle sprint com Ctrl, double-W, cancelamento automático, FOV suave, fome mais rápida ao correr e pular | TASK-002, TASK-003, TASK-004, TASK-005 |

**Ordem de execução:** TASK-001 → TASK-002 → TASK-003 → TASK-004+005 (paralelo) → TASK-006
