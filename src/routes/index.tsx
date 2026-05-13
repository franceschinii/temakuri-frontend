import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccessBar } from '@/components/ui/AccessBar';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { startMusic, stopMusic } from '@/lib/music';

export default function LandingPage() {
  const navigate = useNavigate();
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const user = useAuthStore(s => s.user);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startMusic('landing');
    return () => stopMusic();
  }, []);

  if (user) return <Navigate to="/lobby" replace />;

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
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col relative overflow-x-hidden">
      {/* Atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] rounded-full bg-[var(--color-accent-strong)]/8 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full bg-[var(--color-accent-strong)]/5 blur-[100px]" />
        <div className="absolute top-[-5%] right-[-5%] w-64 h-64 rounded-full bg-[var(--color-token-gold)]/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start gap-8 px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 sm:gap-8">

        {/* Logo — top, centered, large */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center gap-2"
        >
          <div className="absolute inset-0 scale-150 rounded-full bg-[var(--color-accent-strong)]/10 blur-3xl pointer-events-none" />
          <img
            src="/logo.svg"
            alt="Temakuri"
            draggable={false}
            className="relative drop-shadow-[0_0_48px_oklch(68%_0.15_145_/_0.5)] w-[280px] sm:w-[380px] md:w-[480px] h-auto"
          />
          <p
            className="text-[var(--color-text-muted)] text-xs sm:text-sm tracking-widest"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Roll your hand. Clear the table.
          </p>
        </motion.div>

        {/* Two-column: login card | rules */}
        <div className="w-full flex flex-col md:flex-row md:items-start md:justify-center gap-5 md:gap-10">

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-[0_8px_48px_oklch(0%_0_0_/_0.45)]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3 font-medium">
                Jogar como convidado
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Seu apelido"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGuest()}
                  maxLength={20}
                />
                <Button onClick={handleGuest} disabled={loading} size="md" className="shrink-0" data-testid="guest-login-btn">
                  {loading ? '...' : 'Jogar'}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">ou</span>
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

            {/* Hierarquia visual */}
            <div className="pt-1 flex flex-col gap-2">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-medium">Hierarquia de jogadas</p>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { count: 1, label: 'simples' },
                  { count: 2, label: 'dupla' },
                  { count: 3, label: 'trinca' },
                  { count: 4, label: 'quadra' },
                ].map((group, gi) => (
                  <div key={gi} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: group.count }).map((_, i) => (
                        <div key={i} className="w-5 h-7 rounded border border-[var(--color-border)] bg-[var(--color-panel)] flex items-center justify-center">
                          <span className="text-[9px] font-mono font-bold text-[var(--color-accent-soft)]">1</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] text-[var(--color-text-muted)]">{group.label}</span>
                    {gi < 3 && <span className="text-[var(--color-accent-mid)] font-bold text-sm leading-none">‹</span>}
                  </div>
                ))}
                <span className="text-[9px] text-[var(--color-text-muted)]">‹ quinta ‹ ...</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Dentro do mesmo count: <span className="text-[var(--color-text-primary)]">valor maior</span> vence.
              </p>
            </div>
            {/* Sound control */}
            <div className="flex items-center gap-2 pt-1">
              <AccessBar />
              <span className="text-[10px] text-[var(--color-text-muted)]">Som</span>
            </div>
          </motion.div>

          {/* Divider — only md+ */}
          <div className="hidden md:block w-px self-stretch bg-[var(--color-border)] opacity-40 shrink-0" />

          {/* Rules */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:flex-1 flex flex-col gap-3"
          >
            <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[var(--color-text-muted)]">
              Como jogar
            </p>

            {/* Objetivo */}
            <div className="flex flex-col gap-1 pb-3 border-b border-[var(--color-border)]/40">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-accent-mid)]">Objetivo</span>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Quem ficar com cartas na mão ao fim da rodada perde 1 Prato. Os demais sobrevivem. Perca todos os seus Pratos para vencer.
              </p>
            </div>

            {/* Jogar cartas */}
            <div className="flex flex-col gap-1 pb-3 border-b border-[var(--color-border)]/40">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-accent-mid)]">Jogar cartas</span>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Selecione cartas <strong className="text-[var(--color-text-secondary)]">adjacentes de mesmo valor</strong> e jogue na pilha. Mais cartas batem qualquer jogada menor — uma dupla de 1 bate um 7 sozinho. Mesmo count: valor maior vence.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Após jogar, <strong className="text-[var(--color-text-secondary)]">pegue a pilha</strong> (insere na mão) ou <strong className="text-[var(--color-text-secondary)]">descarte</strong> ela.
              </p>
            </div>

            {/* Passar */}
            <div className="flex flex-col gap-1 pb-3 border-b border-[var(--color-border)]/40">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-accent-mid)]">Passar a vez</span>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Compre do monte e escolha: inserir na mão ou descartar. Monte vazio? Passa sem comprar. Se todos passarem, a pilha é descartada e quem jogou por último reinicia o turno.
              </p>
            </div>

            {/* Duelo */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-warning)]">Modo Duelo (2 jogadores)</span>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Cada um recebe 11 cartas + 2 cartas de mesa (viradas). Ao passar, pegue uma carta de mesa — não do monte. Sem cartas de mesa: perde. Vença esvaziando a mão ou forçando o adversário a passar 3 vezes na mesma rodada.
              </p>
            </div>
          </motion.div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-1 sm:gap-0 pb-2">
          <span className="text-[10px] text-[var(--color-text-muted)] opacity-40 tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
            寿司 · 拉麺 · 餃子
          </span>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[10px] text-[var(--color-text-muted)] opacity-25 font-mono">v0.4.1-beta</span>
            <span className="text-[10px] text-[var(--color-text-muted)] opacity-40">
              Desenvolvido por{' '}
              <a
                href="https://www.linkedin.com/in/andrefranceschini/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100 hover:text-[var(--color-accent-mid)] underline-offset-2 hover:underline transition-all"
              >
                André Franceschini
              </a>
            </span>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
