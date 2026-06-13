# TASK-007: Remover menu de texturas e arquivos relacionados

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-06, CA-07, CA-08 |

## Objetivo

Remover completamente o sistema de upload e gerenciamento de texturas: botão no menu, página PHP, JS e CSS associados.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/menu.php` | Modificar | remove botão Texturas |
| `pages/texturas.php` | Deletar | página removida |
| `assets/js/paginas/texturas.js` | Deletar | JS removido |

## Passos de Implementacao

1. Remover o botão `data-nav-page="texturas"` de `pages/menu.php`
2. Deletar `pages/texturas.php`
3. Deletar `assets/js/paginas/texturas.js`
4. Verificar que navegar para `?page=texturas` resulta em 404 ou fallback de navegação

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
