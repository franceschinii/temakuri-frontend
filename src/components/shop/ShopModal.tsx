import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/components/ui/Avatar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { useShopStore } from '@/stores/shopStore';
import { useAuthStore } from '@/stores/authStore';
import { GAME_MODES } from '@/constants/game';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ShopTab = 'avatars' | 'modes';

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShopModal({ open, onClose }: ShopModalProps) {
  const [tab, setTab] = useState<ShopTab>('avatars');
  const [confirmItem, setConfirmItem] = useState<{ type: 'avatar' | 'mode'; key: number | string; name: string; price: number } | null>(null);
  const { catalog, isLoading, isPurchasing, fetchCatalog, purchaseAvatar, purchaseMode } = useShopStore();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (open) fetchCatalog();
  }, [open]);

  const handlePurchase = async () => {
    if (!confirmItem) return;
    try {
      if (confirmItem.type === 'avatar') {
        await purchaseAvatar(confirmItem.key as number);
      } else {
        await purchaseMode(confirmItem.key as string);
      }
      toast.success(`${confirmItem.name} desbloqueado!`);
      setConfirmItem(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erro na compra');
    }
  };

  // Vista de confirmacao quando o usuario clica em comprar um item.
  // Substitui o conteudo do modal pra dar destaque maximo a transacao.
  if (confirmItem) {
    return (
      <Modal
        open={open}
        onClose={() => !isPurchasing && (setConfirmItem(null), onClose())}
        title="Confirmar compra"
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
              <span className="font-semibold" style={{ color: 'oklch(78% 0.2 75)' }}>
                <CoinDisplay amount={confirmItem.price} size="sm" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Saldo atual</span>
              <CoinDisplay amount={user?.coins ?? 0} size="sm" />
            </div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)] font-medium">Saldo após</span>
              <CoinDisplay amount={Math.max(0, (user?.coins ?? 0) - confirmItem.price)} size="sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => setConfirmItem(null)} disabled={isPurchasing}>
              Voltar
            </Button>
            <Button onClick={handlePurchase} disabled={isPurchasing} data-testid="shop-buy-btn">
              {isPurchasing ? 'Comprando...' : 'Confirmar compra'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Loja" testId="shop-modal">
      <div className="flex flex-col gap-4 min-h-[320px]">
        {/* Coins display */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['avatars', 'modes'] as ShopTab[]).map(t => (
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
                {t === 'avatars' ? 'Avatares' : 'Modos'}
              </button>
            ))}
          </div>
          <span data-testid="shop-balance">
            <CoinDisplay amount={user?.coins ?? 0} size="sm" />
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-24" />
            ))}
          </div>
        ) : (
          <>
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
                    ) : (
                      <button
                        onClick={() => setConfirmItem({ type: 'avatar', key: item.index, name: item.name, price: item.price })}
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
                          onClick={() => setConfirmItem({ type: 'mode', key: item.mode, name: item.name, price: item.price })}
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
          </>
        )}

      </div>
    </Modal>
  );
}
