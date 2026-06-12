# TASK-002: Modos sobrevivencia e criativo

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-003, TASK-007 |
| **Criterios cobertos** | CA-03, CA-04, CA-12 |

## Objetivo

Adicionar modos sobrevivencia e criativo com regras distintas de uso de recursos, preservando a escala atual do player e o comportamento consistente do save.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | Regras de gameplay |
| `assets/js/game/services/WorldRepository.js` | Modificar | Persistencia de modo |
| `assets/js/game/player/` | Revisar | Preservacao de escala e colisao |
| `pages/` e HUD | Revisar | Indicacao visual de modo |

## Passos de Implementacao

1. Introduzir `game_mode` no estado e no fluxo de criacao/carregamento.
2. Aplicar regras diferentes de consumo de recurso e acesso a itens.
3. Sinalizar o modo ativo na gameplay e validar save/reload.

## Regras e Cuidados

- O player deve continuar com `1.95` blocos de altura e corpo fino.
- Criativo e sobrevivencia nao podem corromper o mesmo save sem regra clara.
- O modo ativo precisa ser legivel para o usuario.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** jogar em sobrevivencia, colocar/quebrar blocos e verificar consumo de recursos.
- **Resultado esperado:** o modo respeita coleta e gasto de itens.

### Teste 2

- **Acao:** entrar em criativo, construir sem recursos e salvar/reabrir o mundo.
- **Resultado esperado:** o modo criativo funciona sem inconsistencias de persistencia.

## Rollback

Retirar `game_mode` do fluxo novo e restaurar as regras unificadas atuais de sandbox.

## Notas Tecnicas

- Task de contrato de gameplay; nao deve ser misturada com crafting.
