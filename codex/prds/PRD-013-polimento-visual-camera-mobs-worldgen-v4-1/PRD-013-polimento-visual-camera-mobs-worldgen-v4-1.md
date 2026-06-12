# PRD-013: Polimento visual, camera livre e worldgen 4.1

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-013 |
| **Harness Version** | 2 |
| **Titulo** | Polimento visual, camera livre e worldgen 4.1 |
| **Tipo** | Melhoria de gameplay e apresentacao |
| **Prioridade** | Alta |
| **Status** | Concluida |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-010, PRD-011 e PRD-012 |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** transformar o sandbox atual em uma experiencia mais legivel, agradavel e reconhecivel durante a exploracao minuto a minuto.
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
- **Observacao:** a camada de jogo 3D pode permanecer em JS Vanilla mesmo quando o shell web seguir esse padrao

## Problema / Oportunidade

O MineWorld ja ganhou renderer WebGL, pipeline assincrono e um primeiro loop sandbox mais robusto, mas ainda existem pontos muito visiveis que afastam a sensacao de um sandbox voxel polido. A camera vertical para antes do extremo, o item em primeira pessoa e os icones da UI ainda parecem placeholders, nao existe fallback de mao vazia quando nenhum bloco esta selecionado, o mob base tem visual e animacao pouco convincentes, e o worldgen atual carece de mais variedade memoravel.

### Impacto Atual

- **Quem e afetado:** todo jogador durante a gameplay.
- **Frequencia:** continua, desde os primeiros minutos no mundo.
- **Consequencia:** reduz imersao, fragiliza a leitura visual e faz o jogo parecer menos maduro do que a base tecnica ja permite.

## Objetivo da Funcionalidade

Entregar uma rodada de polimento concentrada na percepcao direta do jogador. A meta nao e adicionar progressao nova, e sim melhorar o que ele ja ve e sente o tempo todo: para onde a camera aponta, como os itens aparecem na mao e na HUD, como o primeiro mob se comporta visualmente e como o mundo se diferencia em relevo e vegetacao.

Essa PRD deve aproximar a leitura e o conforto de uso de um sandbox voxel mais maduro, sem copiar identidade protegida, assets ou interface do Minecraft. O jogo precisa manter linguagem propria, mas abandonar claramente a aparencia de prototipo em camera, held item, mob e worldgen.

### Resultado Esperado para o Usuario

- Olhar totalmente para cima e para baixo sem sensacao de truncamento.
- Reconhecer melhor o item equipado e os blocos da hotbar/inventario.
- Ver uma mao vazia clara quando nenhum bloco estiver ativo.
- Encontrar um mundo mais variado, com biomas, arvores e montanhas mais marcantes.

## Fluxo Atual

1. O jogador entra em um mundo `v4.0`, explora e percebe biomas conhecidos, mas ainda com repeticao visual consideravel.
2. Ao mover a camera para cima ou para baixo, o pitch para antes do extremo e a leitura do alinhamento vertical fica limitada.
3. Ao equipar blocos, o held item e os icones de inventario/hotbar ainda parecem simples demais; quando nao ha item, a ausencia de uma mao vazia deixa a leitura incompleta.
4. O primeiro mob atual cumpre a funcao sistemica, mas ainda transmite visual e animacao pobres.

## Fluxo Desejado

1. O jogador entra em novos mundos `v4.1` e encontra variedade mais clara de biomas, arvores e montanhas.
2. Move a camera ate os extremos verticais sem quebrar raycast, crosshair ou interacao.
3. Ve itens equipados e icones da UI com melhor volume, textura e leitura; quando nao ha item, aparece uma mao vazia consistente com a direcao visual do jogo.
4. Encontra um mob base com silhueta melhor resolvida e animacao menos rigida.

## Escopo Incluido

- Liberar pitch vertical ate os extremos operacionais do runtime, ajustando camera, renderer e persistencia relacionada.
- Refinar held item, icones da hotbar e do inventario com melhor leitura volumetrica e textura aparente.
- Exibir fallback de mao vazia em primeira pessoa quando nao houver bloco selecionado.
- Retrabalhar o mob base atual com foco em silhueta, proporcao e animacao de idle/deslocamento.
- Evoluir o worldgen para `v4.1` em mundos novos, adicionando novos perfis de bioma, mais variedade de arvores e relevo montanhoso mais expressivo.
- Validar compatibilidade com saves existentes e estabilidade visual/perceptiva do loop principal.

