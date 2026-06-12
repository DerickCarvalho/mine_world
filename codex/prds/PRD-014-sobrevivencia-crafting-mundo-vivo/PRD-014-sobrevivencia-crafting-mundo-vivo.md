# PRD-014: Sobrevivencia, crafting e mundo vivo

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-014 |
| **Harness Version** | 2 |
| **Titulo** | Sobrevivencia, crafting e mundo vivo |
| **Tipo** | Expansao de produto e gameplay |
| **Prioridade** | Alta |
| **Status** | Concluida |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-012 e PRD-013 |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** sair do primeiro sandbox funcional e entrar numa camada de progressao, variedade e identidade que sustente sessoes mais longas.
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

O MineWorld ja oferece um loop de explorar, minerar blocos basicos e construir, mas ainda nao sustenta a fantasia completa de sobrevivencia sandbox. Faltam recursos de progressao como minerios, mais blocos, crafting e modos de jogo, alem de conteudo de mundo como mais mobs, estruturas e vilas. Ao mesmo tempo, a leitura visual do inventario, da mao vazia e das texturas ainda precisa amadurecer para que essa expansao nao nasca em cima de apresentacao fraca.

### Impacto Atual

- **Quem e afetado:** todo jogador que permanece mais do que alguns minutos no mundo.
- **Frequencia:** continua, desde o momento em que o jogador esgota os blocos iniciais.
- **Consequencia:** o jogo perde profundidade, reduz senso de progressao e ainda parece uma demo tecnica em partes importantes da interface.

## Objetivo da Funcionalidade

Entregar a primeira camada robusta de sobrevivencia e criatividade do MineWorld. O jogador deve conseguir coletar mais tipos de bloco e minerio, alternar entre modos criativo e sobrevivencia, usar um inventario mais proximo da referencia desejada, consultar e executar crafts, encontrar mais vida e estruturas no mundo e perceber uma melhora clara na apresentacao de itens e texturas.

Esta PRD deve aproximar o MineWorld da expectativa de um sandbox voxel mais completo sem abandonar a identidade propria do projeto. O objetivo nao e clonar sistemas inteiros do Minecraft, e sim oferecer um conjunto coerente de progressao, crafting, exploracao e polimento que torne o jogo muito mais rico e jogavel.

### Resultado Esperado para o Usuario

- Ter objetivos naturais de coleta e progressao ao encontrar minerios, blocos e receitas.
- Alternar entre criatividade livre e sobrevivencia com regras claras.
- Usar um inventario e uma lista de crafts mais legiveis, funcionais e agradaveis.
- Explorar mundos mais vivos, com mais mobs, mais blocos e estruturas geradas.

## Fluxo Atual

1. O jogador explora um mundo procedural, coleta blocos basicos e organiza pilhas no inventario atual.
2. Nao existe sistema completo de crafting, lista de receitas ou diferenca forte entre criativo e sobrevivencia.
3. O mundo ainda possui conteudo limitado de blocos, minerios, mobs e estruturas.
4. Parte da apresentacao de itens, mao vazia e textura aplicada ainda parece inacabada ou com orientacao incorreta.

## Fluxo Desejado

1. O jogador entra no mundo e escolhe ou alterna um modo de gameplay com regras coerentes de sobrevivencia ou criativo.
2. Encontra blocos e minerios novos, coleta recursos e consulta uma lista de crafts no proprio fluxo de inventario.
3. Produz itens e blocos derivados usando receitas claras e consistentes.
4. Explora um mundo com mais variedade de mobs, estruturas e vilas, reforcando descoberta e recompensa.
5. Ve inventario, held item, mao vazia e texturas com apresentacao mais limpa e sem orientacao quebrada.

## Escopo Incluido

- Expandir o catalogo de blocos e introduzir minerios e derivados basicos de progressao.
- Adicionar modos sobrevivencia e criativo com regras de inventario e coleta distintas.
- Evoluir o inventario para uma leitura mais proxima da referencia desejada e incluir crafting dentro dele.
- Exibir lista de crafts acessivel e compreensivel.
- Introduzir mais mobs e pelo menos uma primeira camada de estruturas/vilas geradas no mundo.
- Corrigir ou tornar configuravel a orientacao de texturas laterais no fluxo de CRUD de texturas.
- Melhorar apresentacao de itens no inventario/hotbar e adicionar balanco da mao vazia quando nenhum item estiver equipado.
- Preservar o player com `1.95` blocos de altura e corpo mais fino que um bloco.

## Escopo Excluido

