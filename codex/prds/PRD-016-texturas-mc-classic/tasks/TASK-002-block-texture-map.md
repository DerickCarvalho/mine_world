# TASK-002: Criar BlockTextureMap.js e integrar ao pipeline WebGL

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-005 |
| **Criterios cobertos** | CA-01, CA-02, CA-09, CA-10 |

## Objetivo

Criar `BlockTextureMap.js` com mapeamento estático de block key para faces `top/side/bottom`. Integrar ao `ChunkMaterials.js` e ao `WebGLRenderer` via `setTextureCatalog()`.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/BlockTextureMap.js` | Criar | catálogo estático |
| `assets/js/paginas/jogo.js` | Modificar | remove TextureRepository, usa BLOCK_TEXTURE_CATALOG |
| `assets/js/game/GameApp.js` | Modificar | importa e carrega catálogo |

## Passos de Implementacao

1. Criar `BlockTextureMap.js` com `BLOCK_TEXTURE_CATALOG` para todos os blocos de RF-02
2. Exportar `getBlockFacePath(blockKey, direction)` como helper
3. Atualizar `jogo.js` para remover TextureRepository e passar `BLOCK_TEXTURE_CATALOG` como `textureManifest`
4. Verificar que `ChunkMaterials.js` e `WebGLRenderer.js` já consomem o catálogo corretamente

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
