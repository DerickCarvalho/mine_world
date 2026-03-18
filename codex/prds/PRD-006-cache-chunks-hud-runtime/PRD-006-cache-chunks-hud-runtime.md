# PRD-006: Cache de chunks, HUD contextual e refinamento in-game

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PRD-006 |
| **Data** | 18/03/2026 |
| **Autor** | Codex |
| **Status** | Implementada |
| **Dependencias** | PRD-004, PRD-005 |

---

## Contexto

O loop sandbox da PRD-005 abriu a base de construcao, inventario e alteracao do terreno, mas ainda deixou gargalos claros de UX e desempenho: a mao em primeira pessoa ficou distante da linguagem visual de Minecraft, a HUD exibe informacoes demais o tempo todo, o menu de pausa ainda nao serve como central de dados/configuracoes, e o mundo continua regenerando chunks proceduralmente sem reaproveitar um cache persistido.

Esta PRD fecha esse gap transformando a gameplay em um fluxo mais estavel e mais barato de carregar: chunks passam a ser pre-geradas, persistidas e reusadas; a entrada em um mundo novo faz prebuild antes do spawn; a informacao de coordenadas vira opt-in por tecla; os dados do mundo ficam restritos ao estado de pausa; configuracoes podem ser alteradas durante a partida com aplicacao automatica; e a camada de bedrock passa a proteger a base do mapa.

---

## Objetivo

Melhorar a sensacao geral de jogo, reduzir custo de geracao recorrente do terreno, tornar a HUD mais contextual e consolidar um fluxo de mundo persistente por chunks.

---

## Escopo Funcional

### 1. Refino visual da mao e da hotbar

- Corrigir a mao em primeira pessoa para linguagem quadrada, reta e mais proxima do Minecraft.
- Garantir que a hotbar fique centralizada na tela.
- Garantir que a hotbar sobreponha visualmente a mao.

### 2. HUD contextual por tecla

- Coordenadas devem aparecer apenas quando o jogador alternar a visualizacao com `C`.
- Dados do mundo devem aparecer apenas quando o jogador abrir o menu de pausa com `P`.
- A gameplay ativa nao deve manter dados tecnicos do mundo permanentemente visiveis na HUD principal.

### 3. Configuracoes durante a gameplay

- O jogador deve conseguir abrir configuracoes enquanto esta no mundo.
- Alteracoes devem ser aplicadas automaticamente no runtime sem exigir reload da pagina.
- Configuracoes editadas durante a partida devem continuar persistidas na conta do usuario.

### 4. Persistencia e pre-geracao de chunks

- Ao criar um mundo novo, o sistema deve pre-gerar uma janela inicial de chunks antes do primeiro spawn.
- Ao entrar em um mundo existente, o sistema deve priorizar o carregamento de chunks salvas em vez de recalcular tudo.
- Chunks ja geradas devem ser persistidas por mundo.
- Chunks persistidas nao devem ser modificadas novamente pelo gerador procedural.
- Apenas mutacoes do jogador podem alterar o estado persistido de um chunk.
- Conforme o jogador caminha, novas chunks podem ser geradas, persistidas e depois reaproveitadas.

### 5. Camada de bedrock

- A camada mais profunda do mundo deve ser composta por `bedrock`.
- Blocos de `bedrock` devem ser inquebraveis pelo jogador.

---

## Requisitos Funcionais

1. O jogo deve pre-gerar um conjunto inicial de chunks ao criar um mundo novo.
2. O jogo deve persistir dados de chunk por mundo para evitar regeneracao integral a cada entrada.
3. O runtime deve carregar chunks persistidas sempre que existirem para a regiao solicitada.
4. O runtime deve continuar gerando chunks ineditas sob demanda conforme a exploracao avanca.
5. O runtime deve salvar chunks novas e chunks modificadas pelo jogador.
6. O jogador deve visualizar coordenadas apenas quando `C` estiver ativado.
7. O jogador deve visualizar dados do mundo apenas dentro do menu de pausa acionado por `P`.
8. O menu de pausa deve oferecer acesso a configuracoes de jogo editaveis em tempo real.
9. A hotbar deve permanecer centralizada e visualmente acima da mao.
10. A mao deve apresentar silhueta reta e quadrada, sem acabamento arredondado.
11. A camada inferior do mundo deve usar `bedrock`, e essa camada nao pode ser quebrada.

---

## Requisitos Nao Funcionais

- A entrada em mundos ja explorados deve reduzir custo de CPU ao reutilizar chunks persistidas.
- O sistema nao deve tentar pre-gerar o mapa logico inteiro de `5000 x 5000 x 100`.
- A persistencia de chunks deve manter contrato simples o suficiente para continuar rodando em PHP + MySQL sem infraestrutura adicional.
- A aplicacao de configuracoes em runtime deve acontecer sem recarregar a pagina.
- A nova HUD nao deve poluir a visao central do jogo.

---

## Criterios de Aceite

- Criar um mundo novo dispara pre-geracao antes da entrada efetiva na gameplay.
- Reabrir um mundo anteriormente explorado reaproveita chunks salvas e reduz regeneracao percebida.
- O jogador ve coordenadas apenas quando ativa `C`.
- O jogador ve dados do mundo apenas no menu aberto por `P`.
- O menu de pausa permite alterar configuracoes e o runtime responde automaticamente.
- A hotbar aparece centralizada no rodape visual e sobre a mao.
- A mao deixa de parecer arredondada e passa a usar proporcoes mais blocadas.
- Tentar quebrar `bedrock` nao altera o mundo nem entrega item ao jogador.

---

## Fora de Escopo

- Pre-geracao do mapa inteiro
- Compressao binaria avançada ou streaming remoto de chunks
- Novos biomas completos
- Ferramentas especificas para quebrar bedrock
- Sistema de recipes, crafting ou mobs

---

## Dependencias

- Estrutura autenticada da PRD-001 e PRD-002
- Runtime sandbox da PRD-005
- Persistencia existente de estado do mundo em `mundos_estado`

---

## Observacoes

- Esta fase consolida a regra pratica de persistencia por chunk: uma vez gerada e salva, a base procedural de uma chunk nao deve ser recalculada para aquele mundo, exceto quando ainda nao houver cache persistido.
- Ao concluir uma nova PRD, o `ESCOPO.md` deve ser atualizado na mesma entrega.
