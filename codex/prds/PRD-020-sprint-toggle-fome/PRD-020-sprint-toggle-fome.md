# PRD-020: Sprint Toggle e Fome AvanÃ§ada

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-020 |
| **Harness Version** | 2 |
| **Titulo** | Sprint Toggle e Fome AvanÃ§ada |
| **Tipo** | Melhoria de gameplay |
| **Prioridade** | MÃ©dia-Alta |
| **Status** | Rascunho |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **DependÃªncias** | PRD-015 (fome base jÃ¡ implementada) |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** transformar o sprint de hold-to-sprint para toggle; adicionar double-W como atalho de sprint; fazer a fome drenar mais rÃ¡pido ao correr e pular; adicionar feedback visual de FOV aumentado ao correr
- **Stack alvo:** JavaScript Vanilla
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Problema / Oportunidade

O sprint atual requer segurar Ctrl pressionado enquanto corre â€” diferente do Minecraft onde um Ãºnico toque em Ctrl (ou double-W) ativa o sprint que permanece atÃ© o jogador parar ou desacelerar. AlÃ©m disso, a fome drena em velocidade Ãºnica independente de o jogador estar correndo ou pulando. No MC, sprint e pulos consomem mais fome â€” isso incentiva o jogador a gerenciar recursos. O FOV dinÃ¢mico ao correr Ã© um detalhe visual que dÃ¡ sensaÃ§Ã£o de velocidade.

### Impacto Atual

- **Quem Ã© afetado:** todo jogador que usa sprint
- **FrequÃªncia:** sempre que o jogador se move
- **ConsequÃªncia:** o sprint Ã© menos confortÃ¡vel; sem penalidade de fome para sprint, o recurso perde importÃ¢ncia

## Objetivo da Funcionalidade

1. Sprint como **toggle**: pressionar Ctrl uma vez ativa; pressionar de novo ou parar de andar desativa
2. **Double-W** (< 300ms) tambÃ©m ativa o sprint
3. **FOV dinÃ¢mico**: +5 graus ao sprinting, com transiÃ§Ã£o suave de 0.2s
4. Fome drena **3Ã— mais rÃ¡pido** enquanto sprinting
5. Fome drena **1.5Ã— mais rÃ¡pido** por cada pulo realizado (acÃºmulo)
6. Sprint Ã© cancelado ao bater numa parede ou ao agachar
7. Indicador visual sutil de estado sprint na HUD (opcionalmente)

### Resultado Esperado para o UsuÃ¡rio

- Pressionar Ctrl uma vez e soltar â†’ ainda estÃ¡ correndo
- Double-tap W â†’ comeÃ§a a correr
- Parar de andar â†’ sprint se desativa automaticamente
- Ver o FOV aumentar suavemente ao comeÃ§ar a correr
- Notar que a barra de fome cai mais rÃ¡pido ao correr

## Fluxo Atual

1. `InputState.handleKeyDown`: ControlLeft â†’ `this.sprint = true`; keyUp â†’ `this.sprint = false`
2. `PlayerController.updateMovement`: `this.sprinting = !flying && !water && !crouch && this.input.sprint && forward > 0`
3. A velocidade Ã© multiplicada por `sprintMoveMultiplier = 1.45` quando sprinting
4. `WorldConfig.hungerDrainInterval = 24` â€” drena em velocidade fixa

## Fluxo Desejado

1. `InputState`: ao pressionar Ctrl, **toggle** `this.sprintToggleRequested`
2. `InputState`: ao detectar double-W (segunda pressÃ£o de W em < 300ms), **toggle sprint**
3. `PlayerController`: gerencia `this.sprintActive` (estado persistente); cancela ao parar, colidir lateralmente ou agachar
4. `WorldConfig`: adicionar `sprintHungerMultiplier = 3`, `jumpHungerMultiplier = 1.5`
5. `GameApp` (onde gerencia fome): aplicar multiplicador conforme `movementState.sprinting` e eventos de pulo
6. `WebGLRenderer` (ou cÃ¢mera): interpolar FOV de 78 para 83 quando sprinting

## Escopo IncluÃ­do

- `InputState.js`: sprint como toggle; double-W detection; remover hold-to-sprint
- `PlayerController.js`: lÃ³gica de cancelamento automÃ¡tico de sprint
- `WorldConfig.js`: novos multiplicadores de fome e `sprintFovBoost`
- `GameApp.js` (ou mÃ³dulo de fome): aplicar `sprintHungerMultiplier` e `jumpHungerMultiplier`
- `WebGLRenderer.js`: FOV dinÃ¢mico com lerp suave
- CSS/HUD: indicador de sprint opcional (footstep icon ou borda pulsante ao redor da tela)
- PartÃ­culas de velocidade ou rastros visuais
- Efeito de tela de velocidade (motion blur)
- Sprint na Ã¡gua ou voand

## Escopo ExcluÃ­do

- Sprint automÃ¡tico ao ficar com fome cheia (feature do MC moderno)

## Requisitos Funcionais

### RF-01: Sprint como toggle

**DescriÃ§Ã£o:** sprint deve ser ativado/desativado com uma pressÃ£o de tecla, nÃ£o mantido.

**Regras:**
- Pressionar Ctrl: toggle estado `sprintActive`
  - Se `sprintActive = false` â†’ `sprintActive = true` (comeÃ§a a correr se moving forward)
  - Se `sprintActive = true` â†’ `sprintActive = false` (para de correr)