## Escopo Excluido

- Crafting, combate, ferramentas, fome e progressao completa.
- Novos sistemas de IA, novos mobs alem do retrabalho do mob base atual ou multiplayer.
- Reescrita total de renderer, inventario ou persistencia.
- Copia literal de assets, HUD ou identidade protegida do Minecraft.

## Requisitos Funcionais

### RF-01: Camera vertical completa

**Descricao:** permitir que o jogador olhe ate o limite superior e inferior esperado para uma camera em primeira pessoa, sem o truncamento angular atual.

**Regras de negocio:**
- O ajuste deve abranger a mesma faixa efetiva em `PlayerController`, helpers de camera, renderer e raycast.
- A nova faixa nao pode quebrar crosshair, selecao de blocos, picking de entidades ou persistencia do pitch salvo.

**Entrada:** movimento vertical do mouse durante a gameplay.

**Saida esperada:** camera alinhada aos extremos verticais de forma estavel, com interacao preservada.

### RF-02: Held item, hotbar e mao vazia legiveis

**Descricao:** melhorar a aparencia do item equipado e dos icones da UI, alem de mostrar uma mao vazia quando nenhum bloco estiver selecionado.

**Regras de negocio:**
- Held item, hotbar e inventario devem compartilhar uma linguagem visual consistente, sem divergencias gritantes de volume ou textura.
- Quando o slot ativo estiver vazio, a mao vazia deve aparecer apenas em primeira pessoa e sumir novamente ao equipar um item.

**Entrada:** troca de slot, abertura de inventario e estado sem item selecionado.

**Saida esperada:** leitura imediata do item ativo ou da mao vazia, com melhor acabamento visual.

### RF-03: Mob base com melhor silhueta e animacao

**Descricao:** retrabalhar o mob base atual para que sua presenca em cena pareca intencional e minimamente convincente.

**Regras de negocio:**
- O retrabalho deve preservar o comportamento jogavel atual do mob, incluindo spawn, picking e alternancia de follow.
- A animacao deve ter ao menos estados perceptiveis de idle e deslocamento, sem deformacoes grotescas ou flicker evidente.

**Entrada:** spawn do mob, deslocamento e interacao existente.

**Saida esperada:** mob visualmente mais limpo, legivel e agradavel.

### RF-04: Worldgen 4.1 mais rico

**Descricao:** enriquecer a geracao de mundos novos com mais variedade de biomas, arvores e montanhas.

**Regras de negocio:**
- A mudanca deve valer para mundos novos em `algorithm_version = v4.1`; mundos existentes permanecem com sua versao anterior.
- O relevo novo nao pode reintroduzir crateras artificiais, platos quebrados ou spawn frequente em areas inviaveis.
- A distribuicao de vegetacao deve respeitar o perfil do bioma e evitar repeticao excessiva perto do spawn.

**Entrada:** criacao de um novo mundo e geracao procedural por seed.

**Saida esperada:** mundos novos mais diversos e reconheciveis, sem regressao de estabilidade.

## Requisitos Nao Funcionais

- **UX/UI:** held item, mao vazia e icones devem parecer parte do mesmo jogo; o polimento visual deve melhorar clareza antes de buscar excesso de detalhe.
- **Performance:** camera extrema, novo held item, animacoes do mob e worldgen `v4.1` nao podem piorar de forma perceptivel o frame pacing obtido pela PRD-012.
- **Compatibilidade:** navegadores desktop modernos com WebGL 2 continuam sendo o alvo principal.
- **Seguranca:** sem mudancas de auth; preservar ownership e contratos atuais dos saves.
- **Persistencia:** pitch salvo continua valido; mundos existentes nao mudam de `algorithm_version`; mundos novos passam a nascer em `v4.1` se a PRD for aprovada e executada.
- **Arquitetura:** evoluir modulos atuais de camera, UI, entidades e worldgen, evitando nova camada paralela sem necessidade.

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Pitch do player | Preservar orientacao vertical apos save/reload | Sim |
| `algorithm_version` do mundo | Manter compatibilidade entre mundos existentes e mundos novos | Sim |
| Catalogo visual de item/mao vazia | Melhorar leitura em runtime | Nao |
| Parametros de bioma e vegetacao | Determinar o perfil procedural de mundos novos | Sim |

