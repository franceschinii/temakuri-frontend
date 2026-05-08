import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const user = useAuthStore(s => s.user);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/lobby', { replace: true });
    return null;
  }

  const handleGuest = async () => {
    if (!guestName.trim() || guestName.length < 2) {
      toast.error('Nome precisa ter pelo menos 2 caracteres');
      return;
    }
    setLoading(true);
    try {
      await loginAsGuest(guestName.trim());
      navigate('/lobby');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Erro ao entrar como convidado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col items-center justify-center p-6 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-[var(--color-accent-soft)] tracking-tight">
          🍱 Temakuri
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)] text-lg">
          Roll your hand. Clear the table.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        <div className="flex gap-2">
          <Input
            placeholder="Seu nome de convidado"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuest()}
            maxLength={20}
          />
          <Button onClick={handleGuest} disabled={loading} size="md">
            Jogar
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)]">ou</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <div className="flex gap-2">
          <Link to="/auth/login" className="flex-1">
            <Button variant="outline" className="w-full">Entrar</Button>
          </Link>
          <Link to="/auth/register" className="flex-1">
            <Button variant="secondary" className="w-full">Criar Conta</Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-accent-soft)] mb-3">Como jogar</h2>
          <ul className="text-xs text-[var(--color-text-muted)] space-y-1.5">
            <li>🃏 Seja o primeiro a descartar todas as cartas</li>
            <li>👆 Só pode jogar cartas <strong className="text-[var(--color-text-primary)]">adjacentes</strong> na mão (não reorganize!)</li>
            <li>📈 Jogue mais cartas <em>ou</em> mesmo número com valor maior</li>
            <li>🔄 Ao passar, pegue uma carta da pilha e insira onde quiser</li>
            <li>🔥 <strong className="text-[var(--color-warning)]">Sabor</strong>: conjuntos da mesma categoria forçam mais cartas do próximo</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