- Sprint sÃ³ se aplica quando `forward > 0`
- Sprint Ã© cancelado automaticamente quando:
  - Jogador para de pressionar W (forward = 0 por mais de 0.1s)
  - Jogador agacha (Shift)
  - Jogador entra na Ã¡gua
  - Jogador colide com bloco lateralmente (hit wall)
- Sprint nÃ£o se aplica enquanto voando ou na Ã¡gua

**SaÃ­da esperada:** pressionar Ctrl uma vez â†’ sprint ativo persistente atÃ© cancelamento

### RF-02: Double-W para sprint

**DescriÃ§Ã£o:** pressionar W duas vezes rapidamente (< 300ms entre as pressÃµes) ativa o sprint.

**Regras:**
- Registrar timestamp da Ãºltima pressÃ£o de W (`lastWPressedAt`)
- Ao pressionar W de novo: se `Date.now() - lastWPressedAt < 300` â†’ ativar sprint
- NÃ£o ativar sprint se jogador estiver agachando, na Ã¡gua ou voando
- Double-W deve ter a mesma sensaÃ§Ã£o que o double-Space para voo

**SaÃ­da esperada:** correr pressionando W rapidamente duas vezes

### RF-03: FOV dinÃ¢mico ao sprinting

**DescriÃ§Ã£o:** o campo de visÃ£o deve aumentar suavemente ao correr e voltar ao normal ao parar.

**Regras:**
- FOV base: 78Â° (definido em `WorldConfig.fov`)
- FOV sprint: 83Â° (`fov + sprintFovBoost`)
- TransiÃ§Ã£o: lerp com fator `12 * deltaTime` (0.2s aproximado)
- CÃ¢mera atualiza a projeÃ§Ã£o a cada frame com o FOV atual interpolado
- NÃ£o aplicar no modo criativo/voando (manter FOV base)

**SaÃ­da esperada:** transiÃ§Ã£o suave de FOV ao iniciar e parar de correr

### RF-04: Fome drena mais rÃ¡pido ao correr

**DescriÃ§Ã£o:** o ritmo de drenagem de fome deve ser multiplicado durante o sprint.

**Regras:**
- `sprintHungerMultiplier: 3` â€” sprint consome fome 3Ã— mais rÃ¡pido
- Enquanto `movementState.sprinting === true`: aplicar multiplicador ao tick de fome
- ImplementaÃ§Ã£o: `hungerDrainInterval` efectivo = `hungerDrainInterval / sprintHungerMultiplier` durante sprint

**SaÃ­da esperada:** barra de fome cai claramente mais rÃ¡pido ao correr

### RF-05: Fome drena ao pular

**DescriÃ§Ã£o:** cada pulo consome uma pequena porÃ§Ã£o de fome.

**Regras:**
- Ao detectar evento de pulo (jogador deixa o chÃ£o por `jump`): drenar `0.5` ponto de fome imediatamente
- NÃ£o acumular se jogador jÃ¡ estÃ¡ caindo (sem pulo duplo)
- Implementar via evento de GameApp: `if (actions.jumpedThisFrame) hungerState -= 0.5`

**SaÃ­da esperada:** spam de pulo esgota a fome; pulos constantes tÃªm custo perceptÃ­vel

## Requisitos NÃ£o Funcionais

- **Performance:** FOV lerp Ã© um cÃ¡lculo de float por frame; imperceptÃ­vel
- **UX:** transiÃ§Ã£o de FOV deve ser suave (nÃ£o instantÃ¢nea) para nÃ£o causar desconforto visual
- **Compatibilidade:** sprint toggle nÃ£o deve interferir com o modo de voo (double-Space)

## Dados e PersistÃªncia

- `sprintActive`: estado efÃªmero â€” nÃ£o persistido (sprint sempre desligado ao reabrir)
- `gameTick` para sincronizar fome: jÃ¡ persistido

## DependÃªncias e Premissas

- O sistema de fome da PRD-015 deve estar implementado
- `WorldConfig.maxHunger = 10` e `hungerDrainInterval = 24` sÃ£o os valores base
- `GameApp.js` jÃ¡ gerencia `hungerState` e `spawnDrainTimer`

## CritÃ©rios de Aceite

- [ ] **CA-01:** pressionar Ctrl uma vez â†’ jogador comeÃ§a a correr sem segurar a tecla
- [ ] **CA-02:** pressionar Ctrl de novo â†’ sprint Ã© desativado
- [ ] **CA-03:** double-tap W (< 300ms) ativa o sprint
- [ ] **CA-04:** parar de andar cancela o sprint automaticamente
- [ ] **CA-05:** agachar cancela o sprint
- [ ] **CA-06:** FOV aumenta suavemente ao iniciar sprint e volta ao normal ao parar
- [ ] **CA-07:** barra de fome cai notavelmente mais rÃ¡pido ao correr do que andando
- [ ] **CA-08:** pular reduz fome em 0.5 pontos por pulo
- [ ] **CA-09:** sprint nÃ£o funciona na Ã¡gua ou voando
- [ ] **CA-10:** `npm test` e `npm run test:harness` passam

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tÃ©cnica | [PRD-TECNICA-020-sprint-toggle-fome.md](./PRD-TECNICA-020-sprint-toggle-fome.md) |
| Tasks | [tasks/](./tasks/) |

