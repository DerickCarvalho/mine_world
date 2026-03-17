# TASK-003: Implementar gerador procedural

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-004, TASK-005 |

---

## Objetivo

Implementar a geracao de terreno deterministica por seed, definindo limites do mundo, alturas de colunas e distribuicao basica de tipos de bloco.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/WorldConfig.js` | Criar | Novo arquivo |
| `assets/js/game/world/SeededRandom.js` | Criar | Novo arquivo |
| `assets/js/game/world/TerrainGenerator.js` | Criar | Novo arquivo |
| `assets/js/game/world/BlockTypes.js` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Definir constantes do mundo: largura, profundidade, altura, chunk size e centro logico.
2. Implementar gerador pseudoaleatorio deterministico por seed.
3. Implementar ruido/fractal simples para obter altura por coluna `x,z`.
4. Definir materiais logicos basicos como grama, terra e pedra.
5. Expor API interna para consulta de altura e blocos solidos por coordenada.

---

## Regras e Cuidados

- A mesma seed precisa gerar sempre o mesmo resultado.
- A altura precisa respeitar o intervalo 1..100.
- Nao introduzir cavernas, mineracao ou modificacao de terreno nesta etapa.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Limites logicos do mundo definidos
- [ ] Seed deterministica funcionando
- [ ] Alturas de terreno coerentes
- [ ] Tipos de bloco placeholder definidos

---

## Testes de Verificacao

### Teste 1

- **Acao:** Consultar varias coordenadas com a mesma seed em duas inicializacoes separadas.
- **Resultado esperado:** As alturas retornadas sao identicas entre execucoes.

### Teste 2

- **Acao:** Consultar coordenadas proximas aos limites do mundo.
- **Resultado esperado:** O gerador respeita fronteiras logicas e nao produz valores fora do intervalo esperado.

---

## Rollback

Remover os modulos `WorldConfig`, `SeededRandom`, `TerrainGenerator` e `BlockTypes`.

---

## Notas Tecnicas

- O terreno inicial pode ser mais simples; o importante e garantir repetibilidade e base para chunks.
