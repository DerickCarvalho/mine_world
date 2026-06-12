# TASK-005: Validar integracao da gameplay

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **PRD Tecnica** | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001, TASK-002, TASK-003, TASK-004 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-02, CA-06, CA-08, CA-09, CA-10 |

## Objetivo

Consolidar a validacao final da PRD em cima do fluxo real de gameplay. A task deve verificar se camera, UI, mob e worldgen convivem sem regressao perceptivel em mundos antigos e novos.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `codex/execucoes/PRD-013-validacao.md` | Criar | Evidencia final |
| `codex/prds/PRD-013-polimento-visual-camera-mobs-worldgen-v4-1/` | Revisar | Cobertura documental |
| Runtime local do jogo | Testar | Mundo existente e mundos novos |

## Passos de Implementacao

1. Executar testes automatizados e validacoes sintaticas aplicaveis.
2. Rodar smoke em pelo menos um mundo existente e multiplos mundos novos `v4.1`, observando pitch, mao vazia, held item, mob e spawn.
3. Registrar evidencias, bugs encontrados e correcoes necessarias antes de concluir a PRD.

## Regras e Cuidados

- Um mundo antigo precisa continuar intacto; um mundo novo precisa nascer em `v4.1`.
- Validar o entorno inicial de varias seeds para nao aprovar worldgen so por uma seed feliz.
- A task nao muda contratos do shell web; apenas valida o runtime da gameplay e a documentacao final.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** rodar `npm test`, `npm run test:harness` e checks sintaticos dos arquivos alterados.
- **Resultado esperado:** toda a bateria passa sem regressao.

### Teste 2

- **Acao:** abrir mundo antigo e mundo novo, testar camera extrema, mao vazia, held item, hotbar, inventario, mob e relevo do spawn.
- **Resultado esperado:** os fluxos convivem sem regressao grave e o mundo novo demonstra a melhoria prevista.

## Rollback

Nao se aplica como rollback de codigo; em caso de falha, a validacao deve reabrir a task ou a PRD de implementacao correspondente.

## Notas Tecnicas

- Esta task e a rede de seguranca para `Connor` e `Ned` no fluxo futuro de execucao.
