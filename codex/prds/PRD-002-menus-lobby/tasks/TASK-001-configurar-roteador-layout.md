# TASK-001: Configurar roteador e layout autenticado

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-002-menus-lobby.md](../PRD-002-menus-lobby.md) |
| **PRD Tecnica** | [PRD-TECNICA-002-menus-lobby.md](../PRD-TECNICA-002-menus-lobby.md) |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-005 |

---

## Objetivo

Ajustar o shell autenticado para suportar as rotas `menu`, `mundos` e `opcoes`, com layout reutilizavel e fallback seguro.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `index.php` | Modificar | Roteador autenticado |
| `layout.php` | Modificar | Estrutura global |
| `partials/` | Criar/Modificar | Blocos de shell compartilhado |
| `assets/css/custom/global.css` | Modificar | Ajustes de layout base |

---

## Passos de Implementacao

1. Expandir o roteador para suportar `menu`, `mundos` e `opcoes`.
2. Ajustar `layout.php` para ter uma area central compartilhada.
3. Criar partials minimos de cabecalho ou moldura autenticada, se necessario.
4. Definir fallback de rota para `menu`.
5. Garantir que a variante do shell nao bloqueie a futura pagina `jogo`.

---

## Regras e Cuidados

- O shell precisa ser leve o suficiente para a futura tela 3D.
- Evitar elementos de dashboard que conflitem com a identidade do MineWorld.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Roteador autenticado suporta as novas paginas
- [ ] Fallback seguro configurado
- [ ] Layout compartilhado funcionando
- [ ] Base pronta para receber telas de menu e lobby

---

## Testes de Verificacao

### Teste 1

- **Acao:** Acessar `index.php?page=menu`, `index.php?page=mundos` e `index.php?page=opcoes`.
- **Resultado esperado:** Cada rota carrega dentro do shell autenticado sem erro estrutural.

### Teste 2

- **Acao:** Acessar `index.php?page=rota-invalida`.
- **Resultado esperado:** O sistema aplica fallback para `menu` ou resposta controlada equivalente.

---

## Rollback

Restaurar `index.php` e `layout.php` ao estado anterior da PRD-001.

---

## Notas Tecnicas

- Esta task nao entrega o conteudo final das telas, apenas o esqueleto de roteamento e layout.
