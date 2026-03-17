# TASK-002: Implementar bootstrap do mundo

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-003, TASK-006 |

---

## Objetivo

Carregar os metadados do mundo selecionado, validar ownership e inicializar o runtime 3D com configuracoes do usuario.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/mundos/buscar.php` | Modificar | Garantir payload suficiente |
| `assets/js/paginas/jogo.js` | Modificar | Bootstrap principal |
| `assets/js/game/GameApp.js` | Criar | Novo arquivo |
| `assets/js/game/services/WorldRepository.js` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Garantir que `api/mundos/buscar.php` devolva `id`, `nome`, `seed` e `algorithm_version`.
2. Ler `id_mundo` da query string na pagina `jogo`.
3. Buscar metadados do mundo e configuracoes do usuario antes de subir a cena.
4. Instanciar `GameApp` somente quando o payload estiver valido.
5. Tratar estados de loading e erro na pagina.

---

## Regras e Cuidados

- O runtime nao deve iniciar sem seed valida.
- O backend deve negar acesso a mundo de outro usuario.
- O bootstrap precisa deixar claro quando o carregamento falha.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Metadados do mundo retornando corretamente
- [ ] `GameApp` inicializando so apos o preload
- [ ] Erros de API tratados
- [ ] Configuracoes do usuario lidas no bootstrap

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir um mundo valido a partir do lobby.
- **Resultado esperado:** O bootstrap busca metadados, some com a tela de loading e instancia o runtime.

### Teste 2

- **Acao:** Alterar a URL para um `id_mundo` invalido ou sem permissao.
- **Resultado esperado:** A pagina nao inicializa a cena e exibe erro controlado.

---

## Rollback

Desfazer ajustes em `api/mundos/buscar.php` e remover os modulos de bootstrap criados.

---

## Notas Tecnicas

- `GameApp` deve nascer desacoplado de detalhes de DOM que nao sejam canvas e HUD.