## Dependencias e Premissas

- PRD-010 continua sendo a base de held item sem mao visivel para slots ocupados.
- PRD-011 continua sendo a base de HUD central e `algorithm_version = v4.0` vigente ate a execucao desta PRD.
- PRD-012 continua sendo a base de renderer WebGL, pipeline assincrono e inventario por pilhas.
- O spawn do subagente local `tony-stark` falhou por limite de threads na infraestrutura desta rodada; a concepcao foi concluida por analise local do repositorio.
- A referencia de conforto e legibilidade pode se aproximar do Minecraft, mas a identidade visual precisa permanecer propria.

## Riscos e Perguntas em Aberto

- Liberar pitch vertical completo pode expor bugs escondidos em raycast, picking e shader de camera.
- Um retrabalho visual agressivo do mob pode aumentar custo de render ou destoar do resto do catalogo atual.
- Evoluir worldgen para `v4.1` sem seeds de smoke suficientes pode trocar repeticao por artefatos piores.
- Pergunta para validacao: a mao vazia deve surgir apenas quando o slot ativo estiver vazio ou tambem quando o inventario estiver temporariamente sem foco de hotbar?

## Criterios de Aceite

- [ ] **CA-01:** O jogador consegue olhar para cima e para baixo ate o extremo visual esperado, sem zona morta angular perceptivel.
- [ ] **CA-02:** Crosshair, raycast, quebra, colocacao e picking de entidade continuam funcionais mesmo proximo aos extremos verticais.
- [ ] **CA-03:** Quando o slot ativo esta vazio, a gameplay exibe uma mao vazia consistente; quando ha item, exibe o held item refinado sem sobreposicao quebrada.
- [ ] **CA-04:** Hotbar e inventario exibem icones mais legiveis e coerentes com o mundo para pelo menos os blocos basicos mais usados.
- [ ] **CA-05:** O mob base apresenta silhueta melhor resolvida e animacao perceptivel de idle e deslocamento sem flicker evidente.
- [ ] **CA-06:** Spawn, follow toggle e picking do mob continuam funcionando apos o retrabalho visual.
- [ ] **CA-07:** Mundos novos em `v4.1` apresentam pelo menos dois perfis de bioma adicionais ou claramente reequilibrados, com mais variedade de arvores e montanhas mais marcantes.
- [ ] **CA-08:** Em smoke com multiplas seeds, o entorno inicial de mundos `v4.1` nao apresenta frequencia alta de buracos, overhangs artificiais ou spawn inviavel.
- [ ] **CA-09:** Mundos antigos continuam carregando e salvando com seu `algorithm_version` original, sem migracao forcada.
- [ ] **CA-10:** `npm test`, `npm run test:harness` e validacoes sintaticas aplicaveis passam.

## Historico de Requisitos

| Requisito / Decisao | Estado | Substitui | Substituido por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Pitch vertical completo como meta de camera | Proposto | Faixa parcial herdada das PRDs 004 e 012 | - | Remover o truncamento visivel da leitura vertical. |
| Mao vazia quando slot ativo estiver vazio | Proposto | Ausencia de fallback visual no held item da PRD-010 | - | Completar a leitura de primeira pessoa. |
| Mundos novos com `algorithm_version = v4.1` | Proposto | `v4.0` como default de mundos novos | - | Evoluir variedade e relevo sem quebrar mundos existentes. |

## Backlog Futuro Relacionado

- Novos mobs e ecossistemas por bioma.
- Clima, dia/noite e iluminacao mais rica.
- Cavernas, falhas geologicas e landmarks exclusivos por seed.

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](./PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| Tasks | [tasks/](./tasks/) |
| Validacao final | [PRD-013-validacao.md](../../execucoes/PRD-013-validacao.md) |
