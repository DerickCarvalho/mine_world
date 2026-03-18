# PRD-008 - Survival HUD, Audio e Worldgen 2.0

## Objetivo

Consolidar a camada de sobrevivencia, o feedback audiovisual e a geracao procedural 2.0 do MineWorld para aproximar o feeling visual e funcional do Minecraft sem abandonar a stack atual em canvas 2D + JavaScript Vanilla.

## Problema

A versao atual ainda apresenta 4 gaps de produto:

- HUD e mao em primeira pessoa ainda nao passam a leitura visual classica de sandbox voxel.
- O modo de voo e o primeiro mob funcionam, mas com bugs de movimento e apresentacao.
- A ausencia de audio reduz bastante a sensacao de impacto e resposta do jogo.
- A geracao de mundo e o ciclo de chunks ainda pesam demais perto de arvores e nao distribuem biomas com naturalidade suficiente.

## Resultado Esperado

- Mao em primeira pessoa com silhueta retangular 3D e posicionamento inspirados na referencia do Minecraft.
- Vida e estado de fly acima da hotbar, em leitura mais proxima do HUD classico do genero.
- `/fly` deve ativar um voo consistente, com espaco para subir e `Shift` para descer, sem saltos para coordenadas invalidas.
- O gato deve manter a IA atual, mas com corpo estavel e silhueta mais fiel ao visual voxel de referencia.
- O jogo deve emitir som para dano do jogador, dano do gato, passos, quebra e colocacao de blocos.
- Chunks distantes devem sair do runtime ativo e voltar mais baratas quando revisitadas, reaproveitando snapshot carregado/gerado.
- A geracao 2.0 deve distribuir melhor florestas, desertos, planicies, montanhas, lagos e rios, com menor densidade de arvores e espacamento maior.

## Requisitos Funcionais

- Reposicionar vida e status de fly acima da hotbar.
- Manter 10 divisoes de vida e destacar o fly entre `OFF`, `ON` e `ATIVO`.
- Ajustar a mao para um bloco/retangulo 3D simples, sem deformacoes de palma ou polegar fora da referencia.
- O comando `/fly` deve alternar o recurso e ativar/desativar o voo real do jogador.
- Durante o voo ativo, `espaco` sobe e `Shift` desce, mantendo colisao com blocos.
- O gato deve sofrer hit sonoro, manter animacao de dano e renderizar sem distorcao do corpo ao girar/andar.
- O jogo deve tocar audio sintetizado localmente, sem depender de assets externos nesta etapa.
- Passos devem variar de forma simples conforme o bloco sob o jogador.
- Chunks descarregadas devem deixar de pesar na cena ativa e voltar por snapshot em cache quando revisitadas.
- O mundo deve reduzir densidade de arvores, aumentar distancia minima entre arvores e melhorar o spread de lagos/rios/biomas.

## Requisitos Nao Funcionais

- Preservar compatibilidade com saves e comandos existentes.
- Nao exigir permissao extra do usuario para reproduzir audio alem do unlock padrao do navegador via interacao.
- Nao migrar o renderer para WebGL nesta entrega.
- Manter a dimensao do mundo em `2000 x 2000 x 100`.

## Criticos de Aceite

- `node --check` deve passar nos JS alterados.
- `php -l` deve passar na tela do jogo.
- O jogo deve conseguir entrar em um mundo, usar `/fly`, bater em um gato, quebrar/colocar bloco e emitir som nesses fluxos.
- O HUD inferior deve refletir a nova hierarquia: meta HUD acima, hotbar abaixo, mao no canto inferior direito.
- Um mundo novo deve apresentar biomas mais separados e arvores menos coladas que a versao anterior.
