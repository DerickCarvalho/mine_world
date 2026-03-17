# PRD-003: Mundo 3D procedural jogavel

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-003 |
| **Titulo** | Mundo 3D procedural jogavel |
| **Tipo** | Nova funcionalidade |
| **Prioridade** | Alta |
| **Status** | Em validacao |
| **Data** | 17/03/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-001, PRD-002 |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** entregar a primeira experiencia jogavel em 3D dentro de um mundo procedural
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no cliente, com suporte a backend apenas para catalogo e persistencia quando necessario
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural aplicado:** a cena de jogo deve entrar pelo shell autenticado `index.php?page=...`, consumindo API no padrao `api/{dominio}/{acao}.php`, sem abandonar a implementacao da camada 3D em JS Vanilla

---

## Problema / Oportunidade

MineWorld precisa sair do estado de menu e se tornar um jogo navegavel. O primeiro grande marco de produto e permitir que o jogador entre em um mundo procedural 3D, enxergue blocos em escala coerente e se movimente com controles classicos de sandbox em primeira pessoa.

### Impacto Atual

- **Quem e afetado:** jogador e produto
- **Frequencia:** sempre que tentar jogar
- **Consequencia:** sem essa entrega, o produto nao tem loop jogavel inicial

---

## Objetivo da Funcionalidade

Permitir que um mundo criado no lobby seja aberto em uma cena 3D jogavel, com geracao procedural deterministica, camera em primeira pessoa, cursor na tela e movimentacao basica com teclado e mouse.

O foco desta fase e funcionalidade base. O mundo precisa existir, ser exploravel e respeitar a escala de blocos definida, mas ainda sem mecanicas de quebrar ou colocar blocos.

### Resultado Esperado para o Usuario

- Entrar em um mundo e enxergar um terreno 3D gerado proceduralmente
- Andar, olhar ao redor e pular usando controles basicos
- Entender que o mundo tem escala de blocos consistente e potencial de expansao

---

## Fluxo Atual

1. O usuario pode chegar ate o menu, mas nao ha mundo 3D para entrar.
2. Nao existe terreno procedural jogavel.
3. Nao existe controle de camera em primeira pessoa.

## Fluxo Desejado

1. O usuario seleciona um mundo na lista.
2. O sistema navega para `index.php?page=jogo&id_mundo={id}`.
3. A tela `jogo` recupera os metadados necessarios do mundo usando a camada padrao de API.
4. O terreno procedural e gerado de forma deterministica a partir da seed do mundo.
5. O jogador spawna em ponto valido e controla a camera com mouse e o corpo com `WASD` e `espaco`.
6. O mundo carrega ao redor do jogador de forma suficiente para exploracao inicial.

---

## Escopo Incluido

- Cena 3D jogavel no navegador
- Geracao procedural deterministica por seed
- Mundo com dimensao logica de `5000 x 5000 x 100`
- Escala de `1 bloco = 1m x 1m x 1m`
- Camera em primeira pessoa
- Cursor fixo na tela para referencia de centro
- Movimento com `WASD`, mouse e `espaco`
- Spawn inicial seguro acima do terreno
- Carregamento sob demanda da area proxima ao jogador
- Entrada da cena por rota protegida `index.php?page=jogo&id_mundo={id}`
- Tela PHP dedicada em `pages/` e script correspondente em `assets/js/paginas/`
- Leitura de metadados do mundo via wrapper compartilhado de request antes da inicializacao do runtime 3D

## Escopo Excluido

- Quebrar blocos
- Colocar blocos
- Inventario, itens ou crafting
- Texturas finais de blocos
- Multiplayer, mobs ou combate

---

## Requisitos Funcionais

### RF-01: Geracao procedural do mundo

**Descricao:** o jogo deve gerar o terreno do mundo a partir de uma seed, sempre produzindo o mesmo resultado para a mesma seed.

**Regras de negocio:**
- A seed do mundo deve definir a estrutura base do terreno.
- O mundo deve respeitar o limite logico horizontal de 5000 por 5000 blocos.
- A altura jogavel deve operar entre as camadas 1 e 100.

**Entrada:** seed do mundo selecionado

**Saida esperada:** terreno consistente e repetivel

---

### RF-02: Escala e representacao dos blocos

**Descricao:** os blocos do mundo devem seguir a escala de um cubo de 1 metro em cada eixo.

**Regras de negocio:**
- A navegacao do jogador deve respeitar essa escala.
- A representacao visual inicial pode usar cores ou materiais placeholder.
- A ausencia do sistema de texturas nao pode impedir a leitura do relevo.

**Entrada:** malha ou estrutura dos blocos gerados

