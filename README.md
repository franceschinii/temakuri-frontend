# Temakuri — Frontend

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App sobe em http://localhost:5173

## Variáveis de ambiente

| Var | Valor padrão | Descrição |
|-----|-------------|-----------|
| VITE_API_URL | http://localhost:3001/api/v1 | URL da API REST |
| VITE_WS_URL | ws://localhost:3001/ws | URL do WebSocket |

## Rodando testes

### Unit (Vitest)

Roda em happy-dom, sem stack nem banco:

```bash
npm run test       # watch mode
npm run test:run   # uma vez
```

### E2E (Playwright)

Bots jogando partidas reais (~18 testes). Pré-requisitos:

1. **Chrome do sistema** instalado (config em `playwright.config.ts`: `executablePath: '/usr/bin/google-chrome'` — ajuste para macOS se necessário).
2. **Stack acessível** em `localhost:3001` (backend), `localhost:5173` (frontend, dev server) e `localhost:5432` (Postgres). Pode rodar via docker-compose ou nativo.
3. **Banco de dev com schema atualizado** (`prisma db push` ou `migrate deploy` no backend). Os testes criam usuários efêmeros com prefixo `pw-*` no DB e podem ser limpos depois com `DELETE FROM "User" WHERE username LIKE 'pw-%'`.

```bash
npm run test:e2e          # headless
npm run test:e2e:headed   # com Chrome visível
npm run test:e2e:ui       # Playwright UI mode (interativo)
```

Os testes usam `channel: 'chrome'` (não Chromium) — Chromium falha no Alpine musl quando lançado pelo Playwright.

Design completo (fixtures, page objects, ~75 `data-testid` adicionados ao código) em [`docs/superpowers/specs/2026-05-13-playwright-e2e-design.md`](docs/superpowers/specs/2026-05-13-playwright-e2e-design.md).
