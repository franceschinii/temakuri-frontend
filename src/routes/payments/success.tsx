import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { DiamondDisplay } from '@/components/ui/DiamondDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';

const POLL_MS = 1500;
const MAX_POLLS = 8; // ~12s totais

/**
 * Pagina de retorno apos checkout Mercado Pago. MP redireciona com
 * payment_id (one-time) ou preapproval_id (assinatura). O webhook ja
 * deve ter creditado, mas pode haver delay; polling de /auth/me ate
 * o saldo mudar ou atingir limite de tentativas.
 */
export default function PaymentsSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Mercado Pago retorna combinacoes:
  //   one-time: ?collection_id=&collection_status=approved&payment_id=&external_reference=&preference_id=
  //   premium:  ?preapproval_id=
  const paymentId = searchParams.get('payment_id') ?? searchParams.get('collection_id');
  const preapprovalId = searchParams.get('preapproval_id');
  const refId = paymentId ?? preapprovalId;
  const user = useAuthStore(s => s.user);
  const refreshUser = useAuthStore(s => s.refreshUser);
  const [polls, setPolls] = useState(0);
  const [initialDiamonds] = useState(user?.diamonds ?? 0);
  const [initialIsPremium] = useState(user?.isPremium ?? false);

  const diamondsAdded = (user?.diamonds ?? 0) - initialDiamonds;
  const premiumActivated = !initialIsPremium && (user?.isPremium ?? false);
  const detected = diamondsAdded > 0 || premiumActivated;
  const givingUp = polls >= MAX_POLLS && !detected;

  useEffect(() => {
    if (detected || givingUp) return;
    const t = setTimeout(() => {
      refreshUser().catch(() => {});
      setPolls(p => p + 1);
    }, POLL_MS);
    return () => clearTimeout(t);
  }, [polls, detected, givingUp, refreshUser]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-5">
        {detected ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-strong)]/20 flex items-center justify-center">
              <Check size={32} className="text-[var(--color-accent-strong)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] text-center">
              Pagamento confirmado!
            </h1>
            {diamondsAdded > 0 && (
              <div className="flex items-center gap-2 text-lg">
                <span className="text-[var(--color-text-muted)]">+</span>
                <DiamondDisplay amount={diamondsAdded} size="lg" />
              </div>
            )}
            {premiumActivated && (
              <p className="text-sm text-center" style={{ color: 'oklch(75% 0.2 310)' }}>
                Premium ativado! 🍷
              </p>
            )}
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Seu saldo:{' '}
              <span className="inline-flex items-center gap-2 align-middle">
                <CoinDisplay amount={user?.coins ?? 0} size="sm" />
                <DiamondDisplay amount={user?.diamonds ?? 0} size="sm" />
              </span>
            </p>
            <Button onClick={() => navigate('/lobby')} className="w-full">
              Voltar ao lobby
            </Button>
          </>
        ) : givingUp ? (
          <>
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Estamos confirmando seu pagamento. Pode levar alguns instantes.
              {refId && <span className="block text-[10px] mt-2 opacity-60 break-all">Ref: {refId}</span>}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              Se o saldo não atualizar em 1 minuto, fale com o suporte.
            </p>
            <Button onClick={() => navigate('/lobby')} variant="secondary" className="w-full">
              Voltar ao lobby
            </Button>
          </>
        ) : (
          <>
            <Skeleton className="w-16 h-16 rounded-full" />
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)] text-center">
              Confirmando seu pagamento...
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              Aguardando confirmação ({polls + 1}/{MAX_POLLS})
            </p>
          </>
        )}
      </div>
    </div>
  );
}