**Saida esperada:** mundo visualmente coerente em escala

---

### RF-03: Entrada no mundo a partir do lobby

**Descricao:** ao selecionar um mundo e iniciar a partida, o jogador deve entrar na cena correspondente.

**Regras de negocio:**
- O mundo carregado deve corresponder ao identificador selecionado no lobby.
- O sistema deve recuperar os metadados necessarios para gerar ou abrir o mundo.
- Falhas de carregamento devem ser tratadas sem travar a aplicacao inteira.
- A tela de jogo deve existir como rota protegida no shell autenticado e consumir a API padrao para recuperar o mundo.

**Entrada:** selecao de mundo no lobby

**Saida esperada:** cena de jogo aberta

---

### RF-04: Camera e controles do jogador

**Descricao:** o jogador deve poder olhar em volta e se mover em primeira pessoa.

**Regras de negocio:**
- O mouse controla orientacao da camera.
- `WASD` controla deslocamento no plano.
- `espaco` executa salto.
- O sistema deve exibir um cursor central para referencia.

**Entrada:** teclado e mouse

**Saida esperada:** movimentacao e camera responsivas

---

### RF-05: Colisao e spawn seguro

**Descricao:** o jogador deve nascer em uma posicao valida e nao atravessar o terreno basico.

**Regras de negocio:**
- O spawn nao pode ficar enterrado no bloco.
- O jogador nao deve cair indefinidamente ao iniciar.
- A locomocao basica precisa respeitar colisao minima com solo e obstaculos imediatos.

**Entrada:** mundo gerado e regras basicas de fisica

**Saida esperada:** inicio jogavel e exploracao controlada

---

## Requisitos Nao Funcionais

- **UX/UI:** experiencia inicial legivel, com entrada simples no mundo e sem excesso de informacao na tela
- **Performance:** a aplicacao nao pode tentar materializar ou renderizar os `5000 x 5000 x 100` blocos de uma vez; o carregamento deve ocorrer sob demanda
- **Compatibilidade:** foco inicial em navegadores desktop modernos com teclado e mouse
- **Seguranca:** validacao do acesso ao mundo conforme o usuario autenticado quando houver consulta a backend
- **Persistencia:** a seed e os metadados do mundo precisam ser suficientes para reabrir o mesmo mundo depois
- **Arquitetura:** o shell web e a integracao de dados seguem o padrao do projeto de referencia, enquanto renderizacao, input e geracao procedural permanecem em JS Vanilla no script da pagina do jogo

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Seed do mundo | reproduzir geracao deterministica | Sim |
| Metadados do mundo | identificar e abrir o save correto | Sim |
| Estado temporario da cena | controlar a sessao de jogo em memoria | Nao |

---

## Dependencias e Premissas

- O lobby de mundos ja deve permitir selecionar ou criar um mundo valido
- Cada mundo precisa ter seed persistida ou gerada no momento da criacao
- A primeira versao do jogo pode usar materiais simples enquanto o sistema de texturas nao existir
- O carregamento de metadados e o controle de acesso ao mundo devem seguir o mesmo contrato de autenticacao e API definido nas PRDs anteriores

---

## Riscos e Perguntas em Aberto

- Definir a estrategia exata de chunking e streaming para sustentar o tamanho logico do mundo no navegador
- Definir o nivel inicial de variedade do terreno para equilibrar simplicidade e legibilidade
- Definir se a primeira versao tera apenas colisao simples de corpo e terreno ou um modelo mais completo de fisica

---

## Criterios de Aceite

1. [ ] O usuario consegue sair de `index.php?page=mundos` para `index.php?page=jogo&id_mundo={id}` e entrar em uma cena 3D jogavel.
2. [ ] A mesma seed gera o mesmo terreno base de forma consistente.
3. [ ] O jogador consegue mover a camera com mouse e se locomover com `WASD` e `espaco`.
4. [ ] O mundo respeita a escala de blocos e a altura logica definida.
5. [ ] O cliente carrega apenas a parte necessaria do mundo para exploracao inicial, sem depender de montar a area total de uma vez.
6. [ ] Nao existe mecanica de quebrar ou colocar blocos nesta versao.
7. [ ] A tela de jogo consome os metadados do mundo pelo padrao compartilhado de API sem quebrar a camada 3D em JS Vanilla.

---

## Backlog Futuro Relacionado

- Sistema de texturas por bloco
- Quebrar e colocar blocos
- Salvamento de alteracoes locais do terreno
- HUD de jogo e pausa in-game

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-003-mundo-3d-procedural.md](./PRD-TECNICA-003-mundo-3d-procedural.md) |
| Tasks | [tasks/](./tasks/) |
