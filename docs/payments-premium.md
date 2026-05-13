# Plano (frontend): Loja de Diamantes + Premium + Avatares/Temas

> Branch: `feat/payments-premium`. Esta é a parte **frontend** do plano. Para infra de pagamento + modelo de dados, ver `temakuri-backend/docs/payments-premium.md`.

---

## Items premium (catálogo visual)

### Avatares novos (slots 8–13)

| Slot | Nome | Estilo | Preço (💎) |
|---|---|---|---|
| 8 | Yokai | Máscara oni vermelha com chifres | 80 |
| 9 | Kitsune | Raposa branca com 9 caudas estilizadas | 80 |
| 10 | Tanuki | Texugo japonês com folha na cabeça | 80 |
| 11 | Geisha | Rosto perfil com leque | 200 |
| 12 | Samurai | Capacete com chifres dourados | 200 |
| 13 | Dragão Dourado | Cabeça de dragão com escamas | 800 |

### Temas de mesa

| Key | Nome | Visual | Preço (💎) |
|---|---|---|---|
| `bambu` | Bambu Verde | Padrão repetitivo vertical, paleta verde-escuro | 150 |
| `sakura` | Sakura | Pétalas rosa caindo (gradient estático) | 250 |
| `oni` | Oni | Vermelho profundo com gradiente dourado, chamas | 400 |

Tema é aplicado via classe CSS no `<body>` da rota `/game/:code`, controlado por `user.activeTheme`.

---

## Estrutura de código (frontend)

```
src/
├── components/
│   ├── shop/
│   │   ├── ShopModal.tsx                # (existente) — expandido com tabs
│   │   ├── DiamondPacks.tsx             # Tab Diamantes
│   │   ├── PremiumCard.tsx              # Card Premium
│   │   ├── ThemeCatalog.tsx             # Tab Temas
│   │   └── BuyConfirmDialog.tsx         # Confirmação antes do checkout
│   └── ui/
│       ├── DiamondDisplay.tsx           # Ícone + valor
│       └── DiamondIcon.tsx              # SVG do diamante
├── routes/
│   └── payments/
│       ├── success.tsx                  # Callback success MP
│       ├── failure.tsx                  # Callback failure
│       └── pending.tsx                  # PIX em processamento
```

---

## Fluxos UI

### Comprar diamantes

1. Usuário abre ShopModal → tab "Diamantes".
2. Vê 4 cards com pacotes (`DIAMONDS_100`, `DIAMONDS_500`, etc.).
3. Clica "Comprar 500 💎 — R$ 19,90".
4. `BuyConfirmDialog` abre confirmando preço.
5. Confirma → `POST /payments/diamonds/checkout` → recebe `checkoutUrl`.
6. `window.location.href = checkoutUrl` (redirect para MP).
7. Após pagar, MP redireciona para `/payments/success?payment_id=...`.
8. Rota `success.tsx`:
   - Mostra "Pagamento confirmado! +500 diamantes".
   - Lê do query string e atualiza saldo via refetch de `/auth/me`.

### Assinar Premium

1. Usuário abre ShopModal → card "Premium" no topo.
2. Vê benefícios: "50 💎 por mês, sem anúncios, todos os modos liberados".
3. Clica "Assinar R$ 7,90".
4. `POST /payments/premium/checkout` → recebe URL MP.
5. Paga (PIX ou cartão).
6. Volta para `/payments/success` → vê "Premium ativo até DD/MM/AAAA".

### Esconder anúncios para Premium

No `AdBanner.tsx`:
```tsx
import { useAuthStore } from '@/stores/authStore';

export function AdBanner({ ... }) {
  const user = useAuthStore(s => s.user);
  if (user?.isPremium) return null;
  // ... resto do componente
}
```

### HUD com saldo de diamantes

Ao lado do `CoinDisplay` (saldo de moedas), novo `DiamondDisplay`:

```tsx
<div className="flex items-center gap-2">
  <CoinDisplay amount={user.coins} />
  <DiamondDisplay amount={user.diamonds} />
</div>
```

Mostra também em GameOverModal (para destaque de "Premium grant").

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
      <path
        d="M12 2 L22 9 L12 22 L2 9 Z"
        fill="url(#diamond-grad)"
        stroke="#0891b2"
        strokeWidth="0.5"
      />
      <path d="M12 2 L7 9 L17 9 Z" fill="rgba(255,255,255,0.3)" />
      <path d="M12 2 L17 9 L12 22 Z" fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}
```

---

## Rotas novas

| Rota | Componente | Propósito |
|---|---|---|
| `/payments/success` | `success.tsx` | MP redireciona aqui após pagamento aprovado |
| `/payments/failure` | `failure.tsx` | MP redireciona após pagamento recusado |
| `/payments/pending` | `pending.tsx` | PIX em confirmação — mostra spinner + status |

Todas as rotas refazem fetch de `/auth/me` para atualizar saldos.

---

## Plano de execução (3 commits — pareado com backend)

### Commit 1 — Ícone + HUD
- `DiamondIcon.tsx` + `DiamondDisplay.tsx`.
- HUD principal mostra saldo de diamantes.
- Tipo `User` no `authStore` ganha `diamonds`, `isPremium`, `premiumExpiresAt`.
- Build + commit + push.

### Commit 2 — Catálogo na loja (sem checkout MP ainda)
- ShopModal com tabs: Avatares / Modos / Temas / Diamantes / Premium.
- 6 avatares novos (SVG inline em `Avatar.tsx`).
- 3 temas (CSS variables + preview SVG).
- Botão "Comprar diamantes" abre dialog "em breve".
- Botão "Assinar Premium" abre dialog "em breve".
- Compra de avatar/tema com diamantes existentes funciona.
- Build + commit + push.

### Commit 3 — Checkout MP real
- Conecta dialogs aos endpoints `/payments/*/checkout`.
- Redireciona para `init_point` do MP.
- Rotas `/payments/success`, `/payments/failure`, `/payments/pending`.
- Ad banner escondido se `user.isPremium === true`.
- Indicador visual "Premium" no perfil (badge ou cor especial no avatar).
- Build + commit + push.

---

## Verificação visual

1. Loja abre, 5 tabs visíveis.
2. Card Premium destacado no topo.
3. Saldo de diamantes aparece no HUD ao lado de moedas.
4. Compra de avatar com diamantes deduz saldo corretamente.
5. Compra de tema desbloqueia e aplica no `/game/:code`.
6. AdBanner some quando isPremium=true.
7. Após pagamento real (sandbox), saldo atualiza ao retornar para `/payments/success`.