- Multiplayer.
- Sistema completo de combate, armaduras, bosses ou Nether-like.
- IA social profunda de aldeoes ou economia de vilas.
- Copia literal da interface, assets ou receitas protegidas do Minecraft.

## Requisitos Funcionais

### RF-01: Catalogo ampliado de blocos e minerios

**Descricao:** o jogo deve passar a oferecer mais diversidade de blocos e ao menos uma primeira linha de minerios exploraveis e seus derivados.

**Regras de negocio:**
- Minerios devem aparecer de forma procedural coerente com profundidade, relevo ou bioma.
- Novos blocos e recursos precisam ser reconhecidos por inventario, HUD, save e renderizacao.

**Entrada:** geracao de mundo, quebra de bloco e coleta de item.

**Saida esperada:** o jogador encontra e acumula recursos mais variados do que na base atual.

### RF-02: Modos sobrevivencia e criativo

**Descricao:** o runtime deve oferecer pelo menos dois modos de jogo com regras diferentes.

**Regras de negocio:**
- Sobrevivencia consome recursos ao construir e depende de coleta.
- Criativo permite acesso livre ao catalogo jogavel relevante e nao bloqueia construcao por falta de item.
- O modo atual do mundo ou do jogador precisa ficar claro durante a gameplay.

**Entrada:** criacao/configuracao do mundo ou alteracao de modo permitida pela experiencia.

**Saida esperada:** o jogador percebe imediatamente o conjunto de regras do modo ativo.

### RF-03: Inventario com crafting e lista de receitas

**Descricao:** o inventario deve evoluir para incluir area de crafting e uma lista de crafts consultavel.

**Regras de negocio:**
- O crafting deve consumir insumos validos e nunca duplicar ou perder itens fora das regras.
- A lista de crafts deve mostrar insumos e resultado de maneira legivel.
- O inventario precisa continuar funcional com pilhas, hotbar e cursor stack.

**Entrada:** abrir inventario, selecionar recursos e executar craft.

**Saida esperada:** o jogador consegue transformar recursos em novos itens/blocos dentro do fluxo do inventario.

### RF-04: Mundo vivo com mobs e estruturas

**Descricao:** o mundo deve ganhar mais vida por meio de mobs adicionais e estruturas geradas, incluindo uma primeira camada de vilas.

**Regras de negocio:**
- Estruturas e vilas devem nascer de forma deterministica por seed e respeitar areas plausiveis de terreno.
- Mobs novos precisam obedecer limites de spawn e nao comprometer o runtime.
- O mob atual deve continuar funcionando apos a expansao.

**Entrada:** criacao de mundo, exploracao e streaming de chunks.

**Saida esperada:** o jogador encontra mais surpresa, variedade e senso de descoberta.

### RF-05: Polimento visual de mao, itens e texturas

**Descricao:** melhorar a leitura visual do inventario/hotbar e corrigir a aplicacao de texturas para que a orientacao fique correta ou configuravel.

**Regras de negocio:**
- Quando nenhum item estiver equipado, a mao vazia deve aparecer com balanco coerente.
- Texturas anexadas precisam respeitar orientacao correta nas faces ou permitir ajuste de direcao no menu de texturas.
- O inventario deve exibir blocos bonitos e reconheciveis, sem aspecto quebrado ou bugado.

**Entrada:** equipar/soltar item, abrir inventario, anexar textura e renderizar bloco no mundo/UI.

**Saida esperada:** melhora clara de acabamento visual sem regressao funcional.

## Requisitos Nao Funcionais

- **UX/UI:** o inventario deve ficar mais robusto, mas ainda claro e rapido de usar; a lista de crafts nao pode poluir a tela.
- **Performance:** novos mobs, estruturas e blocos nao podem destruir o frame pacing e o streaming obtidos na PRD-012.
- **Compatibilidade:** navegadores desktop modernos com WebGL 2 continuam sendo o alvo principal.
- **Seguranca:** sem mudancas de auth; saves e ownership dos mundos devem permanecer consistentes.
- **Persistencia:** inventario, modo de jogo, receitas aplicadas, novos blocos e mutacoes do mundo devem continuar salvando corretamente.
- **Arquitetura:** evoluir os sistemas atuais de bloco, inventario, worldgen, entidades e texturas sem criar duplicacoes desnecessarias de estado.

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| `game_mode` do mundo/jogador | Regras ativas de sobrevivencia ou criativo | Sim |
| Slots e cursor do inventario | Estado de recursos e crafting | Sim |
| Catalogo de receitas | Resolver crafts disponiveis | Sim |
| Novos blocos/minerios | Progressao e renderizacao | Sim |
| Estruturas/vilas geradas | Conteudo persistente do mundo | Sim |
| Configuracao de rotacao de textura | Corrigir orientacao visual por face, se adotada | Sim |

