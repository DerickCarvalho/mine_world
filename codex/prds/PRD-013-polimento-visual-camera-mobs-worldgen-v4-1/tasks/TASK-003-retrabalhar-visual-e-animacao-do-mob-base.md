# TASK-003: Retrabalhar visual e animacao do mob base

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **PRD Tecnica** | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-005 |
| **Criterios cobertos** | CA-05, CA-06 |

## Objetivo

Melhorar a silhueta, proporcao e animacao do mob base atual sem mexer no comportamento central de spawn, picking e follow. A meta e tirar a aparencia de modelo improvisado.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/entities/CatMob.js` | Modificar | Modelo e animacao |
| `assets/js/game/entities/MobManager.js` | Revisar | Spawn e compatibilidade |
| `assets/js/game/render/webgl/` | Revisar | Consumo do modelo, se aplicavel |

## Passos de Implementacao

1. Revisar a composicao geometrica do mob para melhorar silhueta e proporcoes.
2. Implementar animacoes mais limpas de idle e deslocamento, com transicoes leves.
3. Validar que spawn, picking e toggle de follow permanecem funcionais apos o retrabalho.

## Regras e Cuidados

- Nao alterar o contrato jogavel do mob alem do que for necessario para a apresentacao.
- Evitar aumento exagerado de partes, buffers ou custo por frame.
- O resultado precisa conversar com o resto do estilo visual do jogo.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** observar o mob em idle e andando por alguns minutos em cena.
- **Resultado esperado:** a animacao e perceptivel, limpa e sem flicker evidente.

### Teste 2

- **Acao:** clicar com o botao direito no mob para alternar o follow e testar o picking.
- **Resultado esperado:** o comportamento existente continua funcionando normalmente.

## Rollback

Restaurar o modelo e a animacao anteriores do `CatMob`, preservando as demais tasks da PRD.

## Notas Tecnicas

- Cobertura principal: `CA-05` e `CA-06`.
