# PRD-011 - Estabilidade de runtime, worldgen v4.0 e HUD central

## Contexto

A iteracao anterior deixou dois problemas centrais no MineWorld: congelamento do jogo apos alguns segundos de runtime e worldgen inconsistente, por vezes plana demais ou com formas artificiais. Alem disso, a hotbar ainda estava visualmente torta em relacao ao centro da tela.

## Objetivo

Entregar uma rodada focada em estabilidade de simulacao e coerencia visual, sem trocar a stack atual do renderer.

## Escopo

- corrigir o descarregamento e reidratacao de chunks para evitar congelamentos do runtime;
- reduzir a pressao de carregamento/meshing no main thread;
- consolidar uma nova versao procedural `v4.0` com rios rasos, serras mais naturais e cavernas menos artificiais;
- manter arvores mais esparsas e preservar carvalho/eucalipto;
- centralizar a hotbar e o metadata strip da HUD inferior.

## Requisitos funcionais

- chunks fora do raio ativo devem sair do runtime sem quebrar o retorno posterior;
- chunks revisitadas devem voltar por snapshot reaproveitado quando disponivel;
- mundos novos devem ser criados com `algorithm_version = v4.0`;
- o relevo de montanhas deve priorizar massas e serras suaves, sem penhascos aleatorios nem efeitos tipo Far Lands;
- rios devem ser rasos e largos, sem aspecto de canyon profundo;
- cavernas devem continuar visiveis na superficie, mas sem crateras grandes e artificiais;
- a hotbar deve permanecer centrada horizontalmente na tela.

## Criterios de aceite

- o jogo nao pode congelar quando chunks antigas forem descarregadas do runtime;
- o deslocamento do jogador deve continuar funcional apos alguns segundos de gameplay;
- novos mundos devem registrar `v4.0` ao serem criados;
- a HUD inferior deve permanecer centralizada em desktop e mobile;
- a sintaxe dos arquivos alterados deve validar em `node --check` e `php -l`.
