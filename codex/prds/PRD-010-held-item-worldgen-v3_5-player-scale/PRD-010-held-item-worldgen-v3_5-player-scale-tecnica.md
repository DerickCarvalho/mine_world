# PRD-010 - PRD Tecnica

## Escopo Tecnico

- Novo helper de UI para item 3D compartilhado entre hotbar, inventario e held item.
- Reaproveitamento do catalogo de texturas do mundo na camada de interface.
- Remocao efetiva da mao via markup/CSS, com substituicao por held item animado.
- `WorldConfig` ajustado para nova escala corporal e nova fisica de movimento.
- `TerrainGenerator` e `ProceduralSurfaceDecorator` migrados para defaults `v3.5`.
- `GameApp` reduz orcamento de drenagem de chunks por frame para diminuir congelamentos ligados a streaming de mundo.

## Decisoes Tecnicas

### 1. Held Item e Inventario 3D

- Criado helper `ItemIcon.js` para montar um cubo 3D simples com topo/frente/lado.
- O helper consulta o mesmo catalogo de texturas do runtime de mundo, com fallback para cor base do bloco.
- Hotbar, inventario e held item usam a mesma representacao, reduzindo divergencia visual.

### 2. Remocao da Mao

- O container antigo continua sendo reutilizado para nao quebrar o runtime, mas a renderizacao agora mostra apenas o held item.
- A classe de animacao continua acoplada ao loop de movimento/uso, so que sem faces de braco.

### 3. Worldgen 3.5

- O default do gerador e do cadastro de mundos passa para `v3.5`.
- Montanhas usam pesos mais suaves e menos agressivos para evitar efeito Far Lands.
- Rios recebem corte muito mais leve, mantendo agua perto do `waterLevel`.
- Cavernas passam a exigir aberturas mais controladas e volume interno mais contido para evitar crateras gigantes.
- Decorador passa a sortear `oak` e `eucalyptus`, com formas distintas usando blocos existentes.

### 4. Descongelamento do Runtime

- O streaming de chunks em `GameApp` reduz a quantidade processada por frame.
- A meta e evitar picos longos de CPU que pausam apenas o jogo, mantendo a pagina viva.
- A simplificacao adicional do worldgen tambem reduz custo de amostragem por coluna/chunk.

### 5. Escala do Player

- `playerHeight = 1.95` e `playerRadius = 0.27`.
- Movimento horizontal, gravidade e impulso vertical foram recalibrados para sensacao mais agil.
- O par gravidade/impulso foi ajustado para manter salto util proximo de `1.25` blocos com subida mais rapida.