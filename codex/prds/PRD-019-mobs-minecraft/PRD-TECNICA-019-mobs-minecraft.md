# PRD-TECNICA-019: Mobs do Minecraft — substituição completa do ecossistema de entidades

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-019-mobs-minecraft.md](./PRD-019-mobs-minecraft.md) |
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
| `assets/js/game/entities/CatMob.js` | Mob passivo com follow | Remover |
| `assets/js/game/entities/CrawlerMob.js` | Mob hostil genérico | Remover |
| `assets/js/game/entities/PigMob.js` | Porco passivo | Atualizar textura e drops |
| `assets/js/game/entities/SheepMob.js` | Ovelha passiva | Atualizar textura e drops |
| `assets/js/game/entities/MobManager.js` | Lifecycle e spawn | Reescrever spawn rules |
| `assets/js/game/entities/PassiveMob.js` | Base class passivo | Manter e ajustar |
| `assets/js/game/GameApp.js` | Loop principal | Adicionar gameTick |

## Solução Técnica Proposta

### Arquitetura de mobs

Cada mob é uma classe com:
- `constructor(id, spawnPoint)` → inicializa posição, hp, type
- `update(deltaTime, playerPosition, world, isWalkable)` → retorna event ou null
- `getRenderable()` → retorna `{ id, type, position, rotation, texturePath, dimensions }`
- `getDrops()` → retorna array de `{ block_id, quantity }`
- `takeHit(attackerPos, damage)` → retorna `{ health, dead }`
- `resetBehavior()` → reseta estado agressivo/follow

### Base classes

**PassiveMob.js** (existente, ajustar):
```js
export class PassiveMob {
  constructor(id, spawnPoint, type, hp = 10) {
    this.id = id;
    this.type = type;
    this.position = { ...spawnPoint };
    this.hp = hp;
    this.maxHp = hp;
    this.velocity = { x: 0, z: 0 };
    this.yaw = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
    this.fleeing = false;
    this.fleeTimer = 0;
  }
  // wander aleatório; flee quando takeHit
  // getDrops() — override nas subclasses
}
```

**HostileMob.js** (novo):
```js
export class HostileMob {
  constructor(id, spawnPoint, type, hp = 20) {
    this.id = id; this.type = type; this.position = { ...spawnPoint };
    this.hp = hp; this.maxHp = hp;
    this.velocity = { x: 0, z: 0 }; this.yaw = 0;
    this.aggressive = false; this.target = null;
    this.attackTimer = 0; this.detectRange = 12; this.attackRange = 1.5; this.attackDamage = 2;
  }
  update(dt, playerPos, world, isWalkable) {
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < this.detectRange) {
      this.aggressive = true;
      const speed = this.moveSpeed * dt;
      this.position.x += (dx / dist) * speed;
      this.position.z += (dz / dist) * speed;
      this.yaw = Math.atan2(-dx, -dz);
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      if (dist < this.attackRange && this.attackTimer <= 0) {
        this.attackTimer = this.attackCooldown || 1;
        return { type: 'attack_player', damage: this.attackDamage };
      }
    } else {
      this.aggressive = false;
    }
    return null;
  }
  // getDrops() override por subclasse
}
```

### Novos arquivos de mob

#### CreeperMob.js

```js
import { HostileMob } from './HostileMob.js';
import { getEntityTexturePath } from './EntityTextureMap.js';

export class CreeperMob extends HostileMob {
  constructor(id, spawnPoint) {
    super(id, spawnPoint, 'creeper', 20);
    this.moveSpeed = 4.0;
    this.detectRange = 8;
    this.attackRange = 2.5;
    this.fuseTimer = 0;
    this.fuseActive = false;
    this.exploded = false;
  }

  update(dt, playerPos, world, isWalkable) {
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < this.detectRange) {
      if (dist > this.attackRange) {
        // Aproximar
        const speed = this.moveSpeed * dt;
        this.position.x += (dx / dist) * speed;
        this.position.z += (dz / dist) * speed;
        this.fuseActive = false;
        this.fuseTimer = 0;
      } else {
        // Iniciar fusível
        this.fuseActive = true;
        this.fuseTimer += dt;
        if (this.fuseTimer >= 3.0 && !this.exploded) {
          this.exploded = true;
          return { type: 'creeper_explode', position: { ...this.position }, radius: 3 };
        }
      }
    } else {
      this.fuseActive = false;
      this.fuseTimer = 0;
    }
    return null;
  }

  getDrops() { return Math.random() > 0.5 ? [{ block_id: 'gunpowder', quantity: 1 }] : []; }
  getRenderable() { return { id: this.id, type: this.type, position: { ...this.position }, yaw: this.yaw, texturePath: getEntityTexturePath('creeper'), dimensions: { w: 0.6, h: 1.7 }, fuseActive: this.fuseActive }; }
}
```

