# TASK-002: Refazer worldgen, biomas e vegetacao

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-005, TASK-007 |
| **Criterios cobertos** | CA-04, CA-05, CA-13 |

## Objetivo

Refazer o relevo, os biomas e a vegetacao para que o mundo deixe de parecer artificial e ganhe leitura clara de regiao.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/TerrainGenerator.js` | Modificar | ruido, biomas e relevo |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Modificar | arvores, vegetacao e distribuicao superficial |
| `assets/js/game/world/MutableWorld.js` | Modificar | integracao com novas camadas do terreno |
| `assets/js/game/world/ChunkManager.js` | Revisar | invalidacoes e streaming |

## Passos de Implementacao

1. Recalibrar o ruido de altura e suavidade do relevo por bioma.
2. Ajustar densidade e forma das arvores conforme cada bioma.
3. Validar o resultado em multiplas seeds, evitando floresta vazia ou montanha quebrada.

## Regras e Cuidados

- Os biomas precisam ser perceptiveis em caminhada real, nao so em codigo.
- Evitar gerar arvores flutuando ou sobre agua indevida.
- Preservar o fluxo atual de chunks e o custo de runtime por area carregada.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** criar mundos com seeds diferentes e caminhar alguns minutos
- **Resultado esperado:** perceber planicie, floresta, deserto e relevo alto como regioes distintas

### Teste 2

- **Acao:** inspecionar areas de floresta e planicie
- **Resultado esperado:** floresta tem densidade maior de arvores e planicie tem menos arvores

## Rollback

Voltar para a calibracao anterior de ruido e decoracao, preservando apenas ajustes de desempenho ou bugfixes isolados.

## Notas Tecnicas

- Esta task deve preparar o terreno para mobs hostis/passivos parecerem encaixados no mundo.
