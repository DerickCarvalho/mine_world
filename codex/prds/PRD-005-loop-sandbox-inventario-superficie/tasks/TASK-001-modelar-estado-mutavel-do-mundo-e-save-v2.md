# TASK-001: Modelar estado mutavel do mundo e save v2

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-007 |

---

## Objetivo

Evoluir o contrato de save do mundo para `schema_version = 2`, incluindo inventario simples, slot selecionado e mutacoes do terreno, sem quebrar compatibilidade com saves `v1`.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/mundos/_common.php` | Modificar | Normalizacao do save |
| `api/mundos/buscar.php` | Modificar | Retorno de `save_state` |
| `api/mundos/salvar_estado.php` | Modificar | Persistencia do save v2 |
| `assets/js/game/services/WorldRepository.js` | Modificar | Serializacao frontend/backend |

---

## Passos de Implementacao

1. Definir o payload `save_state_v2` com `player`, `inventory` e `world.block_mutations`.
2. Implementar fallback automatico de `v1` para `v2` com inventario vazio e slot `0`.
3. Validar blocos, quantidades, coordenadas e tamanho do payload antes de salvar.

---

## Regras e Cuidados

- Manter a tabela `mundos_estado` e evoluir apenas o contrato do `estado_json`.
- `inventory.slots` deve sempre retornar `27` posicoes normalizadas.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Save v2 normalizado no backend
- [ ] Fallback de save v1 funcionando
- [ ] Cliente recebendo e enviando payload consistente
- [ ] Documentacao atualizada se necessario

---

## Testes de Verificacao

### Teste 1

- **Acao:** carregar um mundo com save antigo da PRD-004.
- **Resultado esperado:** runtime recebe save normalizado com inventario vazio e sem erro.

### Teste 2

- **Acao:** salvar um payload com inventario e mutacoes validas.
- **Resultado esperado:** backend persiste `schema_version = 2` e devolve o save normalizado.

---

## Rollback

Restaurar `WORLD_SAVE_SCHEMA_VERSION = 1`, remover normalizacao de inventario e mutacoes, e voltar o `WorldRepository.js` ao contrato anterior.

---

## Notas Tecnicas

- O save deve continuar pequeno e pronto para deduplicacao futura por coordenada.
