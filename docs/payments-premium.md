# Plano (frontend): Diamantes + Premium + Loja Expandida

> Branch: `feat/payments-premium`. Esta é a parte **frontend** do plano.
> Para infra de pagamento + modelo de dados, ver `temakuri-backend/docs/payments-premium.md`.
> Plano mestre: `~/.claude/plans/cara-no-celular-a-shimmering-cosmos.md`.

---

## Estratégia em duas fases

**Fase A — agora (sem Stripe ativo):**
- `DiamondDisplay` aparece no HUD com saldo (zero por padrão).
- ShopModal ganha tabs `diamantes`, `premium`, `temas`.
- Catálogo de itens pra gastar diamante já é exibido — botões "Em breve" se `VITE_PAYMENTS_ENABLED=false`.
- Admin pode creditar diamantes em testes (UI no admin panel).

**Fase B — quando Stripe estiver configurado:**
- Setar `VITE_PAYMENTS_ENABLED=true`.
- Botões de comprar diamantes e assinar Premium ficam ativos.
- Rotas `/payments/success`, `/payments/cancel`, `/payments/pending` ficam acionáveis.

---

## Variáveis de ambiente (`.env`)

```env
VITE_PAYMENTS_ENABLED=false
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Adicionar mesmas chaves em `.env.example` (sem valores).

`VITE_PAYMENTS_ENABLED === 'true'` controla os CTAs no ShopModal e nas rotas `/payments/*`. Off = "Em breve" desabilitado.

---

## Itens visuais

### Avatares premium novos (slots 9–14)

Implementados como SVGs em `src/components/ui/Avatar.tsx` seguindo o padrão dos slots 0-8 (auto-contidos com `useId()` pra IDs únicos).

| Slot | Nome | Estilo | Preço |
|---|---|---|---|
| 9  | Yokai          | Máscara oni vermelha com chifres                  | 80 💎  |
| 10 | Kitsune        | Raposa branca com 9 caudas estilizadas            | 80 💎  |
| 11 | Tanuki         | Texugo japonês com folha na cabeça                | 80 💎  |
| 12 | Geisha         | Rosto perfil com leque                            | 200 💎 |
| 13 | Samurai        | Capacete com chifres dourados                     | 200 💎 |
| 14 | Dragão Dourado | Cabeça de dragão com escamas + brilho             | 800 💎 |

### Temas de mesa

Aplicados via classe `data-theme` no `<body>` da rota `/game/:code` quando `user.activeTheme === 'X'`. Variáveis CSS em `src/styles/themes.css` definem o background da mesa.

| Key | Nome | Visual | Preço |
|---|---|---|---|
| `bambu`  | Bambu Verde | Padrão repetitivo, paleta verde-escuro                        | 150 💎 |
| `sakura` | Sakura      | Pétalas rosa caindo (gradient estático com partículas leves)  | 250 💎 |
| `oni`    | Oni         | Vermelho profundo com gradiente dourado, chamas               | 400 💎 |

---

## Estrutura de código

```
src/
├── components/
│   ├── shop/
│   │   ├── ShopModal.tsx                # JÁ EXISTE — expandido com tabs
│   │   ├── DiamondPacks.tsx             # NOVO — tab Diamantes
│   │   ├── PremiumCard.tsx              # NOVO — tab Premium
│   │   └── ThemeCatalog.tsx             # NOVO — tab Temas
│   └── ui/
│       ├── DiamondDisplay.tsx           # NOVO — ícone + valor (padrão CoinDisplay)
│       └── DiamondIcon.tsx              # NOVO — SVG do diamante
├── routes/
│   └── payments/
│       ├── success.tsx                  # callback success Stripe
│       ├── cancel.tsx                   # callback cancel
│       └── pending.tsx                  # Pix em processamento
└── styles/
    └── themes.css                       # NOVO — bambu, sakura, oni
```

---

## Fluxos UI

### Comprar diamantes

1. Usuário abre ShopModal → tab **Diamantes**.
2. Vê 4 cards (`DIAMONDS_100/500/1200/3000`) com diamantes, preço R$, badge de bônus (+2%, +22%, +50%).
3. Se `VITE_PAYMENTS_ENABLED=false` → botões desabilitados com label "Em breve".
4. Senão: clica "Comprar 500 💎 — R$ 19,90".
5. Confirmação inline com preço e bônus.
6. Confirma → `POST /payments/diamonds/checkout` → recebe `{ url }`.
7. `window.location.href = url` (redirect Stripe).
8. Após pagar, Stripe redireciona para `/payments/success?session_id=...`.
9. Rota `success.tsx`:
   - Mostra spinner "Confirmando pagamento...".
   - Polling de `/auth/me` a cada 1s por até 10s (webhook pode demorar 1-2s).
   - Quando `user.diamonds` aumenta, mostra "Pagamento confirmado! +500 💎" + botão "Voltar ao lobby".

### Assinar Premium

1. ShopModal → tab **Premium**.
2. Card grande com benefícios:
   - 50 💎 por mês
   - Sem anúncios
   - Todos os modos liberados
   - Badge premium no perfil e em listas
3. Off: "Em breve".
4. On: clica "Assinar R$ 7,90/mês" → `POST /payments/premium/checkout` → redirect.
5. Volta para `/payments/success` → vê "Premium ativo até DD/MM/AAAA".
6. Se já é premium: card mostra "Renova em DD/MM" + botão "Gerenciar assinatura" → `POST /payments/portal` → redirect Customer Portal.

### Esconder ads pra Premium

`src/components/ui/AdBanner.tsx` já tem:
```tsx
if (user?.isPremium) return null;
```
Nada a fazer.

### HUD com saldo de diamantes

Ao lado do `CoinDisplay` em todos os HUDs (AppNavbar, ProfilePage, ShopModal, GameOverModal):

```tsx
<CoinDisplay amount={user.coins} />
<DiamondDisplay amount={user.diamonds} />
```

### Aplicar tema na mesa

No `GameBoard.tsx`, no `useEffect` de mount:

```tsx
useEffect(() => {
  if (user?.activeTheme) {
    document.body.setAttribute('data-theme', user.activeTheme);
  }
  return () => document.body.removeAttribute('data-theme');
}, [user?.activeTheme]);
```

`themes.css` define `[data-theme="bambu"] { --color-base: ...; }` etc.

---

## Componente DiamondIcon (SVG geométrico)

```tsx
export function DiamondIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="diamond-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d="M12 2 L22 9 L12 22 L2 9 Z" fill="url(#diamond-grad)" stroke="#0891b2" strokeWidth="0.5" />
      <path d="M12 2 L7 9 L17 9 Z" fill="rgba(255,255,255,0.3)" />
      <path d="M12 2 L17 9 L12 22 Z" fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}
```

Usa `useId()` se múltiplas instâncias na tela (mesmo padrão dos avatares).

---

## Rotas novas

| Rota | Componente | Propósito |
|---|---|---|
| `/payments/success` | `success.tsx` | Stripe redireciona aqui após pagamento aprovado |
| `/payments/cancel`  | `cancel.tsx`  | Stripe redireciona após cancelamento |
| `/payments/pending` | `pending.tsx` | Pix em confirmação — spinner + status |

Todas refazem fetch de `/auth/me` para atualizar saldos.

---

## Plano de execução (frontend, pareado com backend)

### Fase A

**Commit 1** — Bugs prévios + Como jogar universal
- `gameStore`: centralizar reset de `selectedIndices`.
- `RoundSummary`: impedir auto-close mobile.
- `RulesModal` em todas as telas no desktop (passar `onHowToPlay` ao `AppNavbar`).

**Commit 2** — Schema + DiamondDisplay + HUD
- `DiamondIcon.tsx` + `DiamondDisplay.tsx`.
- HUD mostra saldo de diamantes (zero por padrão).
- Tipo `User` no `authStore` ganha `diamonds`, `premiumExpiresAt`, `activeTheme`.
- Admin UI: botão "Creditar diamantes" no `PlayerDetailsDialog` ou no editor de progressão.

**Commit 3** — Catálogo expandido
- 6 avatares novos (slots 9-14) como SVGs em `Avatar.tsx`.
- 3 temas (CSS + preview SVG).
- ShopModal com 5 tabs: avatares, modos, **diamantes**, **premium**, **temas**.
- Itens compráveis com diamantes funcionam (gasto de diamantes não depende do Stripe).
- Botões de **comprar diamantes** e **assinar premium** abrem dialog "em breve" se `VITE_PAYMENTS_ENABLED=false`.

**Commit 4** — Skeleton dos checkouts (atrás da flag)
- Funções `purchaseDiamonds(sku)` e `subscribePremium()` no `useShopStore` que chamam `/payments/*/checkout`.
- Tratamento de 503 ("Pagamentos temporariamente indisponíveis").
- Rotas `/payments/success`, `/payments/cancel`, `/payments/pending` criadas, mostram "Em breve" se flag off.

**Commit 5** — Changelog + PR draft
- Bump `0.6.0-beta`.
- Changelog em linguagem de jogador.

### Fase B

Setar `VITE_PAYMENTS_ENABLED=true` e validar fluxo end-to-end com Stripe CLI.

---

## Verificação visual

1. HUD mostra `CoinDisplay` + `DiamondDisplay` lado a lado.
2. ShopModal tem 5 tabs.
3. Tab Diamantes mostra 4 packs com "Em breve" enquanto flag off.
4. Tab Premium mostra benefícios com "Em breve" enquanto flag off.
5. Tab Temas mostra 3 temas; clicar tenta comprar com diamantes (admin cred + testar).
6. Avatares 9-14 visíveis na tab Avatares com badge 💎; comprar funciona com diamantes.
7. AdBanner some quando `isPremium=true`.
8. Após pagamento real (Fase B sandbox), saldo atualiza ao retornar para `/payments/success`.
9. **Mobile e desktop** do jogo intocados visualmente.
