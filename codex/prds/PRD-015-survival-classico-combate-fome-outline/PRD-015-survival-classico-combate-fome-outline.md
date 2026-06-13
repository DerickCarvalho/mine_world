# PRD-015: Survival classico, combate e UX voxel madura

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-015 |
| **Harness Version** | 2 |
| **Titulo** | Survival classico, combate e UX voxel madura |
| **Tipo** | Melhoria e expansao de gameplay |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-013 e PRD-014 |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** levar o jogo do estado de sandbox tecnico para um survival voxel coerente, legivel e sustentavel em sessoes mais longas
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL apenas quando houver necessidade de backend
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural obrigatorio:** basear front + API no modelo de `C:\laragon\www\dealer-gestao-modulos`

## Padrao de Front + API Aplicavel

- **Entrada publica:** `login.php`
- **Area autenticada:** `index.php?page=...`
- **Composicao de UI:** `layout.php`, `pages/`, `partials/`
- **Scripts por tela:** `assets/js/paginas/`
- **Configuracao frontend:** `env.default.js` e `env.deploy.js` com objeto global `ENV`
- **API:** `api/{dominio}/{acao}.php`
- **Cliente HTTP:** wrapper compartilhado no estilo `ApiRequest.js`
- **Sessao no cliente:** token em `localStorage`
- **Feedback visual:** helpers compartilhados de loading, sucesso, erro e confirmacao
- **Observacao:** a camada de jogo 3D permanece em JS Vanilla, respeitando o shell web atual

## Problema / Oportunidade

O MineWorld ja saiu do zero, mas a experiencia ainda parece fragmentada: parte do jogo ja tem base de survival e parte ainda entrega leitura visual ruim, interacao incompleta e worldgen pouco convincente. O inventario ainda nao sustenta um fluxo gostoso de craft, a camera e a selecao de bloco ainda nao parecem definitivas, os mobs nao sustentam combate e morte completos, e falta o ciclo basico de fome, drops e progressao. O print anexado reforca isso: o mundo ainda transmite terreno artificial, relevo duro e acabamento insuficiente.

### Impacto Atual

- **Quem e afetado:** todo jogador que entra para explorar, construir ou testar o loop survival
- **Frequencia:** sempre
- **Consequencia:** reduz imersao, derruba a percepcao de qualidade e impede que o jogo pareca um survival voxel maduro

## Objetivo da Funcionalidade

Entregar a primeira versao realmente coesa do MineWorld como survival voxel classico: camera confiavel, outline correto no bloco mirado, inventario/hotbar limpos, crafting util, mundo procedural mais natural, fome funcional, mao vazia convincente, mobs combatÃ­veis e drops coletaveis. A meta nao e copiar assets, marcas ou arquivos do Minecraft, e sim aproximar a experiencia mecanica e visual dentro da arquitetura ja existente do projeto.

Esta PRD existe para separar elevacao de qualidade e paridade survival da expansao inicial de conteudo da PRD-014. A PRD-014 introduz base de modos, blocos, estruturas e crafting. A PRD-015 fecha o que ainda esta faltando para essa base parecer produto e nao apenas prototipo enriquecido.

### Resultado Esperado para o Usuario

- Explorar um mundo que parece mais natural, vivo e menos artificial
- Entender rapidamente a HUD, o inventario, a hotbar e o bloco mirado
- Conseguir coletar, craftar, lutar, matar mobs, pegar drops e gerenciar fome
- Sentir uma experiencia de survival muito mais proxima do imaginario de um sandbox voxel classico

## Fluxo Atual

1. O jogador entra num mundo com renderer, chunks, blocos e inventario basico ja existentes.
2. A camera, o bloco mirado, os itens da UI, o relevo e os mobs ainda transmitem acabamento inconsistente.
3. O jogo nao fecha o loop survival completo com fome, combate maduro, morte de mobs e drops coletaveis.

## Fluxo Desejado

1. O jogador entra no mundo, olha completamente para cima/baixo, mira com precisao e enxerga apenas o outline do bloco selecionado.
2. Explora um mundo com biomas mais claros, mais arvores e relevo convincente.
3. Usa inventario/hotbar/crafting sem itens bugados nem icones quebrados.
4. Enfrenta mobs, mata, coleta drops, administra fome e progride no mundo.

## Escopo Incluido

- Auditoria inicial da engine e dos modulos de gameplay antes da execucao
- Camera vertical completa, raycast consistente e outline de bloco no lugar do bloco fantasma
- Worldgen melhorado com biomas, vegetacao mais rica e relevo mais natural
- Inventario/hotbar/crafting mais maduros, com correcoes visuais e funcionais
- Barra de fome e regras basicas de consumo/recuperacao
- Mobs passivos e hostis com vida, dano, morte e drop
- Sistema de drops coletaveis integrado ao inventario
- Polimento visual de mao vazia, item na mao, blocos da UI e coerencia geral

## Escopo Excluido

- Multiplayer
- Copia literal de assets, nomes, UI ou codigo proprietario do Minecraft
- Sistema profundo de armaduras, fornalha completa, bosses ou dimensoes extras
- Economia de vilas, aldeoes complexos ou quest system

