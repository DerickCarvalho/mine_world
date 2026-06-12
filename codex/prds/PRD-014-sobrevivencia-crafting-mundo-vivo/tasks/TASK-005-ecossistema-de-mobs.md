# TASK-005: Ecossistema de mobs

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001, TASK-004 |
| **Bloqueia** | TASK-007 |
| **Criterios cobertos** | CA-08 |

## Objetivo

Expandir o ecossistema de mobs alem do gato atual, mantendo controle de spawn e estabilidade de runtime.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/entities/MobManager.js` | Modificar | Spawns e caps |
| `assets/js/game/entities/` | Criar/Modificar | Novos mobs |
| `assets/js/game/entities/CatMob.js` | Revisar | Compatibilidade |
| `assets/js/game/render/webgl/` | Revisar | Render dos novos mobs |

## Passos de Implementacao

1. Definir poucos mobs iniciais com papeis claros e regras de spawn simples.
2. Integrar novos mobs ao manager com limites e afinidade por bioma/estrutura.
3. Validar coexistencia com o gato, picking e runtime prolongado.

## Regras e Cuidados

- Mais variedade nao pode significar explosao de entidades em runtime.
- O gato atual continua sendo contrato obrigatorio.
- Os novos mobs precisam conversar com os biomas/estruturas existentes.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** explorar biomas e areas estruturadas por alguns minutos.
- **Resultado esperado:** novos mobs aparecem com frequencia controlada e sem travamentos.

### Teste 2

- **Acao:** interagir com o gato e com os novos mobs na mesma sessao.
- **Resultado esperado:** o comportamento do gato nao regrede e o runtime segue estavel.

## Rollback

Remover os novos mobs do `MobManager` e restaurar o ecossistema anterior centrado no gato.

## Notas Tecnicas

- Evitar IA complexa nesta fase.
