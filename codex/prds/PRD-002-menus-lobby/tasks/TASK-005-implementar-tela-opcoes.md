# TASK-005: Implementar tela de opcoes

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-002-menus-lobby.md](../PRD-002-menus-lobby.md) |
| **PRD Tecnica** | [PRD-TECNICA-002-menus-lobby.md](../PRD-TECNICA-002-menus-lobby.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | PRD-003 |

---

## Objetivo

Implementar `index.php?page=opcoes` integrada aos endpoints de configuracao para leitura e gravacao das preferencias iniciais do jogador.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/opcoes.php` | Criar | Novo arquivo |
| `assets/js/paginas/opcoes.js` | Criar | Novo arquivo |
| `assets/css/custom/pages/opcoes.css` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Definir os campos iniciais de configuracao visiveis na tela.
2. Montar a interface de `Opcoes` com caminho de retorno ao menu.
3. Implementar leitura inicial via `api/configuracoes/buscar.php`.
4. Implementar gravacao via `api/configuracoes/salvar.php`.
5. Exibir feedback de sucesso e erro com helpers globais.

---

## Regras e Cuidados

- Nao exibir configuracao sem suporte real no backend.
- Os campos devem respeitar as faixas esperadas pela PRD-003, como sensibilidade e distancia de render.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Tela `Opcoes` carregando configuracoes do usuario
- [ ] Gravacao funcionando
- [ ] Retorno ao menu principal funcionando
- [ ] Feedback visual consistente

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir `index.php?page=opcoes` com usuario autenticado.
- **Resultado esperado:** Os campos sao preenchidos com defaults ou valores ja salvos.

### Teste 2

- **Acao:** Alterar configuracoes, salvar e recarregar a pagina.
- **Resultado esperado:** Os valores persistem e voltam carregados corretamente.

---

## Rollback

Remover `pages/opcoes.php` e os assets da pagina, sem impactar os endpoints de configuracao.

---

## Notas Tecnicas

- As configuracoes desta pagina serao reutilizadas no bootstrap da tela `jogo`.
