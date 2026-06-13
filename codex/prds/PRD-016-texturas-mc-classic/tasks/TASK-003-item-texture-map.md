# TASK-003: Criar ItemTextureMap.js e atualizar ItemIcon.js

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-03 |

## Objetivo

Criar `ItemTextureMap.js` com mapeamento de item/block key para path PNG. Atualizar `ItemIcon.js` para renderizar `<img>` com o caminho do `ItemTextureMap` em vez do span colorido anterior.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/ItemTextureMap.js` | Criar | mapa item key → PNG path |
| `assets/js/game/ui/ItemIcon.js` | Modificar | usa img src do ItemTextureMap |

## Passos de Implementacao

1. Criar `ItemTextureMap.js` com todos os mapeamentos de RF-03
2. Exportar `getItemTexturePath(key)` helper
3. Atualizar `ItemIcon.js`: para não-colocáveis, se `getItemTexturePath()` retornar path, gerar `<img>` com `image-rendering:pixelated`
4. Fallback para span colorido se não houver mapeamento

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
