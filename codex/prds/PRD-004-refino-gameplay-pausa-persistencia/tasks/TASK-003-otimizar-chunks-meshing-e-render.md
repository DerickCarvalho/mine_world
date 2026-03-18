# TASK-003: Otimizar chunks, meshing e render

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-006 |

---

## Objetivo

Reduzir o custo do runtime atual melhorando prioridade de chunks, compactacao de faces e culling antes do desenho em canvas.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/ChunkManager.js` | Modificar | Prioridade e budget de geracao |
| `assets/js/game/world/ChunkMesher.js` | Modificar | Compactacao de faces laterais |
| `assets/js/game/render/SoftwareRenderer.js` | Modificar | Culling por chunk e reducao de trabalho |
| `assets/js/game/world/TerrainGenerator.js` | Modificar | Reaproveitamento de cache se necessario |
| `assets/js/game/GameApp.js` | Modificar | Ajustar prime inicial e drain por frame |

---

## Passos de Implementacao

1. Ordenar a fila de chunks por proximidade ao jogador.
2. Reduzir o prime inicial bloqueante e distribuir melhor a geracao restante.
3. Compactar faces laterais contiguas de mesmo material no mesher.
4. Adicionar metadados de bounds por chunk para culling rapido no renderer.
5. Ajustar o budget por frame para evitar picos de custo em exploracao.

---

## Regras e Cuidados

- Melhorar performance sem trocar o renderer nesta fase.
- Evitar pop-in agressivo na frente imediata do jogador.
- Preservar a leitura do relevo procedural atual.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Fila de chunks prioriza os mais proximos
- [ ] Prime inicial menos pesado
- [ ] Numero de faces por chunk reduzido
- [ ] Exploracao inicial com menos travamentos perceptiveis

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir um mundo e observar o carregamento inicial ao redor do spawn.
- **Resultado esperado:** A cena fica jogavel mais cedo, com chunks proximos priorizados.

### Teste 2

- **Acao:** Caminhar por alguns chunks em linha reta e em diagonal.
- **Resultado esperado:** A geracao continua incremental, sem picos fortes ou engasgos repetitivos a cada borda de chunk.

---

## Rollback

Restaurar o mesher, a fila e o renderer para a estrategia anterior, removendo compactacao e culling adicionados nesta task.

---

## Notas Tecnicas

- Esta task mira ganho estrutural no pipeline atual; afinacoes adicionais podem continuar depois com texturas e mutacao de blocos.
