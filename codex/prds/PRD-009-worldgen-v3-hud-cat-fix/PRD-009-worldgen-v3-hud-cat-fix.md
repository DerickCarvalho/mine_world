# PRD-009 - Worldgen 3.0, HUD Minecraft-like e Fix do Gato

## Objetivo

Corrigir os regressos introduzidos pela iteracao anterior em tres frentes sensiveis para a jogabilidade:

- geracao procedural com montanhas e rios mais naturais,
- HUD inferior mais fiel ao estilo visual esperado,
- estabilizacao total do primeiro mob gato para eliminar travamentos do runtime.

## Problema

A geracao 2.0 passou a produzir relevos artificiais demais, com montanhas que lembram penhascos e rios profundos em formato de canyon. Em paralelo, o HUD ainda nao conversa com a referencia visual do Minecraft, e o novo modelo do gato pode explodir a geometria renderizada e travar a simulacao quando aparece em cena.

## Resultado Esperado

- Novo algoritmo `v3` para mundos criados a partir desta entrega.
- Montanhas em formato de serras e relevos suaves, com mistura mais natural entre grama, terra e pedra.
- Rios rasos e largos, parecidos com rios de planicie, sem cortar o terreno como canyon.
- HUD inferior centrado e compacto, com hotbar e metadados superiores no estilo visual esperado.
- Spawn de gato sem travamento de jogo e sem geometria explodida na tela.

## Requisitos Funcionais

- Mundos novos devem ser criados com `algorithm_version = v3`.
- O algoritmo `v3` deve manter biomas e lagos, mas suavizar montanhas e rios.
- A regra visual das montanhas deve privilegiar serra/encosta em vez de parede vertical de pedra.
- A regra visual dos rios deve criar depressao leve com agua superficial e margens suaves.
- O gato deve continuar com IA de follow, agressao e wander ja existentes.
- O gato deve renderizar em formato voxel estavel e leve, sem congelar o runtime.
- O HUD deve aproximar o look do Minecraft na hierarquia, tamanho e posicionamento da hotbar e indicadores.

## Requisitos Nao Funcionais

- A troca para `v3` nao deve quebrar mundos antigos em `v2`.
- O custo de render do gato deve ser inferior ao modelo rotacionado anterior.
- O HUD deve continuar responsivo em resolucoes menores.

## Criterios de Aceite

- `node --check` deve passar nos arquivos JS alterados.
- `php -l` deve passar na tela do jogo e no cadastro de mundos.
- Criar um novo mundo deve gravar `v3` como algoritmo.
- Spawn natural ou por comando de gato nao deve mais congelar a partida.
- HUD inferior deve ficar mais proximo da referencia visual do Minecraft do que a iteracao anterior.