## Dependencias e Premissas

- PRD-012 continua sendo a base de renderer, worker, inventario por pilhas e runtime principal.
- PRD-013 permanece como base de polimento de camera, held item, mao vazia e worldgen visual, ainda que parte do acabamento visual desta PRD possa absorver itens pendentes dela durante a execucao.
- O player com `1.95` blocos de altura e raio fino ja faz parte do contrato atual e deve ser preservado.
- O spawn do subagente local `tony-stark` falhou por limite de threads na infraestrutura desta rodada; a concepcao foi concluida por analise local do repositorio.

## Riscos e Perguntas em Aberto

- Crafting, modos de jogo, estruturas e mobs no mesmo ciclo ampliam bastante o risco de regressao em save e worldgen.
- Estruturas geradas em terreno procedural irregular podem nascer quebradas sem regras de assentamento boas o bastante.
- Um inventario mais proximo da referencia desejada pode crescer demais e conflitar com a simplicidade atual.
- Pergunta para validacao: a lista de crafts deve mostrar tudo o que existe ou priorizar apenas crafts descobertos/possiveis no momento?

## Criterios de Aceite

- [ ] **CA-01:** O jogo passa a oferecer novos blocos e pelo menos uma primeira linha de minerios distribuidos proceduralmente e coletaveis em gameplay.
- [ ] **CA-02:** Inventario, hotbar, save e renderizacao reconhecem corretamente os novos blocos e recursos.
- [ ] **CA-03:** O jogador consegue usar modo sobrevivencia com consumo de recursos e modo criativo com acesso livre ao catalogo previsto.
- [ ] **CA-04:** O modo ativo fica claro na interface e nao causa inconsistencias ao salvar e reabrir o mundo.
- [ ] **CA-05:** O inventario inclui area de crafting funcional e a execucao de um craft consome insumos corretamente.
- [ ] **CA-06:** Existe uma lista de crafts legivel que mostra ao menos insumos e resultado.
- [ ] **CA-07:** O mundo gera ao menos uma primeira camada de estruturas ou vilas em areas plausiveis e sem frequencia alta de spawn quebrado.
- [ ] **CA-08:** O ecossistema inclui mais mobs do que o estado atual, sem travar o runtime nem quebrar o gato existente.
- [ ] **CA-09:** Quando o slot ativo esta vazio, a mao vazia balanca de forma coerente durante o movimento.
- [ ] **CA-10:** Itens na hotbar e no inventario ficam visualmente mais bonitos e legiveis do que a iteracao atual.
- [ ] **CA-11:** Texturas anexadas passam a respeitar a orientacao correta nas faces ou o menu de texturas permite ajustar a direcao por face.
- [ ] **CA-12:** O player permanece com `1.95` blocos de altura e corpo mais fino que um bloco, sem regressao de colisao.
- [ ] **CA-13:** `npm test`, `npm run test:harness` e as validacoes sintaticas aplicaveis passam.

## Historico de Requisitos

| Requisito / Decisao | Estado | Substitui | Substituido por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Inventario com crafting e lista de receitas | Proposto | Inventario simples sem crafting da PRD-005 e pilhas sem crafting da PRD-012 | - | Introduzir progressao e criacao de itens. |
| Modos sobrevivencia e criativo como contratos explicitos | Proposto | Loop sandbox unico atual | - | Dar identidade clara de uso e teste ao runtime. |
| Estruturas/vilas e mais mobs como camada de mundo vivo | Proposto | Mundo procedural com fauna minima e sem estruturas | - | Aumentar descoberta e retencao. |
| Correcao ou configuracao de orientacao de textura | Proposto | Aplicacao atual sujeita a orientacao lateral incorreta | - | Fechar o fluxo de texturas como ferramenta confiavel. |

## Backlog Futuro Relacionado

- Ferramentas, durabilidade, fornalha e progressao de equipamentos.
- Aldeoes com interacao, trocas e rotinas simples.
- Combate mais rico, fome, dano ambiental e ciclo de dia/noite.

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](./PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| Tasks | [tasks/](./tasks/) |
| Validacao final | [PRD-014-validacao.md](../../execucoes/PRD-014-validacao.md) |
