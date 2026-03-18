# PRD-005: Loop sandbox com inventario e superficie viva

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-005 |
| **Titulo** | Loop sandbox com inventario e superficie viva |
| **Tipo** | Nova funcionalidade |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 17/03/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-004 |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** transformar a cena 3D atual em um loop sandbox realmente jogavel, com interacao com blocos, leitura visual mais rica e feedback de primeira pessoa mais proximo do que se espera de um jogo no estilo Minecraft
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL quando houver necessidade de backend
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural obrigatorio:** basear front + API no modelo de `C:\laragon\www\dealer-gestao-modulos`

---

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
- **Observacao:** o runtime do jogo continua em JS Vanilla, mesmo quando a persistencia e o shell web seguirem o padrao front + API acima

---

## Problema / Oportunidade

O MineWorld ja possui um mundo 3D procedural navegavel, mas ainda nao entrega o loop sandbox que faz o jogador permanecer no mundo. Falta feedback corporal em primeira pessoa, falta uma forma simples de carregar e selecionar blocos, nao existe interacao direta de quebrar e colocar, e a superficie do mundo ainda e visualmente pouco diversa.

Sem essa etapa, o jogo abre e anda, mas ainda funciona mais como demo tecnica do que como jogo. O usuario nao manipula o ambiente, nao tem progressao local dentro do proprio mundo e ainda percebe o horizonte e o final do mapa de forma crua demais.

### Impacto Atual

- **Quem e afetado:** jogador e produto
- **Frequencia:** sempre que entra em um mundo
- **Consequencia:** loop sandbox incompleto, baixa sensacao de agencia e leitura visual ainda artificial do terreno

---

## Objetivo da Funcionalidade

Entregar o primeiro loop sandbox funcional do MineWorld. O jogador deve ver a propria mao em primeira pessoa, selecionar blocos por hotbar, abrir um inventario simples, quebrar e colocar blocos dentro de um alcance controlado e explorar uma superficie procedural mais rica, com arvores, agua, areia e pedra aparente.

Essa PRD tambem marca a transicao do save apenas posicional para o save de estado mutavel do mundo. Ao alterar o terreno ou o inventario, essas mudancas devem fazer parte do estado persistivel do mundo para que a sessao reabra de forma coerente.

Por fim, a cena deve ganhar nevoa para suavizar o horizonte, esconder melhor o limite visual do mapa e reduzir a leitura brusca de chunks e bordas distantes.

### Resultado Esperado para o Usuario

- Ver uma mao em primeira pessoa reagindo ao movimento e ao uso de blocos
- Usar uma hotbar e um inventario simples para selecionar, guardar e consumir blocos
- Quebrar e colocar blocos no mundo com leitura clara e persistente entre sessoes
- Explorar um terreno com mais variedade visual, incluindo agua, areia, pedra exposta e arvores
- Perceber o horizonte de forma mais natural por causa da nevoa

---

## Fluxo Atual

1. O usuario entra em um mundo e apenas caminha pela cena procedural.
2. Nao existe mao em primeira pessoa, hotbar, inventario ou interacao com blocos.
3. O terreno ainda e composto basicamente por relevo de grama, terra e pedra interna, sem cobertura superficial rica.
4. O horizonte ainda expoe demais a distancia visual e a leitura do fim do mundo.

## Fluxo Desejado

1. O usuario entra no mundo e passa a ver uma mao em primeira pessoa na HUD da gameplay.
2. A hotbar fica disponivel na tela com selecao por mouse wheel e teclas numericas.
3. O inventario simples pode ser aberto para organizar os blocos disponiveis.
4. O usuario mira um bloco dentro do alcance, quebra esse bloco e recebe o recurso correspondente no inventario.
5. O usuario seleciona um bloco da hotbar e o coloca em uma face valida do mundo.
6. As alteracoes do terreno e do inventario passam a fazer parte do estado salvo do mundo.
7. O terreno procedural inclui agua, areia perto da agua, pedra aparente e arvores na superficie.
8. A nevoa mascara o horizonte e reduz a leitura brusca do final do mapa.

---

## Escopo Incluido

