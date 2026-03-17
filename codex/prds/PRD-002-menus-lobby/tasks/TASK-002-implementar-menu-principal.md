# TASK-002: Implementar menu principal

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-002-menus-lobby.md](../PRD-002-menus-lobby.md) |
| **PRD Tecnica** | [PRD-TECNICA-002-menus-lobby.md](../PRD-TECNICA-002-menus-lobby.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-004 |

---

## Objetivo

Implementar a tela `index.php?page=menu` com a marca `MineWorld` e a navegacao inicial para `Jogar` e `Opcoes`.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/menu.php` | Modificar | Placeholder da PRD-001 |
| `assets/js/paginas/menu.js` | Criar | Novo arquivo |
| `assets/css/custom/pages/menu.css` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Montar a marcacao centralizada da tela principal.
2. Criar estilos especificos da pagina `menu`.
3. Implementar `menu.js` com eventos de navegacao para `mundos` e `opcoes`.
4. Garantir leitura clara da marca `MineWorld`.
5. Deixar a pagina pronta para variacoes futuras sem reestruturar o shell.

---

## Regras e Cuidados

- A tela deve parecer menu de jogo, nao painel administrativo.
- A navegacao deve funcionar com poucos cliques e sem depender de formulários.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Titulo `MineWorld` destacado
- [ ] Botoes `Jogar` e `Opcoes` funcionando
- [ ] Layout centralizado em desktop
- [ ] Responsividade minima preservada

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir `index.php?page=menu`.
- **Resultado esperado:** O usuario visualiza a tela centralizada com a marca e as duas opcoes principais.

### Teste 2

- **Acao:** Clicar em `Jogar` e `Opcoes`.
- **Resultado esperado:** O sistema navega respectivamente para `index.php?page=mundos` e `index.php?page=opcoes`.

---

## Rollback

Restaurar `pages/menu.php` ao placeholder anterior e remover os assets da pagina.

---

## Notas Tecnicas

- `menu.js` deve fazer apenas navegacao e pequenos estados visuais, sem logica de negocio pesada.
