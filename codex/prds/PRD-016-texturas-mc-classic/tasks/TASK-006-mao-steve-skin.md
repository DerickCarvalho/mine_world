# TASK-006: Atualizar FirstPersonHand.js com braço do Steve

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-05 |

## Objetivo

Substituir os três spans CSS da mão vazia por um canvas 2D que recorta o braço direito da skin `entity/steve.png`. Manter a animação de balanço ao caminhar e a animação de uso ao atacar.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/FirstPersonHand.js` | Modificar (rewrite completo) | canvas + drawImage recortando steve.png |

## Passos de Implementacao

1. Adicionar módulo-level lazy loader da skin do Steve (`entity/steve.png` 64×64)
2. Quando slot vazio, renderizar `<canvas width="64" height="96">` em vez dos spans CSS
3. No canvas, usar `drawImage(skin, 44, 20, 4, 12, 0, 0, 64, 96)` para recortar face frontal do braço direito
4. Retry no `update()` se skin não estava carregada no momento do `setItem()`
5. Manter transforms de balanço/uso no `update()` aplicados ao root container

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