#### ZombieMob.js

```js
import { HostileMob } from './HostileMob.js';
import { getEntityTexturePath } from './EntityTextureMap.js';

export class ZombieMob extends HostileMob {
  constructor(id, spawnPoint) {
    super(id, spawnPoint, 'zombie', 20);
    this.moveSpeed = 3.5; this.attackCooldown = 1.0;
  }
  getDrops() { const q = Math.floor(Math.random() * 3); return q > 0 ? [{ block_id: 'rotten_flesh', quantity: q }] : []; }
  getRenderable() { return { id: this.id, type: this.type, position: { ...this.position }, yaw: this.yaw, texturePath: getEntityTexturePath('zombie'), dimensions: { w: 0.6, h: 1.9 } }; }
}
```

#### SkeletonMob.js

```js
import { HostileMob } from './HostileMob.js';
import { getEntityTexturePath } from './EntityTextureMap.js';

export class SkeletonMob extends HostileMob {
  constructor(id, spawnPoint) {
    super(id, spawnPoint, 'skeleton', 20);
    this.moveSpeed = 3.8; this.attackCooldown = 2.0;
    this.detectRange = 14; this.attackRange = 8; this.attackDamage = 2;
    this.strafeTimer = 0;
  }
  update(dt, playerPos, world, isWalkable) {
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    if (dist < this.detectRange) {
      this.aggressive = true;
      // Mantém distância de 4-8 blocos
      if (dist < 4) {
        this.position.x -= (dx / dist) * this.moveSpeed * dt;
        this.position.z -= (dz / dist) * this.moveSpeed * dt;
      } else if (dist > 8) {
        this.position.x += (dx / dist) * this.moveSpeed * dt * 0.5;
        this.position.z += (dz / dist) * this.moveSpeed * dt * 0.5;
      }
      this.yaw = Math.atan2(-dx, -dz);
      if (dist <= this.attackRange && this.attackTimer <= 0) {
        this.attackTimer = this.attackCooldown;
        return { type: 'attack_player', damage: this.attackDamage, projectile: true };
      }
    }
    return null;
  }
  getDrops() { return [{ block_id: 'bone', quantity: Math.ceil(Math.random() * 2) }, { block_id: 'arrow', quantity: Math.ceil(Math.random() * 2) }]; }
  getRenderable() { return { id: this.id, type: this.type, position: { ...this.position }, yaw: this.yaw, texturePath: getEntityTexturePath('skeleton'), dimensions: { w: 0.6, h: 1.9 } }; }
}
```

#### SpiderMob.js

```js
import { HostileMob } from './HostileMob.js';
import { getEntityTexturePath } from './EntityTextureMap.js';

export class SpiderMob extends HostileMob {
  constructor(id, spawnPoint) {
    super(id, spawnPoint, 'spider', 16);
    this.moveSpeed = 5.0; this.attackCooldown = 0.8; this.attackDamage = 2;
    this.detectRange = 10;
  }
  isNeutral(isDaytime) { return isDaytime && this.hp >= this.maxHp; } // neutro de dia se não foi atacado
  getDrops() { return [{ block_id: 'string', quantity: Math.ceil(Math.random() * 2) }]; }
  getRenderable() { return { id: this.id, type: this.type, position: { ...this.position }, yaw: this.yaw, texturePath: getEntityTexturePath('spider'), dimensions: { w: 1.4, h: 0.9 } }; }
}
```

#### CowMob.js e ChickenMob.js

Herdam de `PassiveMob` com `getDrops()` overrideado:

