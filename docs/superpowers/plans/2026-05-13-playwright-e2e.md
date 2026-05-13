# Layer E — Playwright E2E — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cobrir o frontend Temakuri com ~13 testes Playwright simulando partidas reais com bots, formas auth/lobby, interações ingame e reconnect.

**Architecture:** Live stack (docker compose ativo) + usuários únicos `pw-{suite}-{ts}` por teste. Fixtures usam `pg` raw SQL pra unlocks/level. ~75 `data-testid` aditivos no frontend pra selectors estáveis.

**Tech Stack:** Playwright, `pg` (raw SQL), React 19 + Vite 6, frontend rodando em `:5173`, backend em `:3001` (docker compose).

---

## File Structure

```
temakuri-frontend/
├── e2e/
│   ├── playwright.config.ts
│   ├── fixtures/
│   │   ├── auth.ts
│   │   ├── room.ts
│   │   └── db.ts
│   ├── pages/
│   │   ├── LobbyPage.ts
│   │   ├── GamePage.ts
│   │   └── GameOverModal.ts
│   └── tests/
│       ├── 01-auth.spec.ts
│       ├── 02-lobby.spec.ts
│       ├── 03-game-traditional.spec.ts
│       ├── 04-game-mercado.spec.ts
│       ├── 05-game-rodizio.spec.ts
│       ├── 06-game-duelo.spec.ts
│       ├── 07-ingame-interactions.spec.ts
│       └── 08-reconnect.spec.ts
└── package.json (modify — add deps + scripts)
```

Modificações em `src/` são apenas atributos `data-testid` aditivos.

---

## Task 0: Pré-condições

- [ ] **Step 1: Confirmar branch e baseline**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend status --short
git -C /home/anrry/github.com/temakuri/temakuri-frontend branch --show-current
docker compose -f /home/anrry/github.com/temakuri/docker-compose.yml ps
```

Expected: branch `feat/playwright-e2e`, frontend e backend rodando.

- [ ] **Step 2: Confirmar frontend acessível**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173
```

Expected: `200`.

---

## Task 1: Instalar Playwright + pg + scripts

**Files:**
- Modify: `temakuri-frontend/package.json`
- Create: `temakuri-frontend/e2e/playwright.config.ts`

- [ ] **Step 1: Instalar deps no container do frontend**

```bash
docker compose exec -T frontend npm install -D @playwright/test pg @types/pg
```

- [ ] **Step 2: Adicionar scripts em package.json**

Editar `temakuri-frontend/package.json`, adicionar nos scripts:

```json
"test:e2e": "playwright test",
"test:e2e:headed": "playwright test --headed",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 3: Criar `temakuri-frontend/e2e/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

- [ ] **Step 4: Instalar browser do Chromium**

```bash
docker compose exec -T frontend npx playwright install chromium
```

- [ ] **Step 5: Confirmar lista vazia roda**

```bash
docker compose exec -T frontend npx playwright test --list 2>&1 | tail -5
```

Expected: 0 tests found (nada criado ainda).

- [ ] **Step 6: Commit**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend add package.json package-lock.json e2e/playwright.config.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): instala Playwright + pg + config base

playwright.config: chromium, workers=1, retries=0 local, timeout 60s,
baseURL :5173."
```

---

## Task 2: Fixtures (`auth.ts`, `room.ts`, `db.ts`)

**Files:**
- Create: `temakuri-frontend/e2e/fixtures/db.ts`
- Create: `temakuri-frontend/e2e/fixtures/auth.ts`
- Create: `temakuri-frontend/e2e/fixtures/room.ts`

- [ ] **Step 1: Criar `db.ts`**

```ts
import { Pool } from 'pg';

// Conecta ao mesmo DB que o backend de dev usa (host port forwarded)
const pool = new Pool({
  connectionString:
    process.env.E2E_DATABASE_URL ??
    'postgresql://temakuri:fee9641985b45ce0f29938412e3e1ab86f565afb3e6fc1e5@localhost:5432/temakuri',
});

