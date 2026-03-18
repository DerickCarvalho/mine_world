# TASK-001: Modelar persistencia de estado do mundo

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-005 |

---

## Objetivo

Criar a base de banco e de API necessaria para persistir e recuperar o ultimo estado salvo de cada mundo autenticado.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/database/migrations/0004_create_mundos_estado_table.php` | Criar | Nova migration |
| `api/mundos/_common.php` | Modificar | Helpers de save/load |
| `api/mundos/buscar.php` | Modificar | Incluir `save_state` no retorno |
| `api/mundos/salvar_estado.php` | Criar | Novo endpoint |
| `api/database/migrate.php` | Reutilizar | Aplicacao da nova migration |

---

## Passos de Implementacao

1. Criar a tabela `mundos_estado` com chave unica por mundo e campos de pose do jogador + `estado_json`.
2. Adicionar helpers de leitura, normalizacao e escrita do save em `api/mundos/_common.php`.
3. Ajustar `api/mundos/buscar.php` para retornar `world` e `save_state` em uma chamada.
4. Criar `api/mundos/salvar_estado.php` com validacao de ownership, limites do mundo e payload.
5. Atualizar `mundos.ultimo_jogado_em` quando um save valido for persistido.

---

## Regras e Cuidados

- Deve existir apenas um save ativo por mundo.
- O payload salvo precisa nascer versionado com `schema_version = 1`.
- `world.modified_blocks` deve existir no contrato, mesmo vazio.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Migration criada e executavel
- [ ] `buscar.php` retornando `save_state`
- [ ] `salvar_estado.php` persistindo com ownership valido
- [ ] Falhas de payload gerando erro controlado

---

## Testes de Verificacao

### Teste 1

- **Acao:** Executar as migrations e consultar o schema do banco.
- **Resultado esperado:** A tabela `mundos_estado` existe com relacionamento valido para `mundos`.

### Teste 2

- **Acao:** Enviar um POST autenticado para `api/mundos/salvar_estado.php` e depois chamar `api/mundos/buscar.php`.
- **Resultado esperado:** O save e persistido, e o retorno de `buscar.php` inclui o `save_state` correspondente.

---

## Rollback

Remover a migration `0004`, excluir `salvar_estado.php` e desfazer os ajustes de leitura de save em `_common.php` e `buscar.php`.

---

## Notas Tecnicas

- Esta task nao integra ainda a UI de pause nem o fluxo de retorno ao menu; ela apenas prepara a persistencia e o contrato.
