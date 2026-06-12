# PRD-012: Experiencia sandbox fundamentada

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-012 |
| **Harness Version** | 2 |
| **Titulo** | Experiencia sandbox fundamentada |
| **Tipo** | Melhoria estrutural e de experiencia |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 11/06/2026 |
| **Autor** | Codex + Tony Stark |
| **Dependencias** | PRD-010, PRD-011 e conclusao da DT-001 |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** transformar os sistemas existentes em um loop de explorar, coletar e construir mais fluido, legivel e satisfatorio.
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL para persistencia existente.
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`.
- **Direcao:** aproximar a sensacao de um sandbox voxel maduro sem copiar assets, sons, interface, receitas ou identidade do Minecraft.

## Problema / Oportunidade

O MineWorld ja possui mundo procedural, blocos mutaveis, inventario, HUD, audio, mobs e persistencia, mas esses recursos ainda parecem funcionalidades isoladas. O renderer Canvas 2D possui teto estrutural de performance, geracao e meshing disputam a main thread, a quebra de blocos e instantanea, o inventario e limitado e a apresentacao visual acumulou estilos concorrentes.

### Impacto Atual

- **Quem e afetado:** todo jogador durante a gameplay.
- **Frequencia:** continua, desde a entrada no mundo.
- **Consequencia:** explorar e construir tem pouco peso, a leitura visual e inconsistente e o runtime pode apresentar picos perceptiveis.

## Objetivo da Funcionalidade

Entregar uma experiencia sandbox coesa em que movimento, interacao, inventario, apresentacao e performance trabalhem juntos. O jogador deve entrar rapidamente, explorar sem congelamentos perceptiveis, compreender o ambiente, sentir progresso ao quebrar e colocar blocos e salvar sem perder estado.

### Resultado Esperado para o Usuario

- Explorar por varios chunks com frame pacing previsivel.
- Mover, quebrar, colocar e organizar blocos com feedback claro e satisfatorio.
- Reconhecer uma identidade visual propria, limpa e coerente.
- Reabrir mundos existentes sem perda de progresso.

## Fluxo Atual

1. O jogador entra em um mundo renderizado por Canvas 2D e aguarda geracao/meshing na main thread.
2. Anda, pula ou voa, mas nao possui sprint, agachamento ou comportamento de agua.
3. Quebra blocos instantaneamente e coloca sem preview persistente.
4. Organiza o inventario apenas trocando slots inteiros.

## Fluxo Desejado

1. O jogador entra no mundo com renderer GPU e streaming assincrono instrumentado.
2. Explora com movimento previsivel, sprint, agachamento, protecao de borda e agua.
3. Recebe progresso e feedback audiovisual ao quebrar, alem de preview ao colocar.
4. Move, combina e divide pilhas sem perda ou duplicacao.
5. Salva e reabre mantendo estado anterior.

## Escopo Incluido

- Renderer WebGL para terreno, agua, selecao e entidades, mantendo HUD em DOM.
- Pipeline assincrono de geracao e meshing com Worker e dados transferiveis.
- Benchmark e telemetria de frame time, long tasks, chunks e memoria.
- Sprint, agachamento, protecao de borda e movimentacao basica em agua.
- Quebra progressiva por dureza, feedback visual, particulas simples e audio.
- Preview valido/invalido de colocacao.
- Inventario com cursor stack, combinacao, troca e divisao de pilhas.
- Consolidacao de HUD, held item, crosshair, audio e direcao visual propria.
- Compatibilidade com mundos, mutacoes, inventarios e texturas existentes.

## Escopo Excluido

- Crafting, ferramentas, durabilidade, fome e progressao completa.
- Novos biomas, nova versao de worldgen ou expansao do catalogo de blocos.
- Novos mobs, combate avancado e multiplayer.
- Copia de conteudo ou identidade protegida do Minecraft.

## Requisitos Funcionais

### RF-01: Renderer acelerado por GPU

**Descricao:** renderizar terreno, agua, selecao e entidades com WebGL por contrato desacoplado.

**Regras de negocio:**
- HUD e menus continuam em DOM.
- O runtime deve preservar um fallback controlado durante a migracao.

### RF-02: Pipeline assincrono de chunks

**Descricao:** retirar geracao e meshing pesado da main thread.

**Regras de negocio:**
- Respostas obsoletas de Worker devem ser descartadas por versao.
- Chunks persistidas e mutacoes continuam sendo fonte de verdade.

### RF-03: Movimento sandbox refinado

**Descricao:** oferecer sprint, agachamento, protecao de borda e movimento basico em agua.

**Regras de negocio:**
- Agachar reduz velocidade e impede queda involuntaria de bordas.
- Agua altera velocidade e controle vertical sem substituir fly.

### RF-04: Quebra progressiva

**Descricao:** blocos quebraveis possuem dureza e progresso cancelavel.

**Regras de negocio:**
- Perder o alvo ou alcance cancela o progresso.
- Bedrock permanece inquebravel.

### RF-05: Colocacao previsivel

**Descricao:** exibir preview antes de colocar e explicar bloqueios.

**Regras de negocio:**
- Nao permitir colocar bloco dentro do corpo do jogador.
- Nao consumir item quando a colocacao for invalida.

### RF-06: Inventario por pilhas

**Descricao:** mover, combinar, trocar e dividir pilhas com cursor stack.

**Regras de negocio:**
- Respeitar limite de 64.
- Nenhuma operacao pode perder ou duplicar itens.

### RF-07: Direcao audiovisual coesa

**Descricao:** consolidar HUD, crosshair, held item, feedback, audio e CSS da gameplay.

**Regras de negocio:**
- A identidade permanece propria do MineWorld.
- Informacao tecnica continua contextual, sem poluir a cena.

### RF-08: Compatibilidade

**Descricao:** mundos existentes continuam carregando e salvando.

**Regras de negocio:**
- Preservar schema de save sempre que possivel.
- Mudancas inevitaveis devem possuir normalizacao retrocompativel.

## Requisitos Nao Funcionais

- **UX/UI:** mundo e interacao sao prioridade; HUD deve ser compacta, consistente e responsiva.
- **Performance:** em benchmark 1080p/distancia 6, frame time P95 `<= 22 ms`; sem congelamento superior a `100 ms` em travessia de 20 chunks.
- **Compatibilidade:** navegadores desktop modernos com WebGL 2; fallback explicito quando indisponivel.
- **Persistencia:** preservar mundo, posicao, vida, fly, inventario, mutacoes, chunks e texturas.
- **Arquitetura:** desacoplar renderer, pipeline de chunks e interacoes do `GameApp`.

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Save do mundo | Posicao, vida, fly, inventario e mutacoes | Sim |
| Chunks | Reaproveitar terreno gerado e alterado | Sim |
| Configuracao de qualidade | Ajustar runtime e renderizacao | Sim |
| Telemetria de benchmark | Validar desenvolvimento local | Nao |

## Dependencias e Premissas

- PRD-010 e PRD-011 permanecem como base de worldgen, escala, HUD e cache.
- DT-001 deve estar concluida antes da validacao integrada.
- WebGL 2 e Worker sao aceitos como evolucao da stack JavaScript Vanilla.
- Crafting permanece no backlog ate o loop atual ser satisfatorio.

## Riscos e Perguntas em Aberto

- Migrar renderer e pipeline de chunks possui alto risco de regressao visual.
- Metas de performance dependem do perfil de hardware; o benchmark deve registrar o ambiente.
- A PRD deve permanecer um vertical slice e nao crescer para um clone de Minecraft.
- Pergunta para validacao: WebGL 2 sem fallback jogavel e aceitavel em navegadores sem suporte?

## Criterios de Aceite

- [x] **CA-01:** Em 1080p, distancia 6 e benchmark documentado, frame time P95 e `<= 22 ms` durante 5 minutos.
- [x] **CA-02:** Travessia continua de 20 chunks nao gera congelamento superior a `100 ms`.
- [x] **CA-03:** Geracao e meshing causam no maximo 2 long tasks superiores a `50 ms` por minuto.
- [x] **CA-04:** Sprint, agachamento, protecao de borda e agua passam por testes determinÃ­sticos.
- [x] **CA-05:** Quebra apresenta progresso visivel, respeita dureza e cancela ao perder o alvo.
- [x] **CA-06:** Preview de colocacao impede colisao com jogador e posicao invalida.
- [x] **CA-07:** Inventario combina e divide pilhas ate 64 sem perda ou duplicacao.
- [x] **CA-08:** Mundo existente preserva posicao, vida, fly, inventario e mutacoes apos salvar e reabrir.
- [x] **CA-09:** Smoke de 15 minutos cobre explorar, nadar, coletar, construir, inventario, morte e retomada.
- [x] **CA-10:** `npm test`, testes de runtime, `node --check` e `php -l` passam.

## Historico de Requisitos

| Requisito / Decisao | Estado | Substitui | Substituido por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Renderer WebGL como alvo principal | Proposto | Renderer Canvas 2D das PRDs 003-011 | - | Remover teto estrutural de graficos e performance. |
| Pipeline assincrono de chunks | Proposto | Geracao e meshing na main thread | - | Melhorar frame pacing. |
| Interacao progressiva e previsivel | Proposto | Quebra instantanea e colocacao sem preview | - | Dar peso e clareza ao loop sandbox. |

## Backlog Futuro Relacionado

- Crafting, ferramentas, durabilidade e progressao sandbox.
- Ciclo de dia/noite, iluminacao dinamica e clima.
- Ecossistema de mobs e combate avancado.

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-012-experiencia-sandbox-v1.md](./PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| Tasks | [tasks/](./tasks/) |
| Validacao final | [PRD-012-validacao.md](../../execucoes/PRD-012-validacao.md) |
