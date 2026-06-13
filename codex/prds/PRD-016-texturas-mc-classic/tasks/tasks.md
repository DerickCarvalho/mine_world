# Tasks — PRD-016: Texturas Minecraft Classic

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Copiar texturas MC para `assets/textures/mc/` (block/, item/, entity/) | Nenhuma |
| TASK-002 | Criar `BlockTextureMap.js` com mapeamento de faces por block key | TASK-001 |
| TASK-003 | Criar `ItemTextureMap.js` e atualizar `ItemIcon.js` para usar `<img>` | TASK-001 |
| TASK-004 | Criar `EntityTextureMap.js` e atualizar `getRenderable()` de cada mob | TASK-001 |
| TASK-005 | Criar `StaticTextureLoader.js` e integrar ao `WebGLRenderer`: cache WebGL textures, shader com `u_useTexture` | TASK-002, TASK-004 |
| TASK-006 | Atualizar `FirstPersonHand.js`: canvas com recorte de `entity/steve.png` para mão vazia | TASK-001 |
| TASK-007 | Remover `pages/texturas.php`, link no nav, `api/texturas/`, JS e CSS de texturas | Nenhuma |

**Ordem de execução:** TASK-001 → TASK-002+003+004 (paralelo) → TASK-005 → TASK-006 → TASK-007
