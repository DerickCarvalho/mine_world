# TASK-004: Criar EntityTextureMap.js e pré-carregar texturas de entidade

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-005 |
| **Criterios cobertos** | CA-04 |

## Objetivo

Criar `EntityTextureMap.js` com mapeamento de mob type para path PNG de entidade. Pré-carregar as texturas no WebGL renderer via `GameApp.start()` para que PRD-019 possa usá-las sem carregamento adicional.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/entities/EntityTextureMap.js` | Criar | mapa mob type → PNG path |
| `assets/js/game/GameApp.js` | Modificar | pré-carrega entity textures via setTextureCatalog |

## Passos de Implementacao

1. Criar `EntityTextureMap.js` com todos os mapeamentos de RF-04
2. Exportar `getEntityTexturePath(mobType)` helper
3. Em `GameApp.start()`, montar catálogo sintético de entidades e chamar `renderer.setTextureCatalog()` para pré-carregá-las
4. UV mapping completo do modelo de entidade fica para PRD-019

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
