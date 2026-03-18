# TASK-005: Enriquecer superficie procedural

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-006, TASK-007 |

---

## Objetivo

Evoluir a geracao procedural da superficie para incluir agua estatica, areia perto da agua, pedra aparente e arvores deterministicas por seed.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/BlockTypes.js` | Modificar | Novos tipos de bloco |
| `assets/js/game/world/TerrainGenerator.js` | Modificar | Regras de superficie |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Criar | Novo modulo |

---

## Passos de Implementacao

1. Definir novos blocos e regras de material por coluna do terreno.
2. Introduzir nivel de agua e faixas de areia em volta.
3. Gerar arvores simples e deterministicas em areas aptas.

---

## Regras e Cuidados

- A geracao precisa continuar repetivel com a mesma `seed`.
- Arvores nao devem nascer em agua, em encostas muito inclinadas ou em densidade exagerada.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Agua presente em regioes coerentes
- [ ] Areia aparecendo perto da agua
- [ ] Pedra aparente surgindo em partes do relevo
- [ ] Arvores repetiveis por seed

---

## Testes de Verificacao

### Teste 1

- **Acao:** abrir dois mundos com a mesma seed.
- **Resultado esperado:** agua, areia e arvores aparecem na mesma distribuicao.

### Teste 2

- **Acao:** explorar bordas de agua e areas elevadas.
- **Resultado esperado:** areia aparece nas margens e pedra fica exposta em regioes coerentes.

---

## Rollback

Restaurar `BlockTypes.js` e `TerrainGenerator.js` ao catalogo e relevo anteriores, removendo o decorador superficial.

---

## Notas Tecnicas

- A agua desta fase e cenario; nao havera fluxo, correnteza nem simulacao dinamica.
