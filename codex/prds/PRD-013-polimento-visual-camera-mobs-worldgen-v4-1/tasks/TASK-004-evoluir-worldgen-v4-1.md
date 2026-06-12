# TASK-004: Evoluir worldgen v4.1

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **PRD Tecnica** | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-005 |
| **Criterios cobertos** | CA-07, CA-08, CA-09 |

## Objetivo

Evoluir a geracao procedural para uma linha `v4.1` mais rica em biomas, arvores e montanhas, preservando retrocompatibilidade com mundos existentes.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/TerrainGenerator.js` | Modificar | Biomas e relevo |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Modificar | Arvores e cobertura superficial |
| `assets/js/game/GameApp.js` | Revisar | Bootstrap e spawn |
| `assets/js/game/services/WorldPrebuilder.js` | Revisar | Geracao inicial |
| Fluxo de criacao de mundos | Modificar | Default `algorithm_version` |

## Passos de Implementacao

1. Reequilibrar classificacao de biomas e curvas de relevo para introduzir `v4.1`.
2. Adicionar mais perfis de vegetacao e variedade de arvores por bioma.
3. Promover `v4.1` como default apenas para mundos novos e validar multiplas seeds perto do spawn.

## Regras e Cuidados

- Mundos antigos nao podem migrar automaticamente de versao.
- Mais variedade nao pode significar mais artefato visual ou spawn inviavel.
- O tempo de prebuild inicial nao deve crescer de forma regressiva.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** criar varios mundos novos com seeds distintas e inspecionar o entorno inicial.
- **Resultado esperado:** ha mais variedade de biomas, arvores e montanhas sem artefatos frequentes.

### Teste 2

- **Acao:** reabrir um mundo antigo e comparar seu comportamento de carregamento com um mundo novo.
- **Resultado esperado:** o mundo antigo preserva sua versao anterior e o mundo novo nasce em `v4.1`.

## Rollback

Restaurar `v4.0` como default de mundos novos e recolocar os thresholds/parametros anteriores de bioma e vegetacao.

## Notas Tecnicas

- Cobertura principal: `CA-07`, `CA-08` e `CA-09`.
