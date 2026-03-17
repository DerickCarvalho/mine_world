# TASK-005: Implementar configuracoes base do usuario

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002, TASK-003 |
| **Bloqueia** | TASK-006 e PRD-002 |

---

## Objetivo

Criar a persistencia e os endpoints de configuracoes basicas do usuario, com defaults coerentes para as telas futuras de opcoes e jogo.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/configuracoes/buscar.php` | Criar | Novo arquivo |
| `api/configuracoes/salvar.php` | Criar | Novo arquivo |
| `api/dependencias/utils.php` | Modificar | Helpers JSON e defaults |

---

## Passos de Implementacao

1. Definir defaults de configuracao como parte do backend.
2. Implementar `buscar.php` para retornar configuracao do usuario autenticado.
3. Implementar `salvar.php` para atualizacao parcial segura.
4. Garantir criacao automatica de registro default se o usuario ainda nao tiver configuracao.
5. Padronizar retorno JSON para consumo imediato pelo frontend.

---

## Regras e Cuidados

- `salvar.php` nao deve zerar campos ausentes.
- Campos numericos devem ser validados em faixa aceitavel.
- A leitura de configuracao deve sempre retornar payload completo.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Defaults de configuracao definidos
- [ ] Busca de configuracoes funcional
- [ ] Gravacao parcial funcional
- [ ] Usuario autenticado so altera a propria configuracao

---

## Testes de Verificacao

### Teste 1

- **Acao:** Chamar `api/configuracoes/buscar.php` com usuario autenticado sem configuracao previa.
- **Resultado esperado:** O endpoint retorna defaults completos e prontos para uso.

### Teste 2

- **Acao:** Salvar apenas parte das configuracoes e buscar novamente.
- **Resultado esperado:** Campos enviados sao atualizados e os demais permanecem preservados.

---

## Rollback

Remover `api/configuracoes/` e desfazer qualquer logica de auto-criacao de defaults introduzida nesta task.

---

## Notas Tecnicas

- Os mesmos defaults serao reutilizados depois na tela `Opcoes` e no bootstrap da pagina `jogo`.
