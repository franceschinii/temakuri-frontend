import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Pix one-time pode demorar minutos para confirmar. Usuario aterrissa
 * aqui se o pagamento ficou pending no Stripe. Quando o webhook chegar,
 * /auth/me ja reflete o saldo atualizado.
 */
export default function PaymentsPendingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-5">
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
      </div>
    </div>
  );
}
