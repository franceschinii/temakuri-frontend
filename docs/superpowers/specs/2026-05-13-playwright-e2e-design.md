# Temakuri Frontend — Playwright E2E Coverage

**Data**: 2026-05-13
**Status**: Aprovado pelo usuário; pendente implementação
**Entrega**: commits locais em `feat/playwright-e2e` (frontend) + adições mínimas no backend se necessário; PR único ao final.

## Objetivo

Cobrir o frontend Temakuri com testes Playwright end-to-end focados em **partidas reais com bots**. O navegador (Playwright) age como usuário humano: registra, cria sala, adiciona bots, inicia, e observa o jogo até o `GameOverModal`. Cobre também o que envolve uma partida: forms (auth, lobby), modals durante o jogo (rules, trick-pick, duel-pass-pick, game-over), interações (chat, reaction, rules), e reconnect.

## Abordagem

**Approach 1 — live stack + unique users**. Roda contra a stack docker compose existente (backend `:3001` + frontend `:5173`). Cada teste cria usuário com nome único `pw-{testSuite}-{Date.now()}-{rand}` — sem DB reset, sem isolamento por suite. State accumulator no DB de dev é cosmético e limpável com um delete prefixed.

Adiciona ~75 atributos `data-testid` ao frontend para seletores estáveis (mudança puramente aditiva, ~1 linha cada).

## Estrutura

```
temakuri-frontend/
├── e2e/
│   ├── playwright.config.ts
│   ├── fixtures/
│   │   ├── auth.ts                   # registerNewUser, setAuthInStorage
│   │   ├── room.ts                   # createRoomWithBots, addBot, unlockMode, setLevel
│   │   └── db.ts                     # `pg` Pool, helpers SQL raw
│   ├── pages/
│   │   ├── LobbyPage.ts
│   │   ├── GamePage.ts
│   │   └── GameOverModal.ts
│   └── tests/
│       ├── 01-auth.spec.ts           # register + login + validações
│       ├── 02-lobby.spec.ts          # create-room form + validações + mode/ranked locks
│       ├── 03-game-traditional.spec.ts
│       ├── 04-game-mercado.spec.ts
│       ├── 05-game-rodizio.spec.ts
│       ├── 06-game-duelo.spec.ts
│       ├── 07-ingame-interactions.spec.ts
│       └── 08-reconnect.spec.ts
```

## Mudanças no frontend

### Atributos `data-testid` (~75 testids em ~15 arquivos)

Adições aditivas, ~1 linha cada:

- **Auth forms**: register-{username,email,password}-input, register-submit, register-error-{username,email,password,duplicate}, login-* (similar), guest-login-btn
- **AccessBar**: access-bar-{username,coins,level,pds,avatar,profile-link,leaderboard-link,shop-btn,logout-btn}
- **Lobby**: lobby-{create-room-btn,matchmaking-btn,room-card-{code},room-join-btn-{code}}, create-room-modal, create-room-{mode-{MODE},max-players,initial-tokens,hand-bias-{value},private-toggle,ranked-toggle,submit,error}, matchmaking-{dialog,start-btn,cancel-btn,status}
- **Room pre-game**: room-{code-display,player-{userId},player-ready-{userId},ready-btn,start-btn,add-bot-btn,remove-bot-btn-{userId},leave-btn}
- **Game board**: game-{board,phase-{phase},action-play-btn,action-pass-btn}, player-hand, player-hand-card-{index}, market-{row,card-{index}}, play-area, pile-card-{index}, pile-count, draw-pile-count
- **Game state**: turn-{timer,timer-progress}, sabor-{indicator,min-required}, token-display-{userId}, tokens-remaining-{userId}, current-turn-indicator-{userId}, opponent-row-{userId}, opponent-card-count-{userId}, action-history-{panel,entry-{idx}}
- **Side panels**: chat-{panel,toggle-btn,input,send-btn,message-{idx}}, reaction-{bar,btn-{emoji}}, rules-{dialog,dialog-open-btn,dialog-close-btn}
- **Game modals**: trick-pick-{modal,take-btn,discard-btn,card-{idx}}, duel-{pass-pick-modal,plate-{index},pass-pick-insert-btn,pass-pick-discard-btn}, game-over-{modal,restart-btn,leave-btn,ranking-row-{placement},rewards-{coins,xp,pds}}
- **Profile**: profile-{username,avatar,level,stats-{games-played,games-won,sabor-triggers},edit-avatar-btn}
- **Leaderboard**: leaderboard-{table,row-{rank},username-{rank},pds-{rank}}
- **Shop modal**: shop-{modal,tab-avatars,tab-modes,avatar-{index},mode-{mode},buy-btn,balance,error}

## Infra Playwright

### Config (`playwright.config.ts`)

- `baseURL: 'http://localhost:5173'`
- `webServer: undefined` (assume docker compose up rodando)
- `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]` — Phase 1 apenas Chromium
- `testDir: './e2e/tests'`
- `timeout: 60_000`
- `retries: process.env.CI ? 1 : 0`
- `fullyParallel: false` — por causa do DB compartilhado e WS state
- `workers: 1` — serializa pra evitar race conditions

### Fixtures

**`fixtures/auth.ts`**:
```ts
export async function registerNewUser(request: APIRequestContext, suite: string): Promise<{
  username: string; email: string; password: string;
  accessToken: string; refreshToken: string; userId: string;
}>;
// username = `pw-${suite}-${Date.now()}-${rand}`

export async function setAuthInStorage(page: Page, auth: AuthBundle): Promise<void>;
// Pre-popula localStorage['temakuri-auth'] antes de page.goto
```

