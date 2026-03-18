# TASK-006: Atualizar meshing, render e nevoa

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002, TASK-005 |
| **Bloqueia** | TASK-007 |

---

## Objetivo

Adaptar o pipeline de chunks e render para o mundo mutavel e a nova superficie, com remesh localizado, tratamento visual basico de novos blocos e nevoa suficiente para mascarar o horizonte.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/ChunkMesher.js` | Modificar | Novo catalogo de blocos |
| `assets/js/game/world/ChunkManager.js` | Modificar | Chunks sujos e remesh |
| `assets/js/game/render/SoftwareRenderer.js` | Modificar | Fog e desenho de novos materiais |
| `assets/js/game/world/WorldConfig.js` | Modificar | Ajustes de distancia, se necessario |

---

## Passos de Implementacao

1. Atualizar o mesher para lidar com blocos novos e mundo mutavel.
2. Remalhar somente chunks afetados por mutacao ou fronteira adjacente.
3. Reforcar a nevoa de distancia para suavizar o final visual do mapa.

---

## Regras e Cuidados

- O pipeline nao deve recalcular todo o mundo a cada quebra ou colocacao.
- A fog nao pode prejudicar a leitura de blocos dentro do alcance de interacao.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Novos blocos aparecendo corretamente no render
- [ ] Remesh localizado funcionando
- [ ] Fog escondendo melhor horizonte e borda visual
- [ ] Sem regressao grave de performance

---

## Testes de Verificacao

### Teste 1

- **Acao:** quebrar e colocar blocos em sequencia em chunks proximos.
- **Resultado esperado:** apenas chunks afetados sao atualizados e o jogo continua responsivo.

### Teste 2

- **Acao:** explorar o terreno em linha reta ate a distancia de render.
- **Resultado esperado:** a nevoa mascara melhor a transicao visual e o final do mapa.

---

## Rollback

Restaurar a logica anterior de `ChunkMesher.js`, `ChunkManager.js` e `SoftwareRenderer.js`, removendo suporte a blocos novos e ao remesh localizado.

---

## Notas Tecnicas

- Se necessario, separar o tratamento visual de blocos translucidos em regra simplificada e barata.
