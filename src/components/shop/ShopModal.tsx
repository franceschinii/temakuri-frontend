import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/components/ui/Avatar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { DiamondDisplay } from '@/components/ui/DiamondDisplay';
import { DiamondIcon } from '@/components/ui/DiamondIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useShopStore } from '@/stores/shopStore';
import { useAuthStore } from '@/stores/authStore';
import { GAME_MODES } from '@/constants/game';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ShopTab = 'avatars' | 'modes' | 'themes' | 'diamonds' | 'premium';

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
}

interface ConfirmState {
  type: 'avatar' | 'mode' | 'theme' | 'coin_pack' | 'utility';
  key: number | string;
  name: string;
  price: number;
  currency: 'coins' | 'diamonds';
}

const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

// Pacotes de diamantes — exibidos na tab "Diamantes". Apenas visual nessa
// Fase A; a compra real (Stripe Checkout) entra no Commit 4.
const DIAMOND_PACKS: { sku: string; diamonds: number; priceBrl: number; bonus: number }[] = [
  { sku: 'DIAMONDS_100',  diamonds: 100,  priceBrl: 4.90,  bonus: 0  },
  { sku: 'DIAMONDS_500',  diamonds: 500,  priceBrl: 19.90, bonus: 2  },
  { sku: 'DIAMONDS_1200', diamonds: 1200, priceBrl: 39.90, bonus: 22 },
  { sku: 'DIAMONDS_3000', diamonds: 3000, priceBrl: 89.90, bonus: 50 },
];

const PREMIUM_PRICE_BRL = 7.90;