```js
// CowMob.js
getDrops() { return [{ block_id: 'leather', quantity: 1 + Math.floor(Math.random() * 2) }, { block_id: 'raw_beef', quantity: 1 + Math.floor(Math.random() * 3) }]; }
getRenderable() { return { ..., texturePath: getEntityTexturePath('cow'), dimensions: { w: 0.9, h: 1.4 } }; }

// ChickenMob.js
getDrops() { return [{ block_id: 'feather', quantity: 1 }, { block_id: 'raw_chicken', quantity: 1 }]; }
getRenderable() { return { ..., texturePath: getEntityTexturePath('chicken'), dimensions: { w: 0.4, h: 0.7 } }; }
```

### Atualização de MobManager.js

#### Novo spawn com ciclo dia/noite

```js
maybeSpawnNearPlayer(playerPosition, isDaytime) {
  if (this.entities.length >= this.maxEntities) return;
  if (Math.floor(Math.random() * 4) !== 0) return;

  const biome = typeof this.world.getSurfaceBiome === 'function'
    ? this.world.getSurfaceBiome(playerPosition.x, playerPosition.z)
    : { key: 'plains' };

  let type, allowedBiomes;

  if (isDaytime) {
    // Passivos
    const roll = Math.random();
    if (biome.key === 'plains' || biome.key === 'meadow') {
      type = roll < 0.35 ? 'pig' : roll < 0.65 ? 'cow' : roll < 0.85 ? 'sheep' : 'chicken';
      allowedBiomes = ['plains', 'meadow', 'forest'];
    } else if (biome.key === 'forest') {
      type = roll < 0.4 ? 'chicken' : roll < 0.7 ? 'pig' : 'cow';
      allowedBiomes = ['forest', 'meadow'];
    } else if (biome.key === 'taiga') {
      type = 'sheep';
      allowedBiomes = ['taiga'];
    } else {
      return; // sem spawn passivo em outros biomas
    }
  } else {
    // Hostis
    const roll = Math.random();
    type = roll < 0.3 ? 'creeper' : roll < 0.6 ? 'zombie' : roll < 0.8 ? skeleton' : 'spider';
    allowedBiomes = ['plains','meadow','forest','mountains','desert','badlands','taiga'];
  }

  const spawnPoint = this.findSpawnPointNearPlayer(playerPosition, allowedBiomes);
  if (!spawnPoint) return;
  this.spawnMob(type, spawnPoint);
}
```

#### spawnMob() atualizado

```js
spawnMob(type, spawnPoint) {
  const id = type + '-' + this.sequence++;
  switch (type) {
    case 'pig':      return this.entities.push(new PigMob(id, spawnPoint));
    case 'sheep':    return this.entities.push(new SheepMob(id, spawnPoint));
    case 'cow':      return this.entities.push(new CowMob(id, spawnPoint));
    case 'chicken':  return this.entities.push(new ChickenMob(id, spawnPoint));
    case 'creeper':  return this.entities.push(new CreeperMob(id, spawnPoint));
    case 'zombie':   return this.entities.push(new ZombieMob(id, spawnPoint));
    case 'skeleton': return this.entities.push(new SkeletonMob(id, spawnPoint));
    case 'spider':   return this.entities.push(new SpiderMob(id, spawnPoint));
  }
}
```

#### maxEntities

Aumentar para 20 (12 passivos + 8 hostis podem coexistir com cap total de 20).

### Ciclo dia/noite no GameApp.js

```js
// Em GameApp.js, no estado do jogo:
this.gameTick = 1000; // começa de manhã
this.isDaytime = true;

// No loop de update:
this.gameTick = (this.gameTick + deltaTime * 20) % 24000;
this.isDaytime = this.gameTick < 12000;
this.mobManager.update(deltaTime, playerPosition, this.isDaytime);
```

### Explosão do Creeper

No `GameApp.js`, ao receber evento `creeper_explode`:

```js
if (event.type === 'creeper_explode') {
  // Dano ao jogador se próximo
  const dist = Math.hypot(playerPos.x - event.position.x, playerPos.z - event.position.z);
  if (dist < event.radius) {
    const dmg = Math.round(6 * (1 - dist / event.radius));
    this.applyDamageToPlayer(dmg);
  }
  // Remover blocos em esfera
  const r = event.radius;
  for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
    if (x*x + y*y + z*z <= r*r) {
      const bx = Math.floor(event.position.x) + x;
      const by = Math.floor(event.position.y) + y;
      const bz = Math.floor(event.position.z) + z;
      if (this.world.isBreakableAt(bx, by, bz)) this.world.removeBlockAt(bx, by, bz);
    }
  }
  // Remover o creeper
  this.mobManager.entities = this.mobManager.entities.filter(e => e.id !== event.entityId);
}
```

