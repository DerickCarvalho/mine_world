# TASK-001: Preparar rota e runtime 3D base

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002 |

---

## Objetivo

Preparar a rota autenticada de jogo, a pagina `jogo` e a base de assets/modulos para o runtime 3D.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `index.php` | Modificar | Adicionar rota `jogo` |
| `pages/jogo.php` | Criar | Novo arquivo |
| `assets/js/paginas/jogo.js` | Criar | Novo arquivo |
| `assets/js/game/` | Criar | Nova pasta |
| `assets/js/game/render/` | Criar | Renderer e pipeline visual |
| `assets/css/custom/pages/jogo.css` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Ajustar o roteador autenticado para aceitar `page=jogo`.
2. Criar `pages/jogo.php` com canvas, HUD minimo e placeholders de loading.
3. Estruturar o renderer 3D proprio e os auxiliares necessarios dentro de `assets/js/game/`.
4. Criar `assets/js/paginas/jogo.js` como entrypoint module.
5. Estruturar a pasta `assets/js/game/` para os modulos do runtime.

---

## Regras e Cuidados

- Nao depender de bundler.
- O shell de `jogo` deve ser mais enxuto que as telas de menu.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [x] Rota `page=jogo` funcionando
- [x] Pagina de jogo carregando assets sem erro
- [x] Runtime 3D base integrado
- [x] Entry module pronto para evolucao

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir `index.php?page=jogo&id_mundo=1` com autenticacao valida.
- **Resultado esperado:** A pagina `jogo` carrega o canvas e o bootstrap module sem erro estrutural.

### Teste 2

- **Acao:** Inspecionar console do navegador apos carregar a pagina.
- **Resultado esperado:** Nao ha erro de importacao de modulos ou assets 3D.

---

## Rollback

Remover `page=jogo`, `pages/jogo.php`, `assets/js/paginas/jogo.js`, `assets/js/game/` e `assets/css/custom/pages/jogo.css`.

---

## Notas Tecnicas

- Esta task nao entrega ainda geracao de mundo nem controles do jogador.