**`fixtures/room.ts`**:
```ts
export async function createRoomWithBots(
  request: APIRequestContext,
  token: string,
  opts: { mode?: string; maxPlayers?: number; botCount?: number; isRanked?: boolean }
): Promise<{ code: string; room: any }>;

export async function unlockMode(userId: string, mode: string): Promise<void>;
// via pg raw SQL (UPSERT em UserInventory)

export async function setLevel(userId: string, level: number): Promise<void>;
// UPDATE "User" SET level = ... WHERE id = ...
```

**`fixtures/db.ts`** — Pool `pg` lendo `DATABASE_URL` do env. Helpers usam o pool.

### Page Objects

**`LobbyPage.ts`**:
- `openCreateRoomModal()`, `fillCreateRoomForm(opts)`, `submitCreateRoom()`
- `expectErrorMessage(text)`, `expectRedirectToRoom()`

**`GamePage.ts`**:
- `expectGameBoardVisible()`, `getPlayerHandCount()`, `selectCard(index)`, `clickPlay()`, `clickPass()`
- `expectPhase(phase)`, `expectTurnTimerVisible()`
- `openChatPanel()`, `sendMessage(text)`, `sendReaction(emoji)`, `openRulesDialog()`

**`GameOverModal.ts`**:
- `expectVisible()`, `getRankings()`, `getRewards()`, `clickRestart()`, `clickLeave()`

## Cenários por arquivo (~13 testes)

### `01-auth.spec.ts` (4 tests)
1. `register form: happy path → redirect to /lobby` — preenche, submit, espera redirect, AccessBar mostra username
2. `register form: email inválido mostra erro` — submete `not-an-email`, espera `register-error-email` visível
3. `register form: password curto mostra erro` — `123`, espera erro
4. `login form: happy path` — usuário pré-existente loga via UI

### `02-lobby.spec.ts` (4 tests)
1. `create room: TRADITIONAL public happy path → redirect to /lobby/:code` — preenche form, submit, vê código da sala
2. `create room: maxPlayers fora do range mostra erro` — tenta 7
3. `create room: MERCADO sem unlock mostra erro` (usuário não unlocked) — submit, vê `create-room-error`
4. `create room: ranked com level < 10 mostra erro` — submit ranked, vê erro

### `03-game-traditional.spec.ts` (1 test)
1. `4P TRADITIONAL completo: user + 3 bots → start → GameOverModal aparece com 4 rankings` — usa fixture `createRoomWithBots`, navega manualmente pra `/game/:code`, espera `game-over-modal` aparecer (timeout 30s)

### `04-game-mercado.spec.ts` (1 test)
1. `4P MERCADO: unlock via fixture → start → game completes → market_row visível durante jogo` — pre-unlock via `unlockMode`, depois flow normal, assert `market-row` apareceu

### `05-game-rodizio.spec.ts` (1 test)
1. `4P RODIZIO: unlock via fixture → completes → ≥1 mudança de turn observada` — verifica `current-turn-indicator` muda pelo menos 1 vez

### `06-game-duelo.spec.ts` (1 test)
1. `2P (Duelo): user + 1 bot → completes → 2 rankings no GameOverModal`

### `07-ingame-interactions.spec.ts` (3 tests)
1. `rules dialog abre e fecha sem afetar jogo` — clica `rules-dialog-open-btn`, vê `rules-dialog`, fecha
2. `enviar reaction não dispara erro` — clica `reaction-btn-{emoji}`, sem alert/error visible
3. `enviar chat message aparece na lista` — type + send, vê `chat-message-{idx}` com o texto

### `08-reconnect.spec.ts` (1 test)
1. `fecha aba mid-game, reabre, recebe estado` — start game, espera 2s, `page.close()`, abre nova `page`, `setAuthInStorage`, `goto('/game/:code')`, vê `game-board` (mesmo que GAME_OVER se bots terminaram)

## Cleanup

- Cada test usa username único `pw-{suite}-{ts}-{rand}` — sem conflito
- `afterAll` opcional na suite: `pool.query("DELETE FROM \"User\" WHERE username LIKE 'pw-%' AND \"createdAt\" < NOW() - INTERVAL '1 hour'")` — limpa usuários antigos de runs anteriores

## Volume estimado

| Item | Quantidade |
|---|---|
| Arquivos novos | ~17 (8 specs + 3 page objects + 3 fixtures + config + dois auxiliares) |
| Testids no frontend | ~75 atributos em ~15 arquivos |
| Tests | ~13 testes |
| Duração suite | ~8-12 min (não paralelo) |
| Production code change | apenas atributos `data-testid` (aditivos, nada de lógica) |

## Workflow

- Cada sessão = commits locais; ao final = PR único.
- Branch `feat/playwright-e2e` criada do `main` do frontend.
- **NÃO pushar** sem autorização explícita (preferência do usuário).

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Falta de testids quebra seletores | Adicionar testids primeiro (Task 2), antes dos tests |
| Bots demoram > 30s pra terminar | `TURN_TIMEOUT_MS=100ms` já configurado em `.env.test` (mas precisa também afetar dev DB — se não, partidas dev demoram 30s/turno). Usar timeout generoso (60s) |
| Race entre `lobby:start_game` e navigation | Espera explícita por `game-board` testid antes de assertar |
| WS pendurado entre tests | Cada test fecha a page; Playwright fecha browser context entre tests |
| DB de dev acumula pw-* | Limpeza via `DELETE WHERE username LIKE 'pw-%'` quando precisar |

## Fora de escopo (futuras layers/PRs)

- Múltiplos humanos em 1 partida (precisaria de 2+ browser contexts em paralelo)
- Cross-browser (Firefox, WebKit) — Phase 1 só Chromium
- Visual regression / screenshots
- Performance / load testing
- Admin UI (admin pages)
- Forgot password / reset password full flow
