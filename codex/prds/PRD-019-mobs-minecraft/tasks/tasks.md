# Tasks — PRD-019: Mobs do Minecraft

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Adicionar novos drops ao `BlockTypes.js`: raw_beef, raw_chicken, rotten_flesh, gunpowder, feather, leather, bone, arrow, string (faixa ids 60–70, coordenar) | PRD-017 TASK-001 |
| TASK-002 | Criar `HostileMob.js`: classe base com perseguição, melee e detecção de alcance | Nenhuma |
| TASK-003 | Atualizar `PigMob.js` e `SheepMob.js` com textura MC e drops corretos; criar `CowMob.js` e `ChickenMob.js` | TASK-001, PRD-016 TASK-004 |
| TASK-004 | Criar `CreeperMob.js` (fusível 3s + explosão), `ZombieMob.js`, `SkeletonMob.js` (ranged), `SpiderMob.js` (neutro de dia) | TASK-002, PRD-016 TASK-004 |
| TASK-005 | Reescrever `MobManager.js`: remover cat/crawler, adicionar novos tipos, spawn rules por bioma, ciclo dia/noite, maxEntities=20 | TASK-003, TASK-004 |
| TASK-006 | Adicionar `gameTick` ao `GameApp.js`: contador 0–23999, `isDaytime` passado ao MobManager | TASK-005 |
| TASK-007 | Implementar explosão do creeper no `GameApp.js`: dano ao jogador + remoção de blocos em esfera raio 3 | TASK-004, TASK-006 |
| TASK-008 | Smoke: spawn passivos de dia, hostis de noite, explosão do creeper, drops de mobs | TASK-005, TASK-006, TASK-007 |

**Ordem de execução:** TASK-001 → TASK-002 → TASK-003+004 (paralelo) → TASK-005 → TASK-006 → TASK-007 → TASK-008
