import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsCancelPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[var(--color-text-muted)]/20 flex items-center justify-center">
          <X size={32} className="text-[var(--color-text-muted)]" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] text-center">
          Pagamento cancelado
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          Nenhuma cobrança foi feita. Você pode tentar de novo quando quiser.
        </p>
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={() => navigate('/lobby')} className="flex-1">
            Voltar ao lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
