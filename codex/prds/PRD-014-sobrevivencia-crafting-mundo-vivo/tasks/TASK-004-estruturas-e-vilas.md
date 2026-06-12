# TASK-004: Estruturas e vilas

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-005, TASK-007 |
| **Criterios cobertos** | CA-07 |

## Objetivo

Adicionar a primeira camada de estruturas e vilas geradas proceduralmente para enriquecer exploracao e descoberta.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/TerrainGenerator.js` | Revisar | Assentamento de estrutura |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Modificar | Geracao estrutural |
| `assets/js/game/world/MutableWorld.js` | Modificar | Persistencia/integração |
| `assets/js/game/services/WorldPrebuilder.js` | Revisar | Pre-geracao |

## Passos de Implementacao

1. Definir tipos iniciais de estrutura/vila e regras de spawn plausiveis.
2. Integrar a geracao ao pipeline procedural sem quebrar determinismo.
3. Validar assentamento, repetibilidade por seed e revisitacao de chunk.

## Regras e Cuidados

- Estruturas nao podem nascer atravessando terreno de forma grotesca com frequencia alta.
- A geracao precisa permanecer deterministica por seed.
- Comecar pequeno e verificavel vale mais do que um sistema gigante e instavel.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** criar varias seeds novas e procurar estruturas perto do spawn e em exploracao.
- **Resultado esperado:** estruturas aparecem em areas plausiveis e se mantem consistentes.

### Teste 2

- **Acao:** salvar, sair e reentrar em regioes com estruturas/vilas.
- **Resultado esperado:** a estrutura persiste sem deformacao ou duplicacao.

## Rollback

Desligar a geracao de estruturas/vilas e restaurar o decorador superficial anterior.

## Notas Tecnicas

- Preferir um primeiro slice de vila simples a tentar uma cidade inteira.