export function ShopModal({ open, onClose }: ShopModalProps) {
  const [tab, setTab] = useState<ShopTab>('avatars');
  const [confirmItem, setConfirmItem] = useState<ConfirmState | null>(null);
  const {
    catalog, isLoading, isPurchasing,
    fetchCatalog, purchaseAvatar, purchaseMode, purchaseTheme,
    setActiveTheme, purchaseCoinPack, useUtility,
  } = useShopStore();
  const user = useAuthStore(s => s.user);
  const userBalance = confirmItem?.currency === 'diamonds' ? (user?.diamonds ?? 0) : (user?.coins ?? 0);

  useEffect(() => {
    if (open) fetchCatalog();
  }, [open]);

  const handlePurchase = async () => {
    if (!confirmItem) return;
    try {
      switch (confirmItem.type) {
        case 'avatar': await purchaseAvatar(confirmItem.key as number); break;
        case 'mode': await purchaseMode(confirmItem.key as string); break;
        case 'theme': await purchaseTheme(confirmItem.key as string); break;
        case 'coin_pack': await purchaseCoinPack(confirmItem.key as string); break;
        case 'utility': await useUtility(confirmItem.key as string); break;
      }
      toast.success(confirmItem.type === 'utility' ? 'Aplicado!' : `${confirmItem.name} desbloqueado!`);
      setConfirmItem(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erro na operação');
    }
  };

  // Tela de confirmacao quando o usuario clica em comprar um item.
  if (confirmItem) {
    const remaining = Math.max(0, userBalance - confirmItem.price);
    const BalanceDisplay = confirmItem.currency === 'diamonds' ? DiamondDisplay : CoinDisplay;
    return (
      <Modal
        open={open}
        onClose={() => !isPurchasing && (setConfirmItem(null), onClose())}
        title="Confirmar"
        testId="shop-confirm-dialog"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Você está prestes a desbloquear{' '}
            <strong className="text-[var(--color-text-primary)]">{confirmItem.name}</strong>.
          </p>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Preço</span>
              <BalanceDisplay amount={confirmItem.price} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Saldo atual</span>
              <BalanceDisplay amount={userBalance} size="sm" />
            </div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)] font-medium">Saldo após</span>
              <BalanceDisplay amount={remaining} size="sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => setConfirmItem(null)} disabled={isPurchasing}>
              Voltar
            </Button>
            <Button onClick={handlePurchase} disabled={isPurchasing} data-testid="shop-buy-btn">
              {isPurchasing ? 'Aplicando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Loja" testId="shop-modal">
      <div className="flex flex-col gap-4 min-h-[360px]">
        {/* HUD: tabs + saldos */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {(['avatars', 'modes', 'themes', 'diamonds', 'premium'] as ShopTab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                data-testid={`shop-tab-${t}`}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  tab === t
                    ? 'bg-[var(--color-accent-strong)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-panel)]',
                )}
              >
                {t === 'avatars' && 'Avatares'}
                {t === 'modes' && 'Modos'}
                {t === 'themes' && 'Temas'}
                {t === 'diamonds' && 'Diamantes'}
                {t === 'premium' && 'Premium'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span data-testid="shop-balance"><CoinDisplay amount={user?.coins ?? 0} size="sm" /></span>
            <span data-testid="shop-balance-diamonds"><DiamondDisplay amount={user?.diamonds ?? 0} size="sm" /></span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* AVATARES */}
            {tab === 'avatars' && (
              <div className="grid grid-cols-4 gap-3">
                {catalog?.avatars.map(item => (
                  <div
                    key={item.index}
                    data-testid={`shop-avatar-${item.index}`}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all',
                      item.owned
                        ? 'border-[var(--color-accent-strong)]/40 bg-[var(--color-accent-strong)]/8'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-mid)]/50',
                    )}
                  >
                    <AvatarImage index={item.index} size={48} />
                    <span className="text-[10px] text-[var(--color-text-muted)] truncate w-full text-center">{item.name}</span>
                    {item.owned ? (
                      <span className="text-[9px] text-[var(--color-accent-mid)] font-medium uppercase tracking-wide">Seu</span>
                    ) : item.free ? (
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Grátis</span>
                    ) : item.currency === 'diamonds' ? (
                      <button
                        onClick={() => setConfirmItem({ type: 'avatar', key: item.index, name: item.name, price: item.price, currency: 'diamonds' })}
                        disabled={isPurchasing || (user?.diamonds ?? 0) < item.price}
                        className={cn(
                          'flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full transition-all',
                          (user?.diamonds ?? 0) >= item.price
                            ? 'bg-[oklch(80%_0.16_220)]/15 text-[oklch(80%_0.16_220)] hover:bg-[oklch(80%_0.16_220)]/25'
                            : 'opacity-40 cursor-not-allowed text-[var(--color-text-muted)]',
                        )}
                      >
                        <DiamondIcon size={10} />
                        {item.price}
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmItem({ type: 'avatar', key: item.index, name: item.name, price: item.price, currency: 'coins' })}
                        disabled={isPurchasing || (user?.coins ?? 0) < item.price}
                        className={cn(
                          'flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full transition-all',
                          (user?.coins ?? 0) >= item.price
                            ? 'bg-[oklch(78%_0.2_75)]/20 text-[oklch(78%_0.2_75)] hover:bg-[oklch(78%_0.2_75)]/30'
                            : 'opacity-40 cursor-not-allowed text-[var(--color-text-muted)]',
                        )}
                      >
                        <span style={{ color: 'oklch(78% 0.2 75)' }}>金</span>
                        {item.price}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MODOS */}
            {tab === 'modes' && (
              <div className="flex flex-col gap-3">
                {catalog?.modes.map(item => {
                  const modeInfo = GAME_MODES.find(m => m.value === item.mode);
                  return (
                    <div
                      key={item.mode}
                      data-testid={`shop-mode-${item.mode}`}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all',
                        item.owned
                          ? 'border-[var(--color-accent-strong)]/40 bg-[var(--color-accent-strong)]/8'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</span>
                        {modeInfo?.description && (
                          <span className="text-xs text-[var(--color-text-muted)] truncate">{modeInfo.description}</span>
                        )}
                      </div>
                      {item.owned ? (
                        <span className="text-xs text-[var(--color-accent-mid)] font-medium uppercase tracking-wide shrink-0">Desbloqueado</span>
                      ) : (
                        <button
                          onClick={() => setConfirmItem({ type: 'mode', key: item.mode, name: item.name, price: item.price, currency: 'coins' })}
                          disabled={isPurchasing || (user?.coins ?? 0) < item.price}
                          className={cn(
                            'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-all border',
                            (user?.coins ?? 0) >= item.price
                              ? 'border-[oklch(78%_0.2_75)]/40 text-[oklch(78%_0.2_75)] hover:bg-[oklch(78%_0.2_75)]/10'
                              : 'opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]',
                          )}
                        >
                          <span>金</span>{item.price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TEMAS */}
            {tab === 'themes' && (
              <div className="flex flex-col gap-3">
                {catalog?.themes.map(item => {
                  const isActive = user?.activeTheme === item.key;
                  return (
                    <div
                      key={item.key}
                      data-testid={`shop-theme-${item.key}`}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all',
                        item.owned
                          ? 'border-[var(--color-accent-strong)]/40 bg-[var(--color-accent-strong)]/8'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-12 h-12 rounded-lg shrink-0 border border-[var(--color-border)]"
                          data-theme={item.key}
                          style={{ background: 'var(--color-base, oklch(20% 0.04 260))' }}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</span>
                          {isActive && (
                            <span className="text-[10px] text-[var(--color-accent-mid)] font-medium uppercase flex items-center gap-1">
                              <Check size={11} /> Em uso
                            </span>
                          )}
                        </div>
                      </div>
                      {item.owned ? (
                        isActive ? (
                          <Button size="sm" variant="secondary" onClick={() => setActiveTheme(null)}>
                            Remover
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => setActiveTheme(item.key)}>
                            Usar
                          </Button>
                        )
                      ) : (
                        <button
                          onClick={() => setConfirmItem({ type: 'theme', key: item.key, name: item.name, price: item.price, currency: 'diamonds' })}
                          disabled={isPurchasing || (user?.diamonds ?? 0) < item.price}
                          className={cn(
                            'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-all border',
                            (user?.diamonds ?? 0) >= item.price
                              ? 'border-[oklch(80%_0.16_220)]/40 text-[oklch(80%_0.16_220)] hover:bg-[oklch(80%_0.16_220)]/10'
                              : 'opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]',
                          )}
                        >
                          <DiamondIcon size={12} />{item.price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DIAMANTES (pacotes — em breve enquanto flag off) */}
            {tab === 'diamonds' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Compre diamantes para destravar avatares premium, temas e mais.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {DIAMOND_PACKS.map(pack => (
                    <div
                      key={pack.sku}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center"
                    >
                      <DiamondIcon size={28} />
                      <span className="text-base font-bold text-[var(--color-text-primary)]">{pack.diamonds.toLocaleString('pt-BR')}</span>
                      {pack.bonus > 0 && (
                        <span className="text-[10px] text-[var(--color-accent-mid)] font-semibold uppercase">+{pack.bonus}% bônus</span>
                      )}
                      <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                        R$ {pack.priceBrl.toFixed(2).replace('.', ',')}
                      </span>
                      <Button
                        size="sm"
                        className="w-full mt-1"
                        disabled={!PAYMENTS_ENABLED}
                        onClick={() => toast.info('Pagamentos chegam em breve!')}
                      >
                        {PAYMENTS_ENABLED ? 'Comprar' : 'Em breve'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[var(--color-border)] my-1" />
                <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                  Trocar diamantes por moedas
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {catalog?.coinPacks.map(pack => (
                    <button
                      key={pack.sku}
                      onClick={() => setConfirmItem({
                        type: 'coin_pack', key: pack.sku,
                        name: `${pack.coins} moedas`,
                        price: pack.price, currency: 'diamonds',
                      })}
                      disabled={isPurchasing || (user?.diamonds ?? 0) < pack.price}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all',
                        (user?.diamonds ?? 0) >= pack.price
                          ? 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)] bg-[var(--color-surface)]'
                          : 'opacity-50 cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface)]',
                      )}
                    >
                      <CoinDisplay amount={pack.coins} size="sm" />
                      <div className="flex items-center gap-0.5 text-[10px] text-[var(--color-text-muted)]">
                        por <DiamondIcon size={9} /> {pack.price}
                      </div>
                    </button>
                  ))}
                </div>

                {(catalog?.utilities?.length ?? 0) > 0 && (
                  <>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                      Utilitários
                    </p>
                    <div className="flex flex-col gap-2">
                      {catalog?.utilities.map(u => (
                        <div
                          key={u.sku}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                        >
                          <span className="text-xs text-[var(--color-text-primary)]">{u.name}</span>
                          <button
                            onClick={() => setConfirmItem({ type: 'utility', key: u.sku, name: u.name, price: u.price, currency: 'diamonds' })}
                            disabled={isPurchasing || (user?.diamonds ?? 0) < u.price}
                            className={cn(
                              'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 transition-all border',
                              (user?.diamonds ?? 0) >= u.price
                                ? 'border-[oklch(80%_0.16_220)]/40 text-[oklch(80%_0.16_220)] hover:bg-[oklch(80%_0.16_220)]/10'
                                : 'opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]',
                            )}
                          >
                            <DiamondIcon size={10} />{u.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PREMIUM (em breve enquanto flag off) */}
            {tab === 'premium' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border-2 border-[oklch(75%_0.2_310)]/40 bg-[oklch(75%_0.2_310)]/8 p-4 flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold" style={{ color: 'oklch(80% 0.18 310)' }}>Premium</h3>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      R$ {PREMIUM_PRICE_BRL.toFixed(2).replace('.', ',')}/mês
                    </span>
                  </div>
                  <ul className="text-sm text-[var(--color-text-muted)] flex flex-col gap-1.5">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[oklch(75%_0.2_310)] shrink-0" />
                      50 <DiamondIcon size={12} /> por mês automaticamente
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[oklch(75%_0.2_310)] shrink-0" />
                      Sem anúncios
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[oklch(75%_0.2_310)] shrink-0" />
                      Todos os modos liberados (sem precisar comprar)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[oklch(75%_0.2_310)] shrink-0" />
                      Badge premium no perfil
                    </li>
                  </ul>
                  {user?.isPremium ? (
                    <div className="text-center text-sm font-medium" style={{ color: 'oklch(75% 0.2 310)' }}>
                      Você já é Premium 🍷
                      {user.premiumExpiresAt && (
                        <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                          Renova em {new Date(user.premiumExpiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Button
                      disabled={!PAYMENTS_ENABLED}
                      onClick={() => toast.info('Premium chega em breve!')}
                      style={!PAYMENTS_ENABLED ? {} : { background: 'oklch(75% 0.2 310)' }}
                    >
                      {PAYMENTS_ENABLED ? 'Assinar Premium' : 'Em breve'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
