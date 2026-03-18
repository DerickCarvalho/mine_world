# TASK-002: Implementar mundo mutavel e raycast de blocos

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-004, TASK-006, TASK-007 |

---

## Objetivo

Criar a camada que resolve o bloco real do mundo a partir da base procedural e das mutacoes persistidas, e implementar o raycast que identifica bloco alvo e face valida para quebrar ou colocar.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/MutableWorld.js` | Criar | Novo modulo |
| `assets/js/game/world/RaycastPicker.js` | Criar | Novo modulo |
| `assets/js/game/GameApp.js` | Modificar | Integracao de interacao |
| `assets/js/game/world/ChunkManager.js` | Modificar | Marcar chunks sujos |
| `assets/js/game/world/ChunkMesher.js` | Modificar | Ler blocos mutados |

---

## Passos de Implementacao

1. Criar estrutura em memoria para consultar e aplicar mutacoes por coordenada.
2. Implementar raycast de curto alcance a partir do centro da camera.
3. Integrar quebra e colocacao de blocos ao loop da gameplay com marcacao de chunks sujos.

---

## Regras e Cuidados

- O bloco final deve considerar base procedural mais override mutavel.
- Colocacao deve ser bloqueada em coordenadas fora do mundo ou ocupadas pelo volume do jogador.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Mundo mutavel consultando base + mutacoes
- [ ] Raycast destacando alvo valido
- [ ] Quebra e colocacao alterando o mundo corretamente
- [ ] Chunks sujos sendo remalhados de forma localizada

---

## Testes de Verificacao

### Teste 1

- **Acao:** mirar em um bloco a curta distancia e executar quebra.
- **Resultado esperado:** o bloco alvo e removido e o chunk afetado e atualizado.

### Teste 2

- **Acao:** mirar na face de um bloco e tentar colocar outro bloco adjacente.
- **Resultado esperado:** o bloco e colocado em posicao valida sem prender o jogador.

---

## Rollback

Remover `MutableWorld.js` e `RaycastPicker.js`, desfazer integracao de interacao em `GameApp.js` e restaurar leitura direta do terreno procedural.

---

## Notas Tecnicas

- Esta task define a base de dominio para inventario, mao e persistencia final do mundo alterado.