## Requisitos Funcionais

### RF-01: Auditoria orientada a gameplay

**Descricao:** antes de qualquer execucao, o time deve mapear os modulos que controlam renderizacao, worldgen, inventario, camera, HUD, combate, entidades, drops e selecao de bloco.

**Regras de negocio:**
- O plano tecnico nao pode assumir comportamento sem inspecionar os modulos reais.
- Bugs provaveis de inventario, raycast e mobs devem ser registrados antes da implementacao.

**Entrada:** codigo atual do runtime do jogo.

**Saida esperada:** mapa tecnico suficiente para executar a PRD com baixo risco de regressao.

### RF-02: Camera completa e raycast confiavel

**Descricao:** o jogador deve conseguir olhar praticamente a 90 graus para cima e para baixo, sem bug de inversao ou raycast desalinhado.

**Regras de negocio:**
- O clamp de pitch deve ser consistente e previsivel.
- O yaw horizontal deve continuar funcionando normalmente.
- A direcao do raycast deve acompanhar a camera real.

**Entrada:** movimento do mouse e runtime ativo.

**Saida esperada:** o jogador mira ceu, chao, blocos e mobs com controle confiavel.

### RF-03: Selecionar bloco com outline limpo

**Descricao:** ao mirar num bloco, o jogo deve mostrar apenas um contorno discreto no bloco atual, removendo o cubo fantasma preenchido/transparente.

**Regras de negocio:**
- O outline aparece apenas quando existe alvo valido.
- Colocar bloco continua respeitando a face retornada pelo raycast.
- Mirar no ar remove completamente o destaque.

**Entrada:** raycast do centro da camera.

**Saida esperada:** selecao visual limpa, precisa e parecida com sandbox voxel classico.

### RF-04: Worldgen com biomas e vegetacao criveis

**Descricao:** o mundo deve apresentar biomas perceptiveis, relevo menos artificial e densidade de arvores coerente com cada regiao.

**Regras de negocio:**
- Planicies, floresta, deserto e montanhas/colinas devem ter identidade visual clara.
- Arvores nao podem flutuar nem nascer em terreno absurdo.
- O relevo nao pode parecer plano demais nem serrilhado demais.

**Entrada:** seed e geracao procedural de chunks.

**Saida esperada:** exploracao com leitura visual de mundo vivo.

### RF-05: Inventario, hotbar e crafting maduros

**Descricao:** inventario, hotbar e crafting devem ficar funcionais e legiveis, com itens alinhados, stacks claros e area de crafting usavel.

**Regras de negocio:**
- Nenhum craft pode duplicar item ou consumir recurso errado.
- A hotbar deve destacar corretamente o slot ativo.
- Itens e blocos devem aparecer corretamente na UI.

**Entrada:** abrir inventario, mover pilhas, selecionar slot e executar receitas.

**Saida esperada:** loop de recursos jogavel sem bugs visuais ou mecanicos evidentes.

### RF-06: Barra de fome e regras survival

**Descricao:** o jogo deve ganhar barra de fome com drenagem gradual e recuperacao por comida simples.

**Regras de negocio:**
- Fome nao pode drenar em ritmo frustrante.
- Comer deve recuperar fome.
- Chegar a zero deve gerar penalidade simples e clara.

**Entrada:** tempo de jogo, movimento, salto, combate e uso de comida.

**Saida esperada:** camada survival compreensivel e integrada a HUD.

### RF-07: Mobs com combate, morte e drops

**Descricao:** mobs devem ter forma voxel coerente, vida, dano, morte e comportamento adequado ao tipo passivo ou hostil.

**Regras de negocio:**
- O jogador pode atacar com clique esquerdo e alcance limitado.
- Mobs hostis podem perseguir e causar dano.
- Ao morrer, o mob deve soltar drop e sair corretamente do mundo.

**Entrada:** encontro entre jogador e mob em gameplay.

**Saida esperada:** combate simples, mas fechado do ponto de vista funcional.

### RF-08: Drops coletaveis integrados ao inventario

**Descricao:** itens gerados por morte de mobs devem aparecer no chao, ser coletados e entrar no inventario respeitando stack e limite.

**Regras de negocio:**
- O drop nao pode duplicar por bug.
- Inventario cheio precisa respeitar regra clara de permanencia do item no mundo.
- Coleta nao pode quebrar o runtime nem o save.

**Entrada:** morte de mob e aproximacao do jogador ao drop.

**Saida esperada:** loop completo de recompensa e coleta.

### RF-09: Polimento visual de mao, itens e texturas

**Descricao:** o jogo deve exibir mao vazia quando nao ha item equipado, melhorar o bloco na mao e corrigir a leitura de itens/blocos na UI.

**Regras de negocio:**
- Slot vazio mostra mao vazia com animacao sutil.
- Slot com item mostra representacao coerente do item/bloco.
- Texturas e icones nao podem parecer bugados, cortados ou invertidos sem controle.

**Entrada:** troca de slot, inventario aberto e renderizacao do held item.

**Saida esperada:** sensacao de acabamento visual mais profissional.