### Novos drops em BlockTypes.js

IDs a partir de 60 (garantir sem conflito com PRD-017 e PRD-018):

```js
{ id: 60, key: 'raw_beef',     name: 'Carne Bovina Crua', ... maxStack: 16 },
{ id: 61, key: 'raw_chicken',  name: 'Frango Cru', ... maxStack: 16 },
{ id: 62, key: 'rotten_flesh', name: 'Carne Podre', ... maxStack: 64 },
{ id: 63, key: 'gunpowder',    name: 'Polvora', ... maxStack: 64 },
{ id: 64, key: 'feather',      name: 'Pena', ... maxStack: 64 },
{ id: 65, key: 'leather',      name: 'Couro', ... maxStack: 64 },
{ id: 66, key: 'bone',         name: 'Osso', ... maxStack: 64 },
{ id: 67, key: 'arrow',        name: 'Flecha', ... maxStack: 64 },
{ id: 68, key: 'string',       name: 'Barbante', ... maxStack: 64 },
```

> Atenção: coordenar IDs com PRD-017 (ids 27–38) e PRD-018 (ids ~39–59) antes da execução. Usar a faixa 60–70 para esta PRD.

## Dados, Persistência e Contratos

| Entidade | Campos | Persistência |
|----------|--------|-------------|
| gameTick | número inteiro 0–23999 | Sim (salvar no estado do jogador) |
| isDaytime | boolean derivado | Não (calculado de gameTick) |
| Mobs | efêmeros | Não |
| Drops de mobs | block_id, quantity, position | Sim (DropManager) |

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Creeper explodir blocos essenciais (bedrock) | Baixo | Checar `isBreakableBlock()` antes de remover |
| Spider com hitbox flat causando bugs de colisão | Médio | Usar CollisionResolver com dimensions.h = 0.9 |
| Conflito de IDs de BlockTypes entre PRDs | Alto | Coordenar IDs antes da execução; usar tabela centralizada |
| Skeleton "atirando" sem visual | Baixo | Aceitável v1; apenas o hit event importa |
| Spawn de hostis sem ciclo dia/noite ativo | Médio | Fallback: após 600 segundos de jogo, permitir spawn hostil |

## Plano de Testes

- `node --check` em todos os novos arquivos de mob
- `npm test` e `npm run test:harness`
- Smoke: verificar spawn de pig/cow/sheep de dia
- Smoke: avançar gameTick para noite (comando /time) e verificar creeper/zombie
- Smoke: deixar creeper chegar perto → explodir → verificar dano e blocos removidos
- Smoke: skeleton causa dano a distância
- Smoke: matar mob → drops aparecem e são coletáveis

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-novos-drops-block-types.md) | Adicionar drops ao BlockTypes.js | PRD-017 TASK-001 |
| [TASK-002](./tasks/TASK-002-hostile-mob-base.md) | Criar HostileMob.js (base class) | Nenhuma |
| [TASK-003](./tasks/TASK-003-passivos-atualizados.md) | Atualizar PigMob, SheepMob; criar CowMob, ChickenMob | TASK-001 |
| [TASK-004](./tasks/TASK-004-hostis.md) | Criar CreeperMob, ZombieMob, SkeletonMob, SpiderMob | TASK-002 |
| [TASK-005](./tasks/TASK-005-mob-manager-spawn.md) | Reescrever MobManager com novas regras, remover cat/crawler | TASK-003, TASK-004 |
| [TASK-006](./tasks/TASK-006-ciclo-dia-noite.md) | Adicionar gameTick ao GameApp, isDaytime | TASK-005 |
| [TASK-007](./tasks/TASK-007-explosao-creeper.md) | Implementar explosão do creeper no GameApp | TASK-004, TASK-006 |
| [TASK-008](./tasks/TASK-008-validar-mobs.md) | Smoke e testes de mobs | Todas anteriores |

## Rollback

- Restaurar CatMob.js e CrawlerMob.js via git
- Reverter MobManager.js para versão anterior
- Remover novos arquivos de mob
- Novos itens em BlockTypes são inofensivos