- Mao em primeira pessoa com animacao basica de idle e caminhada
- Feedback de uso da mao ao quebrar e ao colocar bloco
- Hotbar inspirada no Minecraft, em versao mais simples
- Inventario simples de blocos, sem crafting
- Selecao de slots por teclado numerico e mouse wheel
- Sistema de mira e alvo de bloco dentro de alcance controlado
- Quebra de blocos
- Colocacao de blocos
- Persistencia das mutacoes do terreno no estado salvo do mundo
- Persistencia do inventario e do slot selecionado
- Geracao procedural com agua superficial
- Geracao procedural com areia em torno da agua
- Geracao procedural com pedra visivel em partes da superficie
- Geracao procedural com arvores
- Nevoa para mascarar distancia, borda visual do mapa e pop-in distante

## Escopo Excluido

- Sistema final de texturas para todos os blocos e itens
- Crafting, receitas, fornalha ou progressao de sobrevivencia completa
- Ferramentas, durabilidade, dano de combate ou mobs
- Fisica de fluidos dinamicos, correnteza ou simulacao completa de agua
- Multiplayer ou sincronizacao em tempo real

---

## Requisitos Funcionais

### RF-01: Mao em primeira pessoa

**Descricao:** a gameplay deve exibir uma mao do personagem em primeira pessoa.

**Regras de negocio:**
- A mao deve permanecer visivel na tela durante a exploracao normal.
- A mao deve ter animacao basica acompanhando caminhada e uso.
- Ao quebrar ou colocar bloco, a mao deve reagir com feedback visual de acao.
- A mao pode usar arte e materiais provisorios enquanto o sistema final de texturas nao existir.

**Entrada:** locomocao do jogador e uso de bloco

**Saida esperada:** feedback corporal mais claro e mais proximo de um sandbox em primeira pessoa

---

### RF-02: Hotbar e inventario simplificados

**Descricao:** o jogador deve ter um sistema simples de slots para guardar e selecionar blocos.

**Regras de negocio:**
- A hotbar deve ficar visivel durante a gameplay.
- A hotbar inicial deve seguir a leitura classica de slots lado a lado.
- O inventario deve abrir e fechar sem sair da gameplay.
- O inventario desta fase deve ser mais simples que o do Minecraft, focado apenas em blocos e sem crafting.
- A selecao de item deve funcionar por mouse wheel e teclas numericas.

**Entrada:** tecla de inventario, wheel do mouse e teclas numericas

**Saida esperada:** gestao simples dos blocos disponiveis para uso na gameplay

---

### RF-03: Quebra de blocos

**Descricao:** o jogador deve conseguir quebrar blocos validos dentro de um alcance controlado.

**Regras de negocio:**
- O bloco precisa estar dentro do alcance de interacao.
- O sistema deve destacar de forma clara qual bloco esta sendo alvo.
- Ao quebrar um bloco, o mundo deve remover esse bloco da posicao correspondente.
- O bloco quebrado deve gerar recurso correspondente no inventario simplificado do jogador.
- O sistema deve impedir quebra de posicoes invalidas fora dos limites permitidos do mundo.

**Entrada:** mira do centro da tela + acao de quebrar

**Saida esperada:** bloco removido do mundo e recurso adicionado ao inventario

---

### RF-04: Colocacao de blocos

**Descricao:** o jogador deve conseguir colocar um bloco selecionado da hotbar em uma face valida do mundo.

**Regras de negocio:**
- O jogador so pode colocar bloco se houver item correspondente disponivel no slot selecionado.
- A colocacao deve respeitar o alcance de interacao.
- O sistema deve colocar o bloco em uma face adjacente valida do alvo selecionado.
- A colocacao nao deve prender o jogador dentro do proprio bloco.
- Colocar um bloco deve consumir o item correspondente do inventario.

**Entrada:** slot selecionado + mira + acao de colocar

**Saida esperada:** bloco inserido no mundo e item consumido do inventario

---

### RF-05: Persistencia do mundo mutavel e do inventario

**Descricao:** mutacoes do terreno e estado do inventario devem persistir no save do mundo.

**Regras de negocio:**
- O save do mundo deve incluir blocos removidos e colocados pelo jogador.
- O save deve incluir inventario, hotbar e slot atualmente selecionado.
- Ao reabrir o mesmo mundo, o terreno precisa refletir as alteracoes persistidas.
- Ao reabrir o mesmo mundo, o inventario precisa voltar no estado salvo.
- A estrutura de save precisa continuar versionada para futuras expansoes.

**Entrada:** salvar sessao com alteracoes no terreno e no inventario

**Saida esperada:** reabertura coerente do mundo alterado e do inventario salvo

---

