# PRD-007: Texturas, comandos, chat e primeiro mob

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PRD-007 |
| **Data** | 18/03/2026 |
| **Autor** | Codex |
| **Status** | Implementada |
| **Dependencias** | PRD-005, PRD-006 |

---

## Contexto

O runtime atual do MineWorld ja suporta mundo procedural persistente, inventario simples, chunks em cache e HUD contextual, mas ainda opera com blocos em cor solida, nao possui extensibilidade de comandos, nao oferece chat in-game e segue sem criaturas vivas no mundo. Alem disso, a malha atual gera faces em excesso e pressiona o renderer por software.

Esta PRD consolida a proxima etapa do sandbox: introduzir texturas administraveis via web, abrir um cadastro de comandos validado contra as capacidades reais do jogo, disponibilizar um chat com execucao de comandos, criar o primeiro mob do mundo e reduzir lag com uma pipeline de renderizacao e malha mais barata.

---

## Objetivo

Transformar o MineWorld em uma base mais extensivel e mais jogavel, com personalizacao visual de blocos, comandos administraveis, um canal de chat in-game e o primeiro comportamento de criatura viva, sem abandonar a pilha atual em PHP + JavaScript Vanilla.

---

## Escopo Funcional

### 1. Otimizacao do runtime

- Reduzir o custo de render por frame.
- Tornar a geracao e reconstrução de chunks menos pesada.
- Ajustar o runtime para responder melhor em maquinas mais fortes e degradar de forma controlada quando o frame time subir.

### 2. CRUD de texturas

- Disponibilizar uma tela autenticada no menu principal para gerenciar texturas dos blocos atuais.
- Permitir upload de tres imagens por bloco: `topo`, `laterais` e `fundo`.
- Persistir os arquivos em uma pasta `_texturas`.
- Restringir cada imagem a no maximo `5 KB`.
- Quando nao houver textura cadastrada para uma face, manter a cor base do bloco.

### 3. Refino da mao em primeira pessoa

- Substituir a mao atual por um braco retangular mais proximo da silhueta do Minecraft original.
- Manter animacao de idle, caminhada e uso sem visual arredondado.

### 4. Primeiro mob: gato

- Introduzir um gato com spawn controlado perto do jogador em area de mata.
- Aplicar chance de `1/50` para tentativa de spawn proxima ao jogador.
- Limitar a quantidade simultanea de gatos.
- Permitir alternar o estado `seguir jogador` ao clicar com o botao direito no gato.

### 5. CRUD de comandos

- Disponibilizar uma tela autenticada no menu principal para cadastrar, editar e excluir comandos.
- Exigir identificador do comando e descricao obrigatoria do comportamento esperado.
- Rodar uma validacao automatica no cadastro para decidir se o comando e viavel no estado atual do jogo.
- Permitir salvar apenas comandos validados com capacidade conhecida.
- Informar quando a descricao ainda nao pode ser atendida.

### 6. Chat e execucao de comandos

- Abrir o chat ao pressionar `T`.
- Tratar mensagens iniciadas com `/` como comandos.
- Exibir a lista de comandos cadastrados e validados quando o jogador iniciar um comando.
- Executar o comando ao enviar a mensagem.
- Entregar suporte inicial ao comando de teleporte.

---

## Requisitos Funcionais

1. O jogo deve reduzir o numero de faces efetivamente renderizadas em chunks comuns.
2. O renderer deve conseguir desenhar faces com textura quando houver imagem cadastrada para a face correspondente.
3. O menu principal deve expor acesso ao CRUD de texturas e ao CRUD de comandos.
4. O CRUD de texturas deve listar todos os blocos atuais do catalogo do jogo.
5. Cada textura enviada deve ser validada e rejeitada quando exceder `5 KB`.
6. Arquivos aprovados devem ser gravados em `_texturas` e reutilizados pelo runtime.
7. A mao em primeira pessoa deve usar silhueta blocada e retangular.
8. O runtime deve conseguir spawnar gatos apenas em pequena quantidade e em area plausivel de mata.
9. O clique direito sobre o gato deve alternar entre `seguir` e `vagar`.
10. O cadastro de comandos deve exigir descricao e rodar validacao automatica antes de persistir.
11. O chat deve abrir por `T`, listar comandos validados apos `/` e executar o comando selecionado ao enviar.
12. O primeiro comando suportado deve ser `teleporte`.

---

## Requisitos Nao Funcionais

- O sistema de texturas deve continuar funcional mesmo sem nenhuma imagem cadastrada.
- O CRUD web deve respeitar o shell autenticado em `index.php?page=...`.
- O validador de comandos nao deve depender de servicos externos.
- O runtime deve evitar explosao de entidades e manter o spawn de gatos sob controle.
- O chat nao deve bloquear a gameplay alem do periodo em que estiver aberto.

---

## Criterios de Aceite

- O menu principal passa a exibir entradas para `Texturas` e `Comandos`.
- O cadastro de textura aceita ate tres imagens por bloco e rejeita qualquer arquivo acima de `5 KB`.
- Blocos com textura cadastrada deixam de usar apenas cor solida na face correspondente.
- Blocos sem textura continuam aparecendo com a cor base atual.
- A mao deixa de parecer anatomica e passa a parecer um braco retangular.
- Gatos surgem perto do jogador com baixa frequencia e nao lotam a cena.
- Clicar com o botao direito em um gato alterna o modo de seguimento.
- O CRUD de comandos aceita descricoes compativeis com capacidades reais e rejeita as inviaveis.
- Pressionar `T` abre o chat e digitar `/` exibe a lista de comandos validados.
- O comando de teleporte pode ser executado via chat.

---

## Fora de Escopo

- Sistema generico de IA guiada por LLM para criar qualquer comando arbitrario
- Persistencia completa de mobs entre sessoes
- Domar, alimentar ou inventario de mobs
- Suporte a pacotes de textura compactados
- Sistema completo de permissao por perfil

---

## Dependencias

- Catalogo de blocos e runtime sandbox das PRDs 005 e 006
- Shell autenticado e padrao de CRUD web das PRDs 001 e 002

---

## Observacoes

- O validador automatico desta fase deve operar por capacidades conhecidas do jogo; inicialmente a capacidade executavel sera `teleporte`.
- Ao concluir uma nova PRD, o `codex/ESCOPO.md` deve ser atualizado na mesma entrega.