## Requisitos Nao Funcionais

- **UX/UI:** a interface deve lembrar um survival voxel classico sem copiar layout proprietario; clareza e consistencia visual tem prioridade
- **Performance:** a PRD nao pode sacrificar chunk streaming, frame pacing e custo de render por frame
- **Compatibilidade:** alvo principal continua sendo desktop com navegadores modernos e WebGL 2
- **Seguranca:** manter ownership e contratos de persistencia existentes
- **Persistencia:** novos estados de fome, drops persistiveis quando aplicavel, vida de mobs e inventario nao podem corromper saves
- **Arquitetura:** reaproveitar `GameApp`, modulos puros de inventario/interacao, runtime de chunks e pipelines atuais em vez de criar sistemas paralelos

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| `player.rotation.pitch` | olhar 100% para cima/baixo sem desalinhamento | Sim |
| alvo atual do raycast | highlight/outline e colocacao correta | Nao |
| estado de fome | regra survival e HUD | Sim |
| HP/estado do mob | combate e morte | Nao |
| drop coletavel | recompensa e pickup | Sim, se sobreviver a reload de sessao |
| slots + crafting state | loop de progressao e receitas | Sim |

## Dependencias e Premissas

- PRD-013 continua sendo a base de polimento de camera, mao e worldgen.
- PRD-014 continua sendo a base de blocos, modos, estruturas e crafting inicial.
- O executor de subagentes nao estava disponivel nesta rodada, embora o arquivo `.codex/agents/tony-stark.toml` exista localmente; a analise tipo Tony Stark foi feita manualmente sobre o repositorio.
- O renderer WebGL/worker introduzido nas PRDs recentes permanece a base tecnica preferencial.

## Riscos e Perguntas em Aberto

- Fome, combate, drops e inventario no mesmo ciclo aumentam o risco de regressao de save e HUD.
- Outline de bloco e raycast podem exigir ajuste fino no renderer e no fluxo de interacao, nao apenas na UI.
- Mobs hostis simples precisam ser bons o suficiente para parecer deliberados, nao placeholders agressivos.
- Pergunta para validacao: a primeira versao de comida deve nascer apenas de drops ou tambem de recursos do mundo vegetal?

## Criterios de Aceite

- [x] **CA-01:** Existe uma auditoria inicial documentada dos modulos de renderizacao, worldgen, inventario, hotbar, crafting, player, camera, mobs, HUD, combate e drops.
- [x] **CA-02:** O jogador consegue olhar diretamente para o ceu e para os proprios pes/chao, sem inversao quebrada nem raycast desalinhado.
- [x] **CA-03:** O destaque de bloco passa a ser apenas um outline fino no bloco mirado e o cubo fantasma deixa de existir.
- [x] **CA-04:** O mundo apresenta pelo menos planicie, floresta, deserto e montanhas/colinas com leitura visual distinta.
- [x] **CA-05:** A densidade de arvores passa a respeitar o bioma e a floresta parece floresta.
- [x] **CA-06:** Hotbar e inventario exibem itens/blocos corretamente, com slot ativo claro e stacks legiveis.
- [x] **CA-07:** O jogador consegue executar crafts uteis sem duplicacao ou consumo incorreto de recurso.
- [x] **CA-08:** A HUD passa a exibir fome e a fome muda durante a sessao de jogo.
- [x] **CA-09:** Slot vazio mostra mao vazia; slot com item mostra item/bloco coerente na mao.
- [x] **CA-10:** Existe ao menos um mob passivo e um hostil com HP, dano, morte e remocao corretos.
- [x] **CA-11:** Matar um mob gera drop coletavel que entra corretamente no inventario.
- [x] **CA-12:** O combate do jogador respeita alcance curto, cooldown simples e dano diferente para mao vazia vs arma/ferramenta, quando houver.
- [x] **CA-13:** A sessao continua performando bem, sem regressao evidente de streaming, render ou loops por frame.
- [x] **CA-14:** `npm test`, `npm run test:harness` e validacoes sintaticas aplicaveis passam na entrega executada.

## Historico de Requisitos

| Requisito / Decisao | Estado | Substitui | Substituido por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Outline fino no bloco mirado | Proposto | preview/cubo fantasma de colocacao atualmente percebido como errado | - | Corrigir leitura de interacao principal do jogo |
| Fome como camada survival explicita | Proposto | HUD de vida sem loop survival completo | - | Fechar progressao basica e pressao de recursos |
| Combate, morte e drop de mobs | Proposto | ecossistema de mobs ainda incompleto das PRDs 013/014 | - | Tornar mobs parte real do gameplay |
| Inventario/crafting como fluxo maduro | Proposto | inventario e crafting base ainda insuficientes | - | Elevar usabilidade e progressao |

## Backlog Futuro Relacionado

- Ferramentas com durabilidade e tiers completos
- Fornalha, fundicao e progressao mineral mais profunda
- Ciclo de dia/noite, spawn rules avancadas e dano ambiental

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](./PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| Tasks | [tasks/](./tasks/) |
| Validacao final | [PRD-015-validacao.md](../../execucoes/PRD-015-validacao.md) |


