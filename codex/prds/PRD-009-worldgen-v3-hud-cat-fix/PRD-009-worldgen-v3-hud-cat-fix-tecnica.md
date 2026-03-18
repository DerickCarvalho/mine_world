# PRD-009 - PRD Tecnica

## Escopo Tecnico

- `TerrainGenerator` passa a operar com defaults em `v3` e ajusta masks de montanha/rios.
- `ProceduralSurfaceDecorator` reequilibra a cobertura superficial para que montanhas nao virem blocos integrais de pedra em qualquer altitude intermediaria.
- `CatMob` abandona a malha rotacionada por vertice, trocando-a por um modelo voxel estavel, cacheado e significativamente mais barato.
- `jogo.css` recebe um override final de HUD para aproximar a barra inferior do padrao visual alvo.
- `api/mundos/cadastrar.php` passa a salvar mundos novos como `v3`.

## Decisoes Tecnicas

### 1. Worldgen 3.0

- Reduzir a agressividade do ridged noise de montanha.
- Introduzir um peso de foothills para formar serras mais longas e menos abruptas.
- Rios deixam de usar corte profundo; passam a aplicar uma depressao suave perto do `waterLevel`.
- Lagos continuam presentes, mas com limiares menos artificiais e melhor combinacao de noise regional.

### 2. Superficie

- Montanhas medias continuam com cobertura de grama/terra.
- Pedra fica concentrada em altitudes realmente altas ou encostas mais inclinadas.
- Isso evita o visual de penhasco 100% mineral na maior parte do relevo montanhoso.

### 3. Gato

- O modelo anterior com cubos rotacionados gerava geometrias instaveis e artefatos grandes na projecao.
- O novo modelo usa cubos axis-aligned, silhueta simplificada e cache por pose.
- A prioridade tecnica aqui e estabilidade do runtime e custo previsivel por frame.

### 4. HUD

- O override final reduz largura da hotbar, remove excesso textual na barra inferior e organiza vida/fly acima dela.
- O objetivo e preservar a estrutura HTML atual, mudando o resultado visual majoritariamente via CSS.

## Validacao Tecnica

- `node --check` em `CatMob`, `TerrainGenerator`, `ProceduralSurfaceDecorator`.
- `php -l` em `pages/jogo.php` e `api/mundos/cadastrar.php`.
- Smoke test visual recomendado para novo mundo `v3`, HUD e spawn do gato.
