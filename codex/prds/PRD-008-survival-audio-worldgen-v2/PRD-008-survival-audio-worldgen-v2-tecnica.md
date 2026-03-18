# PRD-008 - PRD Tecnica

## Arquitetura Afetada

- Runtime de gameplay em `assets/js/game/`
- HUD e composicao da tela em `pages/jogo.php` e `assets/css/custom/pages/jogo.css`
- Geracao procedural em `TerrainGenerator`, `ProceduralSurfaceDecorator` e `MutableWorld`
- Carregamento e descarregamento de chunks em `ChunkManager`
- Audio sintetizado via Web Audio API em `GameAudio`

## Decisoes Tecnicas

### 1. Voo

- Separar colisao vertical de voo da colisao vertical de caminhada.
- O `CollisionResolver` ganha um caminho `resolveFlyingVertical`, em pequenos passos, para evitar snap em altura invalida.
- O `/fly` passa a alternar capacidade e estado ativo de voo no mesmo executor.

### 2. Audio

- O audio continua sem assets binarios nesta fase.
- Sons sao sintetizados localmente com `OscillatorNode`, `BiquadFilterNode`, `GainNode` e buffer de ruido.
- O contexto de audio e destravado no primeiro pointer lock/interacao relevante.
- Footsteps usam material simplificado (`grass`, `dirt`, `stone`, `sand`, `wood`, `leaves`).

### 3. HUD e Mao

- O HTML da HUD foi simplificado para um unico bloco central no rodape.
- Vida e fly ficam na faixa imediatamente acima da hotbar.
- A mao usa apenas faces de um cubo alongado, sem dedos separados.
- A animacao do braco continua procedural em CSS transform, mas com amplitude menor e leitura mais proxima da referencia alvo.

### 4. Gato

- O modelo do gato deixa de converter pecas rotacionadas em AABB expandida.
- Cada cubo passa a ser rotacionado em vertices reais, preservando silhueta durante yaw e caminhada.
- A cauda recebe um pequeno `yawOffset` procedural para dar vida sem distorcer o tronco.

### 5. Chunks e Cache Dormant

- `ChunkManager` descarrega chunks logo no limite de retenção em vez de manter um anel extra grande.
- `MutableWorld` passa a manter um cache dormant de snapshots recentemente descarregados.
- Ao revisitar uma area proxima, o runtime prioriza o snapshot cached antes de regenerar a chunk.
- O objetivo e reduzir custo de CPU perto de deslocamentos de ida e volta.

### 6. Worldgen 2.0

- `TerrainGenerator` agora usa ruido regional de larga escala para distribuir biomas e macrorrelevo.
- Montanhas passam a usar ridged noise para formar cordilheiras em vez de morros aleatorios.
- Rios e lagos aumentam incidencia com limiares mais permissivos e combinacao de masks.
- `ProceduralSurfaceDecorator` reduz densidade e aumenta o espacamento minimo de arvores.
- Picos e encostas mais altas convertem topo/filler para pedra, reforcando leitura de montanha.

## Riscos

- O renderer 2D continua sendo o maior gargalo estrutural; esta entrega reduz custo, mas nao substitui uma futura trilha WebGL.
- O cache dormant melhora retorno a areas proximas, mas o custo de mundos totalmente novos continua ligado ao pipeline atual de mesh.
- Audio sintetizado pode soar diferente entre navegadores, embora o fluxo funcional permaneça valido.

## Validacao Tecnica

- `node --check` em runtime, audio, mobs e worldgen.
- `php -l pages/jogo.php` com o PHP do Laragon.
- Smoke test manual recomendado para `/fly`, passos, hit do gato e travessia entre areas com muitas arvores.
