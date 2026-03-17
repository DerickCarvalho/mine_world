# TASK-002: Implantar banco e migrations iniciais

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-003, TASK-005 |

---

## Objetivo

Criar a camada PDO reutilizavel e o runner de migrations com as tabelas basicas de usuarios, configuracoes e mundos.

Ambiente local confirmado para esta task:

- Banco: `mineworld_db`
- Usuario assumido: `root`
- Senha: `Senha123#`

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/dependencias/pdo/conexao.php` | Criar | Novo arquivo |
| `api/dependencias/pdo/funcoesPDO.php` | Criar | Novo arquivo |
| `api/database/migrate.php` | Criar | Novo arquivo |
| `api/database/migrations/0000_create_migrations_table.php` | Criar | Novo arquivo |
| `api/database/migrations/0001_create_usuarios_table.php` | Criar | Novo arquivo |
| `api/database/migrations/0002_create_usuarios_configuracoes_table.php` | Criar | Novo arquivo |
| `api/database/migrations/0003_create_mundos_table.php` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Implementar a conexao PDO baseada no ambiente local do Laragon.
2. Criar wrapper simples para consultas parametrizadas, execucao e retorno padrao.
3. Criar runner de migrations com suporte a `up` e `rollback`.
4. Criar as quatro migrations iniciais, com chaves estrangeiras e indices minimos.
5. Validar que banco vazio consegue subir toda a cadeia sem edicao manual.
6. Configurar a conexao local para apontar por padrao a `mineworld_db`.

---

## Regras e Cuidados

- Todas as queries devem usar prepared statements.
- As migrations precisam ser deterministicas e ordenadas pelo prefixo numerico.
- A configuracao local deve refletir o banco `mineworld_db` e a senha `Senha123#`.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Conexao PDO funcional
- [ ] Runner de migration operando em banco vazio
- [ ] Tabelas `usuarios`, `usuarios_configuracoes`, `mundos` e `migrations` criadas corretamente
- [ ] Chaves e indices minimos aplicados

---

## Testes de Verificacao

### Teste 1

- **Acao:** Executar o runner de migrations no ambiente local.
- **Resultado esperado:** Todas as migrations sobem sem erro e ficam registradas na tabela `migrations`.

### Teste 2

- **Acao:** Executar rollback da ultima migration e subir novamente.
- **Resultado esperado:** A tabela afetada e revertida e recriada sem inconsistencias.

---

## Rollback

Executar rollback na ordem inversa e remover `api/database/` e `api/dependencias/pdo/` caso seja necessario zerar a fundacao.

---

## Notas Tecnicas

- `mundos` ja deve nascer com `seed` e `algorithm_version` para evitar retrabalho nas proximas PRDs.
