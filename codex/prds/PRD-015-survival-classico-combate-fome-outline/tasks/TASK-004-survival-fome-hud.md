# TASK-004: Adicionar fome, HUD survival e regras de consumo

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-003 |
| **Bloqueia** | TASK-008 |
| **Criterios cobertos** | CA-08, CA-09, CA-14 |

## Objetivo

Adicionar barra de fome e regras basicas de drenagem/recuperacao, integrando o novo estado survival a HUD e ao save.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | estado de fome e loop survival |
| `assets/js/game/ui/GameplayHudController.js` | Modificar | HUD de fome |
| `assets/js/game/services/WorldRepository.js` | Modificar | persistencia do estado de fome |
| `api/mundos/_common.php` | Modificar | normalizacao do save |
| `pages/jogo.php` | Modificar | markup da HUD |

## Passos de Implementacao

1. Introduzir estado de fome e regras de drenagem calibradas.
2. Exibir a fome na HUD e integrar comida simples ao consumo.
3. Persistir o estado sem quebrar saves antigos.

## Regras e Cuidados

- A fome deve cair lentamente e ser facil de recalibrar.
- O save antigo sem campo de fome precisa abrir normalmente.
- A HUD nova nao pode poluir ou desalojar vida/hotbar.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** jogar por alguns minutos andando, pulando e interagindo
- **Resultado esperado:** a barra de fome muda ao longo da sessao

### Teste 2

- **Acao:** consumir um item de comida simples
- **Resultado esperado:** a fome aumenta e a HUD reflete a recuperacao

## Rollback

Remover a fome do runtime e do save, mantendo a HUD anterior e o restante do inventario intacto.

## Notas Tecnicas

- Esta task prepara a base survival, mas nao substitui balanceamento futuro.
