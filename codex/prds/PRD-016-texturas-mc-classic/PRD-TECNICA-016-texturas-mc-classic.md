# PRD-TECNICA-016: Texturas Minecraft Classic — integração completa e remoção do menu

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-016-texturas-mc-classic.md](./PRD-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Técnico** | Codex |
| **Versão** | 1.0 proposta |

## Contexto Técnico

- **Projeto:** MineWorld
- **Stack:** HTML, CSS e JavaScript Vanilla; PHP 8.3.16 + MySQL
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Fonte das texturas:** `C:\Users\DerickCarvalho\Downloads\Texturas\Minecraft Classic Edition\assets\minecraft\textures\`

## Análise do Estado Atual

### Sistema de texturas existente

- `assets/js/game/world/ChunkMaterials.js` — expõe `setBlockTextureCatalog(catalog)` e `getFaceMaterial(blockType, dir)`. O método `getFaceMaterial` já suporta `textureKey` (path string), mas retorna `null` quando `textureCatalog` está vazio. O `WebGLRenderer` usa esse `textureKey` se presente.
- `assets/js/game/services/TextureRepository.js` — serviço que provavelmente busca texturas da API; precisa ser refatorado para carregar de paths estáticos.
- `assets/js/game/render/webgl/WebGLRenderer.js` — o renderer principal; precisa receber e cachear WebGL textures indexadas por path.
- `assets/js/game/ui/ItemIcon.js` — gera markup HTML para ícone de item; hoje usa `baseColor` para um quadrado colorido; deve usar `<img>` quando há path mapeado.
- `assets/js/game/ui/FirstPersonHand.js` — renderiza a mão; o estado `empty` usa 3 spans CSS; precisa usar canvas/img com recorte da skin.
- Mobs em `assets/js/game/entities/*.js` — cada mob retorna `getRenderable()` com tipo e posição; o renderer cria box geometry; sem textura.
- `pages/texturas.php`, `api/texturas/*.php` — sistema legado a remover.

### Arquivos e Módulos Relevantes

| Arquivo / Módulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/world/ChunkMaterials.js` | material por face/bloco | Alterar — usar BlockTextureMap estático |
| `assets/js/game/services/TextureRepository.js` | carregamento de texturas | Alterar — loader estático |
| `assets/js/game/render/webgl/WebGLRenderer.js` | renderização WebGL | Alterar — cache de WebGL textures |
| `assets/js/game/ui/ItemIcon.js` | ícone de item na UI | Alterar — usar `<img>` com ItemTextureMap |
| `assets/js/game/ui/FirstPersonHand.js` | mão em 1ª pessoa | Alterar — usar canvas com skin steve |
| `assets/js/game/entities/MobManager.js` | lifecycle de mobs | Revisar — EntityTextureMap |
| `assets/js/game/entities/*.js` | modelos de mobs | Alterar — referenciar textura no `getRenderable()` |
| `pages/texturas.php` | UI legada | Remover |
| `api/texturas/*.php` | endpoints legados | Remover ou desativar |

## Solução Técnica Proposta

### Abordagem geral

Substituição em 4 camadas independentes e verificáveis:

1. **Cópia de assets** — copiar texturas para `assets/textures/mc/`
2. **Mapas estáticos** — criar `BlockTextureMap.js`, `ItemTextureMap.js`, `EntityTextureMap.js`
3. **WebGL texture cache** — carregar e cachear texturas no renderer na inicialização
4. **Integração por sistema** — blocos, itens UI, mão vazia, mobs

### Fluxo técnico

```
inicialização do jogo
  → StaticTextureLoader.preload([paths...])
     → GET /assets/textures/mc/block/*.png (WebGL textures)
     → GET /assets/textures/mc/entity/*.png (WebGL textures)
     → GET /assets/textures/mc/entity/steve.png (canvas skin)
  → WebGLRenderer.setTextures(cache)
  → ChunkMaterials.setBlockTextureMap(BlockTextureMap)

renderização de chunk
  → getFaceMaterial(blockId, dir)
     → BlockTextureMap.getFacePath(key, dir)
     → WebGLRenderer.getTexture(path) → WebGLTexture

renderização de mob
  → EntityTextureMap.getPath(mobType)
  → WebGLRenderer.getTexture(path) → WebGLTexture (UV mapping)

UI de item
  → ItemTextureMap.getPath(blockId)
  → ItemIcon.render() → `<img src="...">`

mão vazia
  → FirstPersonHand.renderEmptyHand()
  → canvas 2D: drawImage(steveSkin, srcX=40, srcY=16, 16, 16, ...)
```

## Implementação Detalhada

### TASK-001: Copiar texturas para o projeto

**Arquivo novo:** `assets/textures/mc/` (tree)

**Ação:** O executor deve copiar recursivamente usando o seguinte comando PowerShell:

```powershell
$src = "C:\Users\DerickCarvalho\Downloads\Texturas\Minecraft Classic Edition\assets\minecraft\textures"
$dst = "C:\laragon\www\mine_world\assets\textures\mc"
Copy-Item "$src\block" "$dst\block" -Recurse -Force
Copy-Item "$src\item"  "$dst\item"  -Recurse -Force
Copy-Item "$src\entity" "$dst\entity" -Recurse -Force
```

**Pontos de atenção:**
- Verificar que o servidor Laragon serve arquivos de `assets/textures/` estaticamente
- Confirmar que `GET /assets/textures/mc/block/grass_block_top.png` retorna 200

---

### TASK-002: BlockTextureMap.js

**Arquivo novo:** `assets/js/game/world/BlockTextureMap.js`

**Responsabilidade técnica:**
- Exportar `BLOCK_TEXTURE_MAP`: objeto `{ [blockKey]: { top, side, bottom } }` com paths relativos à raiz do site
- Exportar `getBlockFacePath(blockKey, direction)`: retorna path string ou `null` se não mapeado
- Paths no formato `/assets/textures/mc/block/<nome>.png`

**Estrutura esperada:**
```js
const BASE = '/assets/textures/mc/block/';
export const BLOCK_TEXTURE_MAP = Object.freeze({
  grass:       { top: BASE + 'grass_block_top.png',  side: BASE + 'grass_block_side.png', bottom: BASE + 'dirt.png' },
  dirt:        { top: BASE + 'dirt.png',             side: BASE + 'dirt.png',             bottom: BASE + 'dirt.png' },
  stone:       { top: BASE + 'stone.png',            side: BASE + 'stone.png',            bottom: BASE + 'stone.png' },
  sand:        { top: BASE + 'sand.png',             side: BASE + 'sand.png',             bottom: BASE + 'sand.png' },
  water:       { top: BASE + 'water_still.png',      side: BASE + 'water_still.png',      bottom: BASE + 'water_still.png' },
  wood:        { top: BASE + 'oak_log_top.png',      side: BASE + 'oak_log.png',          bottom: BASE + 'oak_log_top.png' },
  leaves:      { top: BASE + 'oak_leaves.png',       side: BASE + 'oak_leaves.png',       bottom: BASE + 'oak_leaves.png' },
  bedrock:     { top: BASE + 'bedrock.png',          side: BASE + 'bedrock.png',          bottom: BASE + 'bedrock.png' },
  coal_ore:    { top: BASE + 'coal_ore.png',         side: BASE + 'coal_ore.png',         bottom: BASE + 'coal_ore.png' },
  iron_ore:    { top: BASE + 'iron_ore.png',         side: BASE + 'iron_ore.png',         bottom: BASE + 'iron_ore.png' },
  gold_ore:    { top: BASE + 'gold_ore.png',         side: BASE + 'gold_ore.png',         bottom: BASE + 'gold_ore.png' },
  planks:      { top: BASE + 'oak_planks.png',       side: BASE + 'oak_planks.png',       bottom: BASE + 'oak_planks.png' },
  cobblestone: { top: BASE + 'cobblestone.png',      side: BASE + 'cobblestone.png',      bottom: BASE + 'cobblestone.png' },
  bricks:      { top: BASE + 'bricks.png',           side: BASE + 'bricks.png',           bottom: BASE + 'bricks.png' },
  glass:       { top: BASE + 'glass.png',            side: BASE + 'glass.png',            bottom: BASE + 'glass.png' },
  workbench:   { top: BASE + 'crafting_table_top.png', side: BASE + 'crafting_table_side.png', bottom: BASE + 'oak_planks.png' },
  furnace:     { top: BASE + 'furnace_top.png',      side: BASE + 'furnace_side.png',     bottom: BASE + 'furnace_side.png' },
  chest:       { top: BASE + 'oak_planks.png',       side: BASE + 'oak_planks.png',       bottom: BASE + 'oak_planks.png' },
  gravel:      { top: BASE + 'gravel.png',           side: BASE + 'gravel.png',           bottom: BASE + 'gravel.png' },
  snow:        { top: BASE + 'snow.png',             side: BASE + 'snow.png',             bottom: BASE + 'snow.png' },
  red_sand:    { top: BASE + 'red_sand.png',         side: BASE + 'red_sand.png',         bottom: BASE + 'red_sand.png' },
  // ... novos blocos da PRD-017
});

export function getBlockFacePath(blockKey, direction) {
  const map = BLOCK_TEXTURE_MAP[blockKey];
  if (!map) return null;
  if (direction === 'top') return map.top;
  if (direction === 'bottom') return map.bottom;
  return map.side;
}
```

**Atualizar `ChunkMaterials.js`:**
- Importar `getBlockFacePath` de `BlockTextureMap.js`
- Em `getFaceMaterial`: usar `getBlockFacePath(definition.key, direction)` como `textureKey`
- Remover dependência de `setBlockTextureCatalog` (manter o setter como no-op por retrocompatibilidade)

---

### TASK-003: ItemTextureMap.js

**Arquivo novo:** `assets/js/game/world/ItemTextureMap.js`

**Responsabilidade técnica:**
- Exportar `getItemTexturePath(blockId)`: retorna path de `item/` ou `block/` para o item

**Lógica:**
- Ferramentas e itens → `item/<nome>.png`
- Blocos colocáveis → tentar `item/<blockKey>.png`, fallback para `block/<blockKey>.png`

**Atualizar `ItemIcon.js`:**
- Importar `getItemTexturePath`
- Se path retornado, usar `<img src="..." class="game-item-icon__texture">` em vez do quadrado colorido
- Fallback para comportamento atual se path for null

---

### TASK-004: EntityTextureMap.js

**Arquivo novo:** `assets/js/game/entities/EntityTextureMap.js`

**Responsabilidade técnica:**
```js
const BASE = '/assets/textures/mc/entity/';
export const ENTITY_TEXTURE_MAP = Object.freeze({
  pig:      BASE + 'pig/pig.png',
  sheep:    BASE + 'sheep/sheep.png',
  cow:      BASE + 'cow/cow.png',
  chicken:  BASE + 'chicken.png',
  creeper:  BASE + 'creeper/creeper.png',
  zombie:   BASE + 'zombie/zombie.png',
  skeleton: BASE + 'skeleton/skeleton.png',
  spider:   BASE + 'spider/spider.png',
});
export function getEntityTexturePath(mobType) {
  return ENTITY_TEXTURE_MAP[mobType] || null;
}
```

**Atualizar `getRenderable()` em cada mob:**
- Incluir campo `texturePath: getEntityTexturePath(this.type)` no objeto retornado

**Atualizar WebGLRenderer (parte de entidades):**
- Ao criar box geometry para entidade: carregar/cachear a textura `texturePath`
- UV mapping simplificado:
  - Cabeça: face frontal = pixels centrais da textura (0–32, 0–16)
  - Corpo/pernas: repetir textura uniformemente
  - Aceitar resultado imperfeito — visual melhor que cor sólida

---

### TASK-005: StaticTextureLoader e WebGL cache

**Arquivo novo:** `assets/js/game/services/StaticTextureLoader.js`

**Responsabilidade técnica:**
- `preload(paths: string[]): Promise<void>` — carrega todas as texturas como WebGL 2D textures
- `getTexture(path): WebGLTexture | null` — retorna textura cacheada por path
- `releaseAll()` — libera texturas (para cleanup de sessão)

**Atualizar `WebGLRenderer.js`:**
- Receber/injetar `StaticTextureLoader` na inicialização
- Em `renderFace()`: se `material.textureKey` existe e textura está no cache, usar textura; else usar cor
- Aplicar `gl.bindTexture(gl.TEXTURE_2D, texture)` e modificar shader para aceitar `u_useTexture` uniform

**Shader changes:**
```glsl
// fragment shader addition
uniform sampler2D u_texture;
uniform float u_useTexture;
// ...
vec4 texColor = texture2D(u_texture, v_uv);
gl_FragColor = mix(v_color, texColor * vec4(v_color.rgb * u_shade, u_alpha), u_useTexture);
```

**Pontos de atenção:**
- UV coordinates já devem estar sendo geradas pelo `ChunkMesher`; verificar e completar se não estiver
- Textura de folhas (leaves) precisa de `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)`
- Manter `NEAREST` filtering para visual pixel-art: `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)`

---

### TASK-006: Mão do Steve com skin texture

**Arquivo alvo:** `assets/js/game/ui/FirstPersonHand.js`

**Responsabilidade técnica:**
- Carregar `entity/steve.png` uma vez como `HTMLImageElement` via `StaticTextureLoader` ou diretamente
- No modo `empty`, renderizar um `<canvas>` em vez dos spans CSS:
  - `drawImage(steveSkin, 40, 16, 16, 16, 0, 0, canvasW, canvasH)` — recorta o braço direito do Steve (skin 1.8 format: braço direito está em x=40–55, y=16–31 nos pixels da textura 64×64)
  - Aplicar CSS de posicionamento e animação igual ao estado atual
- Manter animações de translate/rotateZ existentes aplicadas via `this.root.style.transform`
- O `<canvas>` herda as transformações do pai; funciona sem mudança na lógica de animação

**Estrutura HTML resultante (empty hand):**
```html
<div class="game-held-item__empty-hand" data-state="empty">
  <canvas class="game-held-item__arm-canvas" width="64" height="64"></canvas>
</div>
```

---

### TASK-007: Remoção do menu de texturas

**Arquivos a remover:**
- `pages/texturas.php`
- `assets/js/paginas/texturas.js` (se existir)
- `assets/css/pages/texturas.css` (se existir)

**Arquivos a alterar:**
- `partials/nav.php` (ou equivalente) — remover link "Texturas"
- `pages/menu.php` ou `partials/sidebar.php` — remover entrada de texturas

**Endpoints de API:**
- `api/texturas/` — podem ser mantidos sem link no front (inofensivos); ou removidos se confirmado sem uso

**Redirect opcional:**
- `.htaccess`: `RewriteRule ^index\.php$ - [C]` quando `page=texturas` → redirecionar para `menu`

## Dados, Persistência e Contratos

| Entidade | Campos | Observações |
|----------|--------|-------------|
| Nenhuma nova entidade | — | Sistema é 100% estático |
| `textures` (BD) | Tabela existente | Não remover a tabela; apenas desativar o frontend |

## Requisitos de Performance e Escala

- Pré-carregar no máximo ~60 texturas de bloco na inicialização; evitar lazy loading por frame
- Usar `gl.generateMipmap` apenas se necessário (evitar para NEAREST filtering)
- Texturas de 16×16 pixels cada; tamanho total estimado ~500 KB
- O cache de texturas deve ser um `Map<string, WebGLTexture>` para acesso O(1)

## Segurança e Validações

- Não aceitar paths de textura vindos do usuário ou da rede; apenas caminhos do `BlockTextureMap` estático
- Proteger contra textura não carregada: testar `getTexture()` antes de `bindTexture()`

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| UV coordinates não geradas no ChunkMesher | Alto | Auditar ChunkMesher; adicionar UVs padrão por face antes de implementar shaders |
| Shader incompatível com pipeline atual | Alto | Criar variant de shader e testar isoladamente antes de integrar |
| Skin do Steve em formato diferente (1.7 vs 1.8) | Médio | Verificar dimensão do arquivo; ajustar coords de recorte |
| Remoção do menu quebrar alguma rota protegida | Baixo | Auditar `.htaccess` e `login.php` antes de remover |
| Texturas de leaves com borda preta | Médio | Aplicar alpha blending correto no WebGL para texturas com transparência |

## Plano de Testes

- `node --check` em todos os arquivos JS novos e alterados
- `npm run test:harness` e `npm test`
- Smoke manual: entrar no jogo e confirmar textura de grass, stone, sand visíveis
- Smoke: abrir inventário e confirmar ícones de items com PNG
- Smoke: spawn pig e confirmar textura rosa
- Smoke: vazio no slot → braço do Steve visível
- Smoke: navegar para `?page=texturas` e confirmar redirecionamento/404

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-copiar-texturas-assets.md) | Copiar texturas MC para assets/textures/mc/ | Nenhuma |
| [TASK-002](./tasks/TASK-002-block-texture-map.md) | Criar BlockTextureMap.js e integrar ao ChunkMaterials | TASK-001 |
| [TASK-003](./tasks/TASK-003-item-texture-map.md) | Criar ItemTextureMap.js e integrar ao ItemIcon | TASK-001 |
| [TASK-004](./tasks/TASK-004-entity-texture-map.md) | Criar EntityTextureMap.js e integrar ao renderer de mobs | TASK-001 |
| [TASK-005](./tasks/TASK-005-webgl-texture-cache.md) | StaticTextureLoader + shader de textura no WebGLRenderer | TASK-002, TASK-004 |
| [TASK-006](./tasks/TASK-006-mao-steve-skin.md) | Mão do Steve com canvas recortando skin PNG | TASK-001 |
| [TASK-007](./tasks/TASK-007-remover-menu-texturas.md) | Remover páginas/API/nav de texturas | Nenhuma |

## Rollback

- Reverter `ChunkMaterials.js` para usar `setBlockTextureCatalog` vazio → blocos voltam a cores sólidas
- Reverter `ItemIcon.js` → ícones voltam a quadrados coloridos
- Os arquivos de textura em `assets/textures/mc/` podem ser mantidos sem efeito
- Restaurar `pages/texturas.php` e link no nav a partir do git