### RF-06: Superficie procedural enriquecida

**Descricao:** a geracao procedural deve produzir uma superficie mais viva e mais legivel.

**Regras de negocio:**
- O mundo deve gerar agua superficial em regioes apropriadas.
- Regioes proximas da agua devem gerar areia.
- A superficie deve expor pedra em partes coerentes do relevo.
- Arvores devem aparecer em quantidade controlada nas regioes aptas.
- Esses elementos devem respeitar o seed do mundo e permanecer deterministas.

**Entrada:** seed do mundo e abertura de chunks

**Saida esperada:** terreno com bioma superficial mais rico e repetivel por seed

---

### RF-07: Nevoa de distancia

**Descricao:** a cena deve aplicar nevoa para suavizar o horizonte.

**Regras de negocio:**
- A nevoa deve atuar na distancia, e nao em curtas distancias de jogabilidade.
- A nevoa deve ajudar a mascarar o final do mapa e o pop-in distante.
- A nevoa nao deve impedir leitura clara do alvo de bloco no alcance de interacao.
- A nevoa deve permanecer coerente com a paleta atual do mundo.

**Entrada:** renderizacao da cena 3D

**Saida esperada:** horizonte mais natural e menos brusco

---

## Requisitos Nao Funcionais

- **UX/UI:** a hotbar e o inventario devem ser inspirados no Minecraft, mas simplificados, legiveis e sem excesso de complexidade visual
- **Performance:** quebra, colocacao, atualizacao de chunk e nevoa nao podem degradar a exploracao a ponto de tornar a interacao desconfortavel
- **Compatibilidade:** navegadores desktop modernos com teclado e mouse
- **Seguranca:** alteracoes de mundo e inventario devem respeitar ownership do usuario autenticado
- **Persistencia:** o save do mundo precisa cobrir posicao/orientacao do jogador, inventario, slot selecionado e mutacoes do terreno
- **Arquitetura:** o shell continua em `index.php?page=...`, a integracao continua em `api/{dominio}/{acao}.php` e o runtime 3D permanece em JS Vanilla

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Estado do jogador | manter posicao, orientacao e slot selecionado | Sim |
| Inventario / hotbar | guardar blocos disponiveis ao jogador | Sim |
| Mutacoes do terreno | refletir blocos quebrados e colocados | Sim |
| Elementos procedurais por seed | reconstruir superficie base deterministica | Sim |
| Animacao de mao em tempo real | feedback visual da sessao atual | Nao |

---

## Dependencias e Premissas

- A PRD-004 precisa continuar sendo a base do runtime jogavel e do save por mundo
- O save atual do mundo precisa ser expandido para armazenar inventario e mutacoes do terreno
- A geracao procedural continua baseada em seed e chunking sob demanda
- A primeira versao de agua pode ser estatica, sem simulacao de fluxo
- O inventario simples desta fase tera 27 slots totais, com 9 slots de hotbar
- O jogador inicia sem kit gratis e passa a adquirir blocos ao quebrar o terreno

---

## Riscos e Perguntas em Aberto

- Balancear densidade de arvores, agua e areia sem descaracterizar performance da geracao atual
- Definir o formato mais economico para persistir mutacoes do terreno por chunk sem inflar demais o save

---

## Criterios de Aceite

1. [x] A gameplay passa a exibir mao em primeira pessoa com animacao basica de movimento e uso.
2. [x] O jogador passa a ter hotbar visivel e inventario simples para gerenciar blocos.
3. [x] O jogador consegue quebrar blocos validos dentro do alcance e receber os recursos correspondentes no inventario.
4. [x] O jogador consegue colocar blocos validos a partir do slot selecionado da hotbar.
5. [x] O mundo salvo reabre com inventario, slot selecionado e mutacoes de terreno consistentes com a sessao anterior.
6. [x] A geracao procedural passa a incluir agua, areia proxima da agua, pedra aparente e arvores de forma deterministica por seed.
7. [x] A cena aplica nevoa de distancia suficiente para mascarar melhor o final visual do mapa sem atrapalhar a interacao proxima.

---

## Backlog Futuro Relacionado

- Sistema final de texturas para blocos, itens e mao em primeira pessoa
- Crafting, fornalha e progressao de sobrevivencia
- Ferramentas e tempos de quebra por material
- Autosave incremental mais frequente para mutacoes de terreno

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](./PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| Tasks | [tasks/](./tasks/) |