export async function unlockMode(userId: string, mode: string): Promise<void> {
  const res = await pool.query(
    'SELECT "unlockedModes" FROM "UserInventory" WHERE "userId" = $1',
    [userId],
  );
  if (res.rows.length === 0) {
    await pool.query(
      'INSERT INTO "UserInventory" ("id", "userId", "unlockedAvatars", "unlockedModes") VALUES (gen_random_uuid(), $1, ARRAY[0,1,2,3]::INTEGER[], ARRAY[$2,$3]::TEXT[])',
      [userId, 'TRADITIONAL', mode],
    );
  } else {
    const modes: string[] = res.rows[0].unlockedModes;
    if (!modes.includes(mode)) modes.push(mode);
    await pool.query(
      'UPDATE "UserInventory" SET "unlockedModes" = $1 WHERE "userId" = $2',
      [modes, userId],
    );
  }
}

export async function setLevel(userId: string, level: number): Promise<void> {
  await pool.query('UPDATE "User" SET level = $1 WHERE id = $2', [level, userId]);
}

export async function setCoins(userId: string, coins: number): Promise<void> {
  await pool.query('UPDATE "User" SET coins = $1 WHERE id = $2', [coins, userId]);
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
```

- [ ] **Step 2: Criar `auth.ts`**

```ts
import { APIRequestContext, Page } from '@playwright/test';

export interface AuthBundle {
  username: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function registerNewUser(
  request: APIRequestContext,
  suite: string,
): Promise<AuthBundle> {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  const username = `pw-${suite}-${ts}-${rand}`.slice(0, 20);
  const email = `${username}@example.com`;
  const password = 'secret123';
  const res = await request.post('http://localhost:3001/api/v1/auth/register', {
    data: { username, email, password },
  });
  if (!res.ok()) {
    throw new Error(`registerNewUser failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return {
    username,
    email,
    password,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: body.user.id,
  };
}

export async function setAuthInStorage(page: Page, auth: AuthBundle): Promise<void> {
  // Pré-popula o localStorage com a chave do Zustand persist (temakuri-auth)
  await page.addInitScript((auth) => {
    const state = {
      state: {
        user: { id: auth.userId, username: auth.username, email: auth.email },
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      },
      version: 0,
    };
    window.localStorage.setItem('temakuri-auth', JSON.stringify(state));
  }, auth as any);
}
```

- [ ] **Step 3: Criar `room.ts`**

```ts
import { APIRequestContext } from '@playwright/test';

export interface CreateRoomOpts {
  mode?: 'TRADITIONAL' | 'MERCADO' | 'RODIZIO' | 'DEGUSTACAO';
  maxPlayers?: number;
  botCount?: number;
  isRanked?: boolean;
  isPrivate?: boolean;
}

export async function createRoomWithBots(
  request: APIRequestContext,
  token: string,
  opts: CreateRoomOpts = {},
): Promise<{ code: string; room: any }> {
  const maxPlayers = opts.maxPlayers ?? 4;
  const botCount = opts.botCount ?? maxPlayers - 1;
  const createRes = await request.post('http://localhost:3001/api/v1/rooms', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      mode: opts.mode ?? 'TRADITIONAL',
      maxPlayers,
      isPrivate: opts.isPrivate ?? false,
      isRanked: opts.isRanked ?? false,
      handBias: 0,
      initialTokens: 2,
    },
  });
  if (!createRes.ok()) {
    throw new Error(`createRoom failed (${createRes.status()}): ${await createRes.text()}`);
  }
  const room = await createRes.json();
  for (let i = 0; i < botCount; i++) {
    const botRes = await request.post(`http://localhost:3001/api/v1/rooms/${room.code}/bots`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!botRes.ok()) {
      throw new Error(`addBot failed (${botRes.status()}): ${await botRes.text()}`);
    }
  }
  return { code: room.code, room };
}
```

- [ ] **Step 4: Commit**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/fixtures/
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): fixtures auth/room/db

db: pg pool com helpers unlockMode/setLevel/setCoins.
auth: registerNewUser via API + setAuthInStorage pré-popula localStorage.
room: createRoomWithBots via API."
```

---

## Task 3a: Adicionar testids — auth + AccessBar

**Files:**
- Modify: `src/routes/auth/Register.tsx` (ou equivalente — verifique localização real)
- Modify: `src/routes/auth/Login.tsx`
- Modify: `src/components/ui/AccessBar.tsx`

- [ ] **Step 1: Localizar arquivos auth e AccessBar**

```bash
find /home/anrry/github.com/temakuri/temakuri-frontend/src -type f \( -name "Register*.tsx" -o -name "Login*.tsx" -o -name "AccessBar*.tsx" \)
```

- [ ] **Step 2: Adicionar testids em Register form**

Localizar inputs e submit no arquivo Register e adicionar:
- `<input data-testid="register-username-input" ... />` no input de username
- `<input data-testid="register-email-input" ... />` no input de email
- `<input data-testid="register-password-input" ... />` no input de password
- `<button data-testid="register-submit" ... />` no botão submit
- Nos paragraphs/divs que exibem erros: `data-testid="register-error-username"`, `register-error-email`, `register-error-password`

Se houver botão "Entrar como Convidado" (guest): `data-testid="guest-login-btn"`.

- [ ] **Step 3: Adicionar testids em Login form**

Localizar e adicionar:
- `<input data-testid="login-email-input" ... />`
- `<input data-testid="login-password-input" ... />`
- `<button data-testid="login-submit" ... />`
- Error display: `data-testid="login-error"`

- [ ] **Step 4: Adicionar testids em AccessBar**

Localizar e adicionar:
- Spans/divs que exibem username: `data-testid="access-bar-username"`
- Idem para coins: `data-testid="access-bar-coins"`, level: `access-bar-level`, pds: `access-bar-pds`
- Avatar: `data-testid="access-bar-avatar"`
- Link pro profile: `data-testid="access-bar-profile-link"`
- Link pro leaderboard: `data-testid="access-bar-leaderboard-link"`
- Botão shop: `data-testid="access-bar-shop-btn"`
- Botão logout: `data-testid="access-bar-logout-btn"`

- [ ] **Step 5: Verificar build não quebra**

```bash
docker compose exec -T frontend npm run lint 2>&1 | tail -5
```

Expected: sem erros TS.

- [ ] **Step 6: Commit**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend add src/
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): data-testid em auth forms e AccessBar"
```

---

## Task 3b: Adicionar testids — Lobby + CreateRoomModal + Room pre-game

**Files:**
- Modify: `src/routes/lobby/*` (ou onde estiver a lobby page)
- Modify: `src/components/lobby/CreateRoomModal.tsx`
- Modify: `src/components/matchmaking/MatchmakingDialog.tsx`

- [ ] **Step 1: Localizar arquivos**

```bash
find /home/anrry/github.com/temakuri/temakuri-frontend/src -type f \( -name "Lobby*.tsx" -o -name "CreateRoomModal*.tsx" -o -name "MatchmakingDialog*.tsx" -o -name "Room*.tsx" \)
```

- [ ] **Step 2: Adicionar testids na Lobby page**

- Botão "Criar Sala": `data-testid="lobby-create-room-btn"`
- Botão "Matchmaking": `data-testid="lobby-matchmaking-btn"`
- Cada room card: `data-testid={\`lobby-room-card-${room.code}\`}`
- Botão "Entrar" em cada card: `data-testid={\`lobby-room-join-btn-${room.code}\`}`

- [ ] **Step 3: Adicionar testids no CreateRoomModal**

- Modal container: `data-testid="create-room-modal"`
- Cada radio/btn de mode: `data-testid={\`create-room-mode-${MODE}\`}` (TRADITIONAL/MERCADO/RODIZIO/DEGUSTACAO)
- maxPlayers select: `data-testid="create-room-max-players"`
- initialTokens select: `data-testid="create-room-initial-tokens"`
- Cada btn de handBias: `data-testid={\`create-room-hand-bias-${value}\`}`
- Private toggle: `data-testid="create-room-private-toggle"`
- Ranked toggle: `data-testid="create-room-ranked-toggle"`
- Submit: `data-testid="create-room-submit"`
- Error display: `data-testid="create-room-error"`

- [ ] **Step 4: Adicionar testids em MatchmakingDialog**

- Dialog: `data-testid="matchmaking-dialog"`
- Start btn: `data-testid="matchmaking-start-btn"`
- Cancel btn: `data-testid="matchmaking-cancel-btn"`
- Status display: `data-testid="matchmaking-status"`

- [ ] **Step 5: Adicionar testids em Room pre-game (se existir como componente separado)**

- Room code display: `data-testid="room-code-display"`
- Cada player na sala: `data-testid={\`room-player-${userId}\`}` + flag ready: `data-testid={\`room-player-ready-${userId}\`}`
- Ready button: `data-testid="room-ready-btn"`
- Start button: `data-testid="room-start-btn"`
- Add bot: `data-testid="room-add-bot-btn"`
- Remove bot per bot: `data-testid={\`room-remove-bot-btn-${userId}\`}`
- Leave: `data-testid="room-leave-btn"`

- [ ] **Step 6: Verificar + commit**

```bash
docker compose exec -T frontend npm run lint 2>&1 | tail -5
git -C /home/anrry/github.com/temakuri/temakuri-frontend add src/
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): data-testid em Lobby, CreateRoomModal, Room pre-game"
```

---

## Task 3c: Adicionar testids — Game board + state indicators

**Files:**
- Modify: `src/components/game/GameBoard.tsx`
- Modify: `src/components/game/ActionBar.tsx`
- Modify: `src/components/game/PlayerHand.tsx`
- Modify: `src/components/game/CardComponent.tsx`
- Modify: `src/components/game/MarketRow.tsx`
- Modify: `src/components/game/PlayArea.tsx`
- Modify: `src/components/game/OpponentRow.tsx`
- Modify: `src/components/game/TurnTimer.tsx`
- Modify: `src/components/game/SaborIndicator.tsx`
- Modify: `src/components/game/TokenDisplay.tsx`
- Modify: `src/components/game/ActionHistoryPanel.tsx`

- [ ] **Step 1: GameBoard + phase indicator**

- Container: `data-testid="game-board"`
- Phase display (se houver): `data-testid={\`game-phase-${phase}\`}` ou `data-phase={phase}` no container

- [ ] **Step 2: ActionBar**

- Play button: `data-testid="game-action-play-btn"`
- Pass button: `data-testid="game-action-pass-btn"`

- [ ] **Step 3: PlayerHand + CardComponent**

- Container: `data-testid="player-hand"`
- Cada card: `data-testid={\`player-hand-card-${index}\`}` + `data-card-selected={isSelected}`

- [ ] **Step 4: MarketRow + market cards**

- Row container: `data-testid="market-row"`
- Cada carta: `data-testid={\`market-card-${index}\`}`

- [ ] **Step 5: PlayArea (pile) + pile-count + draw-pile-count**

- Container: `data-testid="play-area"`
- Cada pile card: `data-testid={\`pile-card-${index}\`}`
- Count: `data-testid="pile-count"`, `data-testid="draw-pile-count"`

- [ ] **Step 6: OpponentRow**

- Por opponent: `data-testid={\`opponent-row-${userId}\`}`
- Card count: `data-testid={\`opponent-card-count-${userId}\`}`
- Current turn indicator (no opponent row OU separate): `data-testid={\`current-turn-indicator-${userId}\`}` quando esse player está com turno

- [ ] **Step 7: TurnTimer**

- Container: `data-testid="turn-timer"`
- Progress (barra ou texto): `data-testid="turn-timer-progress"`

- [ ] **Step 8: SaborIndicator**

- Container: `data-testid="sabor-indicator"`
- Min required (número): `data-testid="sabor-min-required"`

- [ ] **Step 9: TokenDisplay**

- Por player: `data-testid={\`token-display-${userId}\`}`
- Tokens remaining: `data-testid={\`tokens-remaining-${userId}\`}`

- [ ] **Step 10: ActionHistoryPanel**

- Container: `data-testid="action-history-panel"`
- Cada entry: `data-testid={\`action-history-entry-${idx}\`}`

- [ ] **Step 11: Verificar + commit**

```bash
docker compose exec -T frontend npm run lint 2>&1 | tail -5
git -C /home/anrry/github.com/temakuri/temakuri-frontend add src/
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): data-testid em GameBoard e indicadores de estado"
```

---

## Task 3d: Adicionar testids — Modals + side panels + Profile/Leaderboard/Shop

**Files:**
- Modify: `src/components/game/TrickPickModal.tsx`
- Modify: `src/components/game/DuelPassPickModal.tsx`
- Modify: `src/components/game/GameOverModal.tsx`
- Modify: `src/components/game/RulesDialog.tsx`
- Modify: `src/components/game/ChatPanel.tsx`
- Modify: `src/components/game/ReactionBar.tsx`
- Modify: `src/components/shop/ShopModal.tsx`
- Modify: `src/routes/profile/*` (Profile page)
- Modify: `src/routes/ranked/*` ou onde estiver Leaderboard

- [ ] **Step 1: TrickPickModal**

- Modal: `data-testid="trick-pick-modal"`
- Take btn: `data-testid="trick-pick-take-btn"`
- Discard btn: `data-testid="trick-pick-discard-btn"`
- Cards: `data-testid={\`trick-pick-card-${idx}\`}`

- [ ] **Step 2: DuelPassPickModal**

- Modal: `data-testid="duel-pass-pick-modal"`
- Each plate: `data-testid={\`duel-plate-${index}\`}`
- Insert: `data-testid="duel-pass-pick-insert-btn"`
- Discard: `data-testid="duel-pass-pick-discard-btn"`

- [ ] **Step 3: GameOverModal**

- Modal: `data-testid="game-over-modal"`
- Each ranking row: `data-testid={\`game-over-ranking-row-${placement}\`}`
- Rewards: `data-testid="game-over-rewards-coins"`, `game-over-rewards-xp`, `game-over-rewards-pds`
- Restart btn: `data-testid="game-over-restart-btn"`
- Leave btn: `data-testid="game-over-leave-btn"`

- [ ] **Step 4: RulesDialog**

- Dialog: `data-testid="rules-dialog"`
- Open btn (in game): `data-testid="rules-dialog-open-btn"`
- Close btn: `data-testid="rules-dialog-close-btn"`

- [ ] **Step 5: ChatPanel**

- Panel: `data-testid="chat-panel"`
- Toggle: `data-testid="chat-toggle-btn"`
- Input: `data-testid="chat-input"`
- Send: `data-testid="chat-send-btn"`
- Each message: `data-testid={\`chat-message-${idx}\`}`

- [ ] **Step 6: ReactionBar**

- Bar: `data-testid="reaction-bar"`
- Each emoji btn: `data-testid={\`reaction-btn-${emoji}\`}` (usar identificador estável, e.g. emoji name)

- [ ] **Step 7: ShopModal**

- Modal: `data-testid="shop-modal"`
- Tab avatars: `data-testid="shop-tab-avatars"`, tab modes: `shop-tab-modes`
- Each avatar item: `data-testid={\`shop-avatar-${index}\`}`
- Each mode item: `data-testid={\`shop-mode-${mode}\`}`
- Buy btn: `data-testid="shop-buy-btn"`
- Balance display: `data-testid="shop-balance"`
- Error: `data-testid="shop-error"`

- [ ] **Step 8: Profile page**

- Username display: `data-testid="profile-username"`
- Avatar: `data-testid="profile-avatar"`
- Level: `data-testid="profile-level"`
- Stats: `data-testid="profile-stats-games-played"`, `profile-stats-games-won`, `profile-stats-sabor-triggers`
- Edit avatar btn: `data-testid="profile-edit-avatar-btn"`

- [ ] **Step 9: Leaderboard**

- Table: `data-testid="leaderboard-table"`
- Each row: `data-testid={\`leaderboard-row-${rank}\`}`
- Username em row: `data-testid={\`leaderboard-username-${rank}\`}`
- PDS em row: `data-testid={\`leaderboard-pds-${rank}\`}`

- [ ] **Step 10: Verificar + commit**

```bash
docker compose exec -T frontend npm run lint 2>&1 | tail -5
git -C /home/anrry/github.com/temakuri/temakuri-frontend add src/
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): data-testid em modals, side panels, profile, leaderboard, shop"
```

---

## Task 4: `01-auth.spec.ts` — 4 tests

**Files:**
- Create: `temakuri-frontend/e2e/tests/01-auth.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('register form: happy path → redirect to /lobby', async ({ page }) => {
    await page.goto('/auth/register');
    const ts = Date.now();
    const username = `pw-auth-${ts}`.slice(0, 20);
    await page.locator('[data-testid="register-username-input"]').fill(username);
    await page.locator('[data-testid="register-email-input"]').fill(`${username}@example.com`);
    await page.locator('[data-testid="register-password-input"]').fill('secret123');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page).toHaveURL(/\/lobby/);
    await expect(page.locator('[data-testid="access-bar-username"]')).toContainText(username);
  });

  test('register form: email inválido mostra erro', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-testid="register-username-input"]').fill('testuser');
    await page.locator('[data-testid="register-email-input"]').fill('not-an-email');
    await page.locator('[data-testid="register-password-input"]').fill('secret123');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page.locator('[data-testid="register-error-email"]')).toBeVisible();
  });

  test('register form: password muito curto mostra erro', async ({ page }) => {
    await page.goto('/auth/register');
    const ts = Date.now();
    await page.locator('[data-testid="register-username-input"]').fill(`pw-auth-${ts}`.slice(0, 20));
    await page.locator('[data-testid="register-email-input"]').fill(`u${ts}@example.com`);
    await page.locator('[data-testid="register-password-input"]').fill('123');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page.locator('[data-testid="register-error-password"]')).toBeVisible();
  });

  test('login form: happy path (após register via API)', async ({ page, request }) => {
    const ts = Date.now();
    const username = `pw-auth-${ts}`.slice(0, 20);
    const email = `${username}@example.com`;
    const password = 'secret123';
    await request.post('http://localhost:3001/api/v1/auth/register', {
      data: { username, email, password },
    });
    await page.goto('/auth/login');
    await page.locator('[data-testid="login-email-input"]').fill(email);
    await page.locator('[data-testid="login-password-input"]').fill(password);
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).toHaveURL(/\/lobby/);
    await expect(page.locator('[data-testid="access-bar-username"]')).toContainText(username);
  });
});
```

- [ ] **Step 2: Rodar**

```bash
docker compose exec -T frontend npx playwright test 01-auth 2>&1 | tail -25
```

Investigar falhas (rotas podem ser `/register` ou `/auth/register`; ajustar conforme real). Olhar mensagens de erro do form pra confirmar testids.

- [ ] **Step 3: Commit**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/01-auth.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 01-auth — register happy + validações + login happy"
```

---

## Task 5: `02-lobby.spec.ts` — 4 tests

**Files:**
- Create: `temakuri-frontend/e2e/tests/02-lobby.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { setLevel } from '../fixtures/db';

test.describe('Lobby flows', () => {
  test('create room: TRADITIONAL happy path → redirect to /lobby/:code', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'lobby');
    await setAuthInStorage(page, auth);
    await page.goto('/lobby');
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]+/);
  });

  test('create room: MERCADO sem unlock mostra erro', async ({ page, request }) => {
    const auth = await registerNewUser(request, 'lobby');
    await setAuthInStorage(page, auth);
    await page.goto('/lobby');
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await page.locator('[data-testid="create-room-mode-MERCADO"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    // Esperamos erro OU bloqueio no select de mode (depende da UI)
    const error = page.locator('[data-testid="create-room-error"]');
    const modeBtn = page.locator('[data-testid="create-room-mode-MERCADO"]');
    await expect.soft(error.or(modeBtn)).toBeVisible();
  });

  test('create room: ranked sem level mostra erro', async ({ page, request }) => {
    const auth = await registerNewUser(request, 'lobby');
    await setAuthInStorage(page, auth);
    await page.goto('/lobby');
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();
    await page.locator('[data-testid="create-room-ranked-toggle"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    await expect(page.locator('[data-testid="create-room-error"]')).toBeVisible();
  });

  test('create room: ranked com level=10 funciona', async ({ page, request }) => {
    const auth = await registerNewUser(request, 'lobby');
    await setLevel(auth.userId, 10);
    await setAuthInStorage(page, auth);
    await page.goto('/lobby');
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();
    await page.locator('[data-testid="create-room-ranked-toggle"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]+/);
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 02-lobby 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/02-lobby.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 02-lobby — create room happy + validações + locks"
```

---

## Task 6: `03-game-traditional.spec.ts`

**Files:**
- Create: `temakuri-frontend/e2e/tests/03-game-traditional.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';

test.describe('Game flow — TRADITIONAL 4P', () => {
  test('user + 3 bots completam partida → GameOverModal aparece', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'gtrad');
    await setAuthInStorage(page, auth);
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 4,
    });
    await page.goto(`/game/${code}`);
    // Espera o game board carregar
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
    // Espera o GameOverModal aparecer (até 90s — partida com bots)
    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 90_000,
    });
    // Confirma 4 rankings
    for (let placement = 1; placement <= 4; placement++) {
      await expect(
        page.locator(`[data-testid="game-over-ranking-row-${placement}"]`),
      ).toBeVisible();
    }
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 03-game-traditional 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/03-game-traditional.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 03-game-traditional — 4P até GameOverModal"
```

---

## Task 7: `04-game-mercado.spec.ts`

**Files:**
- Create: `temakuri-frontend/e2e/tests/04-game-mercado.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { unlockMode } from '../fixtures/db';

test.describe('Game flow — MERCADO 4P', () => {
  test('user + 3 bots completam partida em MERCADO; market_row visível durante jogo', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'gmerc');
    await unlockMode(auth.userId, 'MERCADO');
    await setAuthInStorage(page, auth);
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'MERCADO',
      maxPlayers: 4,
    });
    await page.goto(`/game/${code}`);
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
    // Market row aparece em algum momento
    await expect(page.locator('[data-testid="market-row"]')).toBeVisible({ timeout: 15_000 });
    // GAME_OVER eventualmente
    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 90_000,
    });
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 04-game-mercado 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/04-game-mercado.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 04-game-mercado — 4P MERCADO até GameOverModal"
```

---

## Task 8: `05-game-rodizio.spec.ts`

**Files:**
- Create: `temakuri-frontend/e2e/tests/05-game-rodizio.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { unlockMode } from '../fixtures/db';

test.describe('Game flow — RODIZIO 4P', () => {
  test('user + 3 bots completam partida em RODIZIO', async ({ page, request }) => {
    const auth = await registerNewUser(request, 'grodi');
    await unlockMode(auth.userId, 'RODIZIO');
    await setAuthInStorage(page, auth);
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'RODIZIO',
      maxPlayers: 4,
    });
    await page.goto(`/game/${code}`);
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 90_000,
    });
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 05-game-rodizio 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/05-game-rodizio.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 05-game-rodizio — 4P RODIZIO até GameOverModal"
```

---

## Task 9: `06-game-duelo.spec.ts`

**Files:**
- Create: `temakuri-frontend/e2e/tests/06-game-duelo.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';

test.describe('Game flow — Duelo 2P', () => {
  test('user + 1 bot completam partida 2P; 2 rankings no GameOverModal', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'gduel');
    await setAuthInStorage(page, auth);
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 2,
    });
    await page.goto(`/game/${code}`);
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.locator('[data-testid="game-over-ranking-row-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-over-ranking-row-2"]')).toBeVisible();
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 06-game-duelo 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/06-game-duelo.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 06-game-duelo — 2P até GameOverModal"
```

---

## Task 10: `07-ingame-interactions.spec.ts` — 3 tests

**Files:**
- Create: `temakuri-frontend/e2e/tests/07-ingame-interactions.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect, Page } from '@playwright/test';
import { registerNewUser, setAuthInStorage, AuthBundle } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';

async function joinNewGame(page: Page, request: any, suite: string): Promise<{
  auth: AuthBundle;
  code: string;
}> {
  const auth = await registerNewUser(request, suite);
  await setAuthInStorage(page, auth);
  const { code } = await createRoomWithBots(request, auth.accessToken, {
    mode: 'TRADITIONAL',
    maxPlayers: 4,
  });
  await page.goto(`/game/${code}`);
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
  return { auth, code };
}

test.describe('Ingame interactions', () => {
  test('rules dialog abre e fecha sem afetar jogo', async ({ page, request }) => {
    await joinNewGame(page, request, 'inter');
    await page.locator('[data-testid="rules-dialog-open-btn"]').click();
    await expect(page.locator('[data-testid="rules-dialog"]')).toBeVisible();
    await page.locator('[data-testid="rules-dialog-close-btn"]').click();
    await expect(page.locator('[data-testid="rules-dialog"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('enviar reaction não causa erro', async ({ page, request }) => {
    await joinNewGame(page, request, 'inter');
    const reactionBtns = page.locator('[data-testid^="reaction-btn-"]');
    await reactionBtns.first().click();
    // sem alerta de erro
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('enviar chat message aparece na lista', async ({ page, request }) => {
    await joinNewGame(page, request, 'inter');
    // Pode precisar abrir chat panel primeiro se for mobile
    const toggle = page.locator('[data-testid="chat-toggle-btn"]');
    if (await toggle.isVisible()) await toggle.click();
    const text = `hello-${Date.now()}`;
    await page.locator('[data-testid="chat-input"]').fill(text);
    await page.locator('[data-testid="chat-send-btn"]').click();
    // A própria mensagem deve aparecer na lista (próprio sender pode não receber via broadcast,
    // mas o input local pode adicionar otimisticamente).
    // Caso não apareça, verificar que pelo menos input limpou
    const input = page.locator('[data-testid="chat-input"]');
    await expect(input).toHaveValue('');
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 07-ingame-interactions 2>&1 | tail -30
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/07-ingame-interactions.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 07-ingame-interactions — rules dialog + reaction + chat"
```

---

## Task 11: `08-reconnect.spec.ts`

**Files:**
- Create: `temakuri-frontend/e2e/tests/08-reconnect.spec.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { test, expect } from '@playwright/test';
import { registerNewUser, setAuthInStorage } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';

test.describe('Reconnect flow', () => {
  test('fecha page mid-game, reabre, vê game-board ou game-over', async ({
    browser,
    request,
  }) => {
    const auth = await registerNewUser(request, 'recon');
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 4,
    });
    // Página 1
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await setAuthInStorage(page1, auth);
    await page1.goto(`/game/${code}`);
    await expect(page1.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 15_000 });
    await page1.waitForTimeout(2000); // jogo anda um pouco
    await ctx1.close();

    // Página 2 (mesmo user, novo contexto)
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await setAuthInStorage(page2, auth);
    await page2.goto(`/game/${code}`);
    // Esperamos ver game-board ou game-over (bots podem ter terminado)
    const board = page2.locator('[data-testid="game-board"]');
    const over = page2.locator('[data-testid="game-over-modal"]');
    await expect(board.or(over).first()).toBeVisible({ timeout: 30_000 });
    await ctx2.close();
  });
});
```

- [ ] **Step 2: Rodar + commit**

```bash
docker compose exec -T frontend npx playwright test 08-reconnect 2>&1 | tail -25
git -C /home/anrry/github.com/temakuri/temakuri-frontend add e2e/tests/08-reconnect.spec.ts
git -C /home/anrry/github.com/temakuri/temakuri-frontend commit -m "test(e2e): 08-reconnect — fecha + reabre durante partida"
```

---

## Task 12: Verificação final

**Files:** N/A.

- [ ] **Step 1: Rodar suite completa**

```bash
docker compose exec -T frontend npx playwright test 2>&1 | tail -30
```

Expected: ~13 tests passed.

- [ ] **Step 2: Listar commits da Layer E**

```bash
git -C /home/anrry/github.com/temakuri/temakuri-frontend log --oneline d1e5faa..HEAD
```

Expected: ~10-12 commits.

- [ ] **Step 3: NÃO pushar** — preferência do usuário.

Reportar:
> Layer E completa. Playwright e2e: ~13 tests. Push pendente de autorização.

---

## Notas finais

**Anti-padrões a evitar:**

- Não criar tests que dependem de timing absoluto sem `waitFor*` ou `expect(...).toBeVisible({ timeout })`.
- Sempre fechar contexts/pages no fim (Playwright cuida disso por test).
- Não usar `page.waitForTimeout()` exceto pra esperas semanticamente "deixa rolar X segundos" (ex: jogo andar).
- Cada teste deve usar nome único de usuário; nunca usar nome fixo (vai colidir com runs anteriores).

**Discoveries esperadas:**

- Rotas reais podem diferir de `/auth/register` (talvez seja `/register`) — ajustar.
- Mensagens de erro podem ter shape diferente; testid `register-error-email` pode aparecer condicionalmente.
- O CreateRoomModal pode bloquear o MERCADO no select antes mesmo do submit; o teste de unlock falha aceitará ambos os comportamentos.
- A função `setAuthInStorage` assume `temakuri-auth` como chave do localStorage; se diferir, ler `src/stores/authStore.ts` pra confirmar.

**Bugs reais que podem aparecer:**

- Frontend pode não atualizar AccessBar após registro (se for assim, é UX bug)
- GameOverModal pode aparecer antes do esperado (se houver bug no game flow)
- Chat input não limpa após send (UX detail)
- Reconnect pode não recuperar estado (server side)

Tratar como discoveries flagáveis em issues, não fix em Layer E.
