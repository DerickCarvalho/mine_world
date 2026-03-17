# TASK-004: Implementar chunks e mesh de blocos

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Pendente |
| **Depende de** | TASK-003 |
| **Bloqueia** | TASK-005, TASK-006 |

---

## Objetivo

Implementar o carregamento por chunks e a geracao de meshes visiveis com materiais placeholder para o terreno.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/ChunkStore.js` | Criar | Novo arquivo |
| `assets/js/game/world/ChunkManager.js` | Criar | Novo arquivo |
| `assets/js/game/world/ChunkMesher.js` | Criar | Novo arquivo |
| `assets/js/game/world/ChunkMaterials.js` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Definir a estrutura de dados de chunk em memoria.
2. Implementar carga e descarte por distancia ao jogador.
3. Implementar mesher com faces expostas apenas.
4. Criar materiais temporarios por tipo de bloco.
5. Integrar a fila de chunks ao `GameApp`.

---

## Regras e Cuidados

- Nunca carregar o mundo inteiro de uma vez.
- O descarte de chunks distantes deve liberar geometria e memoria.
- O mesher deve priorizar legibilidade e performance basica, nao perfeicao grafica.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Chunks proximos sendo carregados
- [ ] Chunks distantes sendo descartados
- [ ] Meshes placeholder visiveis e coerentes
- [ ] Integracao com loop principal funcionando

---

## Testes de Verificacao

### Teste 1

- **Acao:** Iniciar a cena e observar o terreno ao redor do spawn.
- **Resultado esperado:** Os chunks iniciais sao gerados, aparecem no canvas e representam um terreno coerente.

### Teste 2

- **Acao:** Deslocar o jogador por distancia suficiente para atravessar fronteiras de chunk.
- **Resultado esperado:** Novos chunks entram e chunks distantes sao removidos sem travamento severo.

---

## Rollback

Remover os modulos de `ChunkStore`, `ChunkManager`, `ChunkMesher` e `ChunkMaterials`, desfazendo a integracao com `GameApp`.

---

## Notas Tecnicas

- Se necessario, limitar a geracao a poucos chunks por frame para manter fluidez.
