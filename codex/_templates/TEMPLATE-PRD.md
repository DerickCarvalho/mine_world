# PRD-[NNN]: [titulo curto e descritivo]

> **INSTRUCOES DE USO**
>
> 1. Salve este documento em `codex/prds/PRD-[NNN]-[nome-curto]/PRD-[NNN]-[nome-curto].md`
> 2. Preencha todos os campos entre `[colchetes]`
> 3. Esta PRD de produto precisa ser validada antes de gerar PRD tecnica e tasks
> 4. Ao concluir esta PRD, atualize obrigatoriamente `codex/ESCOPO.md` com objetivo, dependencias e status
> 5. Remova este bloco apenas quando o documento deixar de ser rascunho
>
> **REGRA PERMANENTE**
>
> Nenhuma PRD de produto e considerada concluida se `codex/ESCOPO.md` nao tiver sido atualizado na mesma entrega.

---

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-[NNN] |
| **Titulo** | [titulo da funcionalidade] |
| **Tipo** | [Nova funcionalidade / Melhoria / Correcao] |
| **Prioridade** | [Alta / Media / Baixa] |
| **Status** | [Rascunho / Em validacao / Aprovada / Cancelada] |
| **Data** | [DD/MM/YYYY] |
| **Autor** | [Nome] |
| **Dependencias** | [PRD-XXX ou Nao possui] |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** [como esta PRD ajuda a colocar o jogo de pe]
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL apenas quando houver necessidade de backend
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
- **Observacao:** a camada de jogo 3D pode permanecer em JS Vanilla mesmo quando o shell web seguir esse padrao

---

## Problema / Oportunidade

[Descreva a dor atual ou a oportunidade de produto que esta PRD resolve.]

### Impacto Atual

- **Quem e afetado:** [jogador, operacao, produto]
- **Frequencia:** [sempre, recorrente, eventual]
- **Consequencia:** [bloqueia uso, gera atrito, impede persistencia]

---

## Objetivo da Funcionalidade

[Descreva em 1 a 3 paragrafos o resultado de produto esperado.]

### Resultado Esperado para o Usuario

- [beneficio 1]
- [beneficio 2]
- [beneficio 3]

---

## Fluxo Atual

[Se a funcionalidade nao existir ainda, descreva o vazio atual.]

1. [passo 1]
2. [passo 2]
3. [passo 3]

## Fluxo Desejado

1. [passo 1]
2. [passo 2]
3. [passo 3]

---

## Escopo Incluido

- [item 1]
- [item 2]
- [item 3]

## Escopo Excluido

- [item fora do escopo 1]
- [item fora do escopo 2]

---

## Requisitos Funcionais

### RF-01: [nome do requisito]

**Descricao:** [o que deve acontecer]

**Regras de negocio:**
- [regra 1]
- [regra 2]

**Entrada:** [dados ou acao esperada]

**Saida esperada:** [resultado para o usuario ou sistema]

---

### RF-02: [nome do requisito]

[Repita a estrutura acima para os demais requisitos.]

---

## Requisitos Nao Funcionais

- **UX/UI:** [direcao visual, comportamento responsivo, clareza de navegacao]
- **Performance:** [tempo de resposta, limite de processamento, regra de streaming/chunk se aplicavel]
- **Compatibilidade:** [navegadores ou plataformas suportadas]
- **Seguranca:** [auth, validacao, integridade de dados, se aplicavel]
- **Persistencia:** [o que precisa ficar salvo e por qual mecanismo]
- **Arquitetura:** [como a feature respeita o padrao `login.php` / `index.php?page=` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request]

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| [usuario] | [descricao] | [Sim / Nao] |
| [mundo] | [descricao] | [Sim / Nao] |
| [configuracao] | [descricao] | [Sim / Nao] |

---

## Dependencias e Premissas

- [dependencia tecnica ou de produto]
- [premissa que precisa ser verdadeira]

---

## Riscos e Perguntas em Aberto

- [risco ou pergunta 1]
- [risco ou pergunta 2]

---

## Criterios de Aceite

1. [ ] [criterio verificavel 1]
2. [ ] [criterio verificavel 2]
3. [ ] [criterio verificavel 3]
4. [ ] [criterio verificavel 4]

---

## Backlog Futuro Relacionado

- [item futuro 1]
- [item futuro 2]

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-[NNN]-[nome-curto].md](./PRD-TECNICA-[NNN]-[nome-curto].md) |
| Tasks | [tasks/](./tasks/) |
