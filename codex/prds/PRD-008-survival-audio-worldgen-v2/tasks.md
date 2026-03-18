# PRD-008 - Tasks

## Runtime e HUD

- [x] Reestruturar HUD inferior para vida e fly acima da hotbar.
- [x] Refazer a mao em primeira pessoa para um braco voxel simples.
- [x] Ajustar animacao do braco para leitura mais proxima da referencia alvo.

## Voo e Movimento

- [x] Separar resolucao vertical de voo da resolucao de caminhada.
- [x] Corrigir executor de `/fly` para ativar/desativar voo real.
- [x] Manter colisao com blocos durante subida e descida.

## Audio

- [x] Implementar unlock resiliente do `AudioContext`.
- [x] Implementar som de dano do jogador.
- [x] Implementar som de dano do gato.
- [x] Implementar passos por familia de bloco.
- [x] Implementar som de quebrar bloco.
- [x] Implementar som de colocar bloco.

## Mob Gato

- [x] Refazer malha/cubos do gato sem distorcao por AABB rotacionada.
- [x] Preservar IA existente de follow, wander e agressao.

## Desempenho

- [x] Descarregar chunks no limite de retencao ativa.
- [x] Criar cache dormant de snapshot para reload rapido.
- [x] Reduzir custo de texturas distantes no renderer.

## Worldgen 2.0

- [x] Introduzir distribuicao regional de biomas.
- [x] Criar cordilheiras usando ridged noise.
- [x] Aumentar incidencia de lagos e rios.
- [x] Reduzir densidade de arvores.
- [x] Aumentar espacamento minimo entre arvores.

## Validacao

- [x] Validar sintaxe JS com `node --check`.
- [x] Validar `pages/jogo.php` com `php -l`.
- [ ] Validar visualmente no navegador a mao, HUD, audio e voo.
