import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

/**
 * Pix one-time pode demorar minutos para confirmar. Usuario aterrissa
 * aqui se o pagamento ficou pending no Mercado Pago. Faz polling de
 * /auth/me a cada 5s ate o saldo de diamantes/premium mudar; quando muda,
 * exibe confirmacao e redireciona para o lobby.
 */
export default function PaymentsPendingPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const refreshUser = useAuthStore(s => s.refreshUser);
  const initialDiamondsRef = useRef(user?.diamonds ?? 0);
  const initialPremiumRef = useRef(Boolean(user?.isPremium));
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (confirmed) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 5000);
    return () => clearInterval(interval);
  }, [confirmed, refreshUser]);

  useEffect(() => {
    if (confirmed) return;
    const diamondsChanged = (user?.diamonds ?? 0) > initialDiamondsRef.current;
    const premiumChanged = Boolean(user?.isPremium) && !initialPremiumRef.current;
    if (diamondsChanged || premiumChanged) {
      setConfirmed(true);
      const t = setTimeout(() => navigate('/lobby'), 2500);
      return () => clearTimeout(t);
    }
  }, [user?.diamonds, user?.isPremium, confirmed, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-5">
        {confirmed ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-strong)]/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-[var(--color-accent-mid)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] text-center">
              Pagamento confirmado!
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Tudo certo. Redirecionando para o lobby...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-warning)]/20 flex items-center justify-center">
              <Clock size={32} className="text-[var(--color-warning)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] text-center">
              Aguardando pagamento
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Pagamentos via Pix podem demorar alguns minutos. Assim que o banco
              confirmar, seus diamantes aparecem automaticamente.
            </p>
            <Button onClick={() => navigate('/lobby')} className="w-full">
              Voltar ao lobby
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
