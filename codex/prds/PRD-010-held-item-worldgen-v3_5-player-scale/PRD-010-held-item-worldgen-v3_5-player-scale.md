# PRD-010 - Held Item, Inventario 3D, Worldgen 3.5 e Escala do Player

## Objetivo

Refinar a apresentacao do jogador e do inventario, remover de vez a mao em primeira pessoa, evoluir a geracao procedural para `v3.5` e ajustar a escala/mobilidade do personagem para uma leitura mais proxima de um sandbox voxel classico.

## Problemas Resolvidos

- A mao em primeira pessoa nao estava chegando ao nivel visual esperado.
- Hotbar e inventario ainda nao exibiam itens como volumes 3D coerentes com o mundo.
- O runtime apresentava congelamentos apos alguns segundos de exploracao, principalmente durante expansao de chunks/terreno.
- Montanhas, cavernas e rios ainda tinham artefatos visuais estranhos.
- O personagem estava largo/baixo e com movimento lento demais para o mapa.

## Resultado Esperado

- A mao deixa de existir visualmente.
- O item selecionado na hotbar aparece no canto como item segurado.
- Itens da hotbar e do inventario usam um icone 3D coerente com textura/cor do bloco do mundo.
- Mundos novos passam a nascer em `v3.5`.
- `v3.5` suaviza serras, reduz crateras/cavernas estranhas, introduz eucalipto e reduz risco de congelamento por custo de geracao.
- O player fica mais fino, com `1.95` blocos de altura, movimento mais agil e pulo mais rapido com altura de aproximadamente `1.25` blocos.