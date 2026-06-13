# TASK-001: Copiar texturas MC para assets/textures/mc/

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-016-texturas-mc-classic.md](../PRD-016-texturas-mc-classic.md) |
| **PRD Tecnica** | [PRD-TECNICA-016-texturas-mc-classic.md](../PRD-TECNICA-016-texturas-mc-classic.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-004, TASK-006 |
| **Criterios cobertos** | CA-01, CA-02 |

## Objetivo

Copiar as subpastas `block/`, `item/` e `entity/` do pacote Minecraft Classic Edition para `assets/textures/mc/` dentro do projeto, tornando-as acessíveis via servidor local.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/textures/mc/block/` | Criar | 949 texturas de bloco |
| `assets/textures/mc/item/` | Criar | 653 texturas de item |
| `assets/textures/mc/entity/` | Criar | 385 texturas de entidade |

## Passos de Implementacao

1. Copiar `block/` do pacote MC Classic para `assets/textures/mc/block/`
2. Copiar `item/` para `assets/textures/mc/item/`
3. Copiar `entity/` para `assets/textures/mc/entity/`
4. Verificar que `GET /assets/textures/mc/block/grass_block_top.png` retorna 200

## Checklist de Validacao

- [x] Implementacao realizada no modulo correto
- [x] Fluxo principal testado
- [x] Regressao manual basica verificada
- [x] Documentacao atualizada se necessario
