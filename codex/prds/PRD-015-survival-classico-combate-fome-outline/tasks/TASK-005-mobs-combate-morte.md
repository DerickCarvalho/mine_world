# TASK-005: Recriar mobs, combate e ciclo de morte

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001, TASK-002 |
| **Bloqueia** | TASK-006, TASK-008 |
| **Criterios cobertos** | CA-10, CA-12, CA-13 |

## Objetivo

Criar um ciclo coerente de mobs passivos e hostis com HP, dano, cooldown, morte e remocao limpa do mundo.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/entities/MobManager.js` | Modificar | spawn, vida e ciclo das entidades |
| `assets/js/game/entities/*.js` | Criar/Modificar | mobs passivos e hostis |
| `assets/js/game/GameApp.js` | Modificar | combate do jogador e integracao com hit |
| `assets/js/game/audio/GameAudio.js` | Revisar | feedback de hit/morte |

## Passos de Implementacao

1. Reestruturar o modelo de mob para suportar HP, dano e morte.
2. Adicionar ao menos um mob hostil simples e revisar a leitura visual dos mobs existentes.
3. Integrar combate do jogador com cooldown e alcance curto.

## Regras e Cuidados

- Mob morto nao pode seguir atacando nem colidindo.
- O alcance de ataque do jogador deve ser curto e previsivel.
- Evitar IA complexa demais para a fase atual; coerencia importa mais que sofisticacao.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** atacar um mob varias vezes com a mao vazia ou arma/ferramenta
- **Resultado esperado:** o HP reduz, ha cooldown e o mob eventualmente morre

### Teste 2

- **Acao:** aproximar-se de um mob hostil
- **Resultado esperado:** ele detecta, persegue e causa dano de forma limitada

## Rollback

Voltar ao ecossistema anterior de mobs e retirar apenas a camada nova de combate/vida, preservando correcoes visuais aproveitaveis.

## Notas Tecnicas

- Esta task deve deixar Connor feliz: comportamento simples, mas investigavel e consistente.
