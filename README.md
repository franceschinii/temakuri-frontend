# Temakuri — Frontend

Interface do jogo de cartas multiplayer Temakuri. React 19 + TypeScript, comunicação em tempo real via Socket.IO, animações com Framer Motion.

**Repositório backend:** [temakuri-backend](https://github.com/franceschinii/temakuri-backend)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Roteamento | React Router 7 |
| Estado global | Zustand 5 |
| Dados remotos | TanStack React Query 5 |
| HTTP | Axios |
| Tempo real | Socket.IO Client 4 |
| Animações | Framer Motion 12 |
| UI | Radix UI + Tailwind CSS 4 |
| Formulários | React Hook Form + Zod |
| Ícones | Lucide React |
| Toasts | Sonner |
| Testes unitários | Vitest + Happy DOM |
| Testes E2E | Playwright |

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App sobe em `http://localhost:5173`. O backend precisa estar rodando em `localhost:3001`.

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `http://localhost:3001/api/v1` | URL da API REST |
| `VITE_WS_URL` | `ws://localhost:3001/ws` | URL do WebSocket |
| `VITE_PAYMENTS_ENABLED` | `false` | Exibe ou oculta loja de diamantes/premium |

---

## Estrutura de pastas

```
src/
├── App.tsx                  # Rotas + guards de autenticação
├── main.tsx                 # Entry point — providers, socket reconnect
├── components/
│   ├── game/                # GameBoard, PlayerHand, ActionBar, CardComponent...
│   ├── lobby/               # RoomCard, CreateRoomModal, HelpModal...
│   ├── matchmaking/         # MatchmakingDialog
│   ├── profile/             # MatchHistoryList
│   ├── shop/                # ShopModal
│   ├── tour/                # ProjectTour (spotlight de onboarding)
│   ├── tutorial/            # TutorialOverlay
│   └── ui/                  # Componentes base (Button, Modal, AppNavbar...)
├── hooks/
│   ├── useGame.ts           # Ações do jogo (play, pass, swap, react)
│   ├── useSocket.ts         # Subscribe a eventos WebSocket
│   ├── useOnlineCount.ts    # Contagem de jogadores online
│   ├── useTourFlag.ts       # Flag de first-time por userId
│   └── useTutorialFlow.ts   # Steps reativos do tutorial
├── stores/
│   ├── authStore.ts         # Usuário, token, login, logout
│   ├── gameStore.ts         # Mão, pilha, fase, reações — sincronizado via WS
│   ├── lobbyStore.ts        # Sala atual, lista de salas
│   ├── shopStore.ts         # Catálogo, compras
│   └── tutorialStore.ts     # Motor local da partida de tutorial
├── routes/                  # Páginas (lazy loaded)
│   ├── index.tsx            # Landing page
│   ├── auth/                # Login, registro, recuperação de senha
│   ├── lobby/               # Lista de salas + sala de espera
│   ├── game/                # Tela de jogo (GameBoard)
│   ├── tutorial/            # Partida simulada de tutorial
│   ├── profile/             # Perfil e histórico
│   ├── ranked/              # Leaderboard
│   ├── payments/            # Pós-compra (sucesso, cancelamento, pendente)
│   └── admin/               # Painel administrativo
├── types/
│   ├── game.ts              # Card, GamePhase, GameMode, PublicPlayerState...
│   └── api.ts               # User, ShopCatalog, GameRank...
├── constants/
│   └── cards.ts             # CATEGORY_EMOJI, CATEGORY_COLOR, CATEGORY_DISPLAY
├── lib/
│   ├── api.ts               # Axios com interceptor de refresh token
│   ├── socket.ts            # Socket.IO singleton com reconexão automática
│   ├── gameRules.ts         # Validação de jogada no cliente
│   ├── music.ts             # Controle de trilha sonora por rota
│   └── sounds.ts            # Efeitos sonoros
└── styles/
    ├── globals.css          # CSS custom properties (cores, fontes)
    └── themes.css           # Temas alternativos (oceano, oni...)
```

---

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Pública | Landing page — login, guest, acesso rápido |
| `/auth/login` | Pública | Login com email e senha |
| `/auth/register` | Pública | Cadastro de conta |
| `/auth/forgot-password` | Pública | Solicitação de redefinição de senha |
| `/auth/reset-password` | Pública | Redefinição com token por email |
| `/legal` | Pública | Termos de uso e política de privacidade |
| `/lobby` | Auth | Lista de salas públicas, criar sala, matchmaking |
| `/lobby/:roomCode` | Auth | Sala de espera — configuração e ready |
| `/game/:roomCode` | Auth | Partida em andamento |
| `/tutorial` | Auth | Partida simulada de tutorial (sem backend) |
| `/profile` | Auth | Perfil, inventário, histórico de partidas |
| `/ranked` | Auth | Leaderboard e histórico ranked |
| `/payments/*` | Auth | Pós-processamento de pagamento |
| `/admin` | Admin | Gerenciamento de conteúdo e usuários |

---

## Fluxo principal

```
Landing (/) → Login → Lobby (/lobby)
                              ↓
                    Criar / Entrar em sala
                              ↓
                    Sala de espera (/lobby/:code)
                    Host configura modo e tokens
                    Todos marcam "Pronto"
                              ↓
                    Partida (/game/:code)
                    Turnos via WebSocket em tempo real
                    Rodadas até restar 1 jogador sem pratos
                              ↓
                    Game Over → Recompensas → Lobby
```

---

## Estados Zustand

### `authStore` — persistido no localStorage
```ts
{ user, accessToken, isGuest }
// login(), register(), loginAsGuest(), logout(), refreshUser()
```

### `gameStore` — não persistido (em memória, sincronizado via WS)
```ts
{ phase, mode, round, myHand, players, pile, market, duelPlates,
  saborActive, selectedIndices, gameLog, reactions }
// syncState(), toggleCardSelection(), applyCardsPlayed()...
```

### `lobbyStore` — não persistido
```ts
{ rooms, currentRoom, readyMap }
```

### `tutorialStore` — não persistido (motor local do tutorial)
```ts
{ phase, myHand, botCardCount, pile, drawPileCount, myTokens, botTokens,
  selectedIndices, drawnCard, roundResult, winner }
// startGame(), toggleCard(), playSelected(), pass(), nextRound()
```

---

## Onboarding

**Project Tour** — guia interativo com spotlight que aparece automaticamente na primeira visita ao lobby. A flag `temakuri-tour-seen-{userId}` é salva no localStorage. Pode ser reaberto via "Refazer tour guiado" no modal de ajuda.

**Tutorial Mode** — rota `/tutorial` com partida 1v1 contra bot simulada 100% no frontend. Não depende de backend. Motor completo com baralho, turnos, passes, tokens e detecção de game over. Acessível pelo botão "Tutorial" no lobby.

---

## Temas visuais

O app suporta temas alternativos aplicados via `data-theme` no `<body>`. O tema ativo do usuário é armazenado em `user.activeTheme` e aplicado automaticamente após login. Temas disponíveis: padrão, oceano, oni (e outros desbloqueáveis na loja).

---

## Testes

### Unit (Vitest)

Roda em Happy DOM, sem stack, sem banco:

```bash
npm run test       # watch mode
npm run test:run   # execução única
```

### E2E (Playwright)

Bots jogando partidas reais (~18 testes). Pré-requisitos:

1. **Chrome do sistema** instalado — config em `playwright.config.ts` (`executablePath: '/usr/bin/google-chrome'`, ajuste no macOS se necessário)
2. **Stack local acessível:** backend em `localhost:3001`, frontend dev server em `localhost:5173`, Postgres em `localhost:5432`
3. **Schema atualizado** no banco de dev (`prisma db push` ou `migrate deploy` no backend)

Os testes criam usuários efêmeros com prefixo `pw-*`. Para limpar após rodar:

```sql
DELETE FROM "User" WHERE username LIKE 'pw-%';
```

```bash
npm run test:e2e           # headless
npm run test:e2e:headed    # com Chrome visível
npm run test:e2e:ui        # Playwright UI mode interativo
```

Os testes usam `channel: 'chrome'` (não Chromium) — o Chromium falha no Alpine musl quando lançado pelo Playwright.

Design completo (fixtures, page objects, ~75 `data-testid`) em [`docs/superpowers/specs/2026-05-13-playwright-e2e-design.md`](docs/superpowers/specs/2026-05-13-playwright-e2e-design.md).
