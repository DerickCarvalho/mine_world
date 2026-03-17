# TASK-006: Integrar HUD e ciclo de vida da cena

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Pendente |
| **Depende de** | TASK-002, TASK-004, TASK-005 |
| **Bloqueia** | Nenhuma |

---

## Objetivo

Finalizar a experiencia inicial do mundo 3D com crosshair, estados de loading/erro, resize, cleanup de recursos e verificacao manual integrada.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/jogo.php` | Modificar | HUD e overlays |
| `assets/css/custom/pages/jogo.css` | Modificar | Crosshair e estado visual |
| `assets/js/game/ui/Crosshair.js` | Criar | Novo arquivo |
| `assets/js/game/ui/SceneOverlay.js` | Criar | Novo arquivo |
| `assets/js/game/GameApp.js` | Modificar | Resize e cleanup |

---

## Passos de Implementacao

1. Criar crosshair central simples.
2. Implementar overlay de loading, erro e instrucao de pointer lock.
3. Integrar tratamento de resize do canvas e viewport.
4. Implementar cleanup de listeners, renderer e geometrias ao sair da pagina.
5. Consolidar um roteiro de verificacao manual da cena pronta.

---

## Regras e Cuidados

- O HUD deve ser minimo e nao competir com o mundo.
- Cleanup precisa evitar listeners duplicados em navegacoes repetidas.
- A pagina deve continuar funcional ao perder ou recuperar foco.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Crosshair visivel e discreto
- [ ] Overlay de loading/erro funcionando
- [ ] Resize tratado corretamente
- [ ] Cleanup de recursos implementado

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir um mundo, esperar carregar, alternar foco da janela e redimensionar o navegador.
- **Resultado esperado:** A cena continua utilizavel e o canvas se adapta sem quebrar.

### Teste 2

- **Acao:** Entrar e sair repetidamente da rota `page=jogo`.
- **Resultado esperado:** Nao ha acumulacao evidente de listeners, overlays duplicados ou crash do renderer.

---

## Rollback

Remover os modulos de UI e desfazer ajustes de resize/cleanup do `GameApp`.

---

## Notas Tecnicas

- Esta task fecha a versao inicial jogavel, nao adiciona mecanicas de quebrar ou colocar blocos.
