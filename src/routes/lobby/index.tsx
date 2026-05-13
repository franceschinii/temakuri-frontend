import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, HelpCircle, CreditCard, ArrowUpRight, RefreshCw, Flame, User, ShoppingBag, LogOut, Swords, Wine, Trophy } from 'lucide-react';
import { DevFooter } from '@/components/ui/DevFooter';
import { AdBanner } from '@/components/ui/AdBanner';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AccessBar } from '@/components/ui/AccessBar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { RoomCard } from '@/components/lobby/RoomCard';
import { CreateRoomModal } from '@/components/lobby/CreateRoomModal';
import { ShopModal } from '@/components/shop/ShopModal';
import { MatchmakingDialog } from '@/components/matchmaking/MatchmakingDialog';
import { useAuthStore } from '@/stores/authStore';
import { useSocketEvent } from '@/hooks/useSocket';
import api from '@/lib/api';
import type { RoomPublicState } from '@/types/game';
import { toast } from 'sonner';
import { startMusic, stopMusic } from '@/lib/music';

export default function LobbyPage() {
  useEffect(() => {
    startMusic('lobby');
    return () => stopMusic();
  }, []);

  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const { data: rooms = [], isLoading } = useQuery<RoomPublicState[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await api.get('/rooms');
      return data;
    },
    refetchInterval: 8000,       // poll every 8s to catch rooms that closed without event
    refetchOnMount: 'always',    // always fresh when navigating back to lobby
    staleTime: 0,
  });

  useSocketEvent('lobby:public_rooms_changed', useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
  }, [queryClient]));

  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    try {
      await api.get(`/rooms/${code}`);
      navigate(`/lobby/${code}`, { state: { isMatchmaking: false } });
    } catch {
      toast.error('Sala não encontrada');
      setJoining(false);
    }
  };

  return (
    <div className="h-dvh bg-[var(--color-base)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={22} />
          <span
            className="text-lg font-semibold text-[var(--color-accent-soft)] tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Temakuri
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Moedas — só para registrados */}
          {!user?.isGuest && (
            <span className="px-1.5" data-testid="access-bar-coins">
              <CoinDisplay amount={user?.coins ?? 0} size="sm" />
            </span>
          )}
          {/* Premium badge */}
          {user?.isPremium && (
            <span title="Premium" className="p-1.5 text-[oklch(75%_0.2_310)]">
              <Wine size={16} />
            </span>
          )}
          {/* Loja */}
          {!user?.isGuest && (
            <button
              onClick={() => setShopOpen(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
              title="Loja"
              data-testid="access-bar-shop-btn"
            >
              <ShoppingBag size={16} />
            </button>
          )}
          {/* Ajuda */}
          <button
            onClick={() => setRulesOpen(true)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
            title="Como jogar"
          >
            <HelpCircle size={17} />
          </button>
          {/* Som + Música */}
          <AccessBar />
          {/* Admin */}
          {user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-[var(--color-warning)] hover:text-[var(--color-text-primary)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-panel)] hidden sm:block"
            >
              Admin
            </button>
          )}
          {/* Perfil */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors px-1.5 py-1.5 rounded-lg hover:bg-[var(--color-panel)]"
            title={user?.username ?? 'Perfil'}
            data-testid="access-bar-profile-link"
          >
            <User size={16} />
            <span className="hidden sm:inline" data-testid="access-bar-username">{user?.username}</span>
          </button>
          {/* Sair */}
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
            title="Sair"
            data-testid="access-bar-logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
        {/* Join or Create */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            placeholder="Código da sala (ex: ABC123)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            maxLength={6}
            className="font-mono tracking-widest"
          />
          <Button variant="outline" onClick={handleJoin} disabled={joining} className="shrink-0">
            {joining ? '...' : <><Search size={15} /> Entrar</>}
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <Plus size={15} /> Criar
          </Button>
          {!user?.isGuest && (
            <Button variant="secondary" onClick={() => setMatchOpen(true)} className="shrink-0">
              <Swords size={15} /> Buscar
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/ranked')} className="shrink-0" data-testid="access-bar-leaderboard-link">
            <Trophy size={15} /> Ranking
          </Button>
        </motion.div>

        {/* Room list */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
              Salas abertas
            </span>
            {rooms.length > 0 && (
              <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">
                {rooms.length}
              </span>
            )}
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-16 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl text-center gap-3"
            >
              <div className="text-3xl opacity-20">🀄</div>
              <p className="text-sm text-[var(--color-text-muted)]">Nenhuma sala aberta</p>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> Criar sala
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
          <AdBanner className="w-full" />
        </div>
      </main>

      <DevFooter />

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
      <MatchmakingDialog open={matchOpen} onClose={() => setMatchOpen(false)} />

      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title="Como jogar">
        <div className="flex flex-col gap-5 text-sm">

          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Objetivo</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Esvazie sua mão para perder Pratos — esse é o objetivo. <strong className="text-[var(--color-text-primary)]">Quem esvaziar a mão perde 1 Prato</strong>.
              Cada jogador começa com <strong className="text-[var(--color-text-primary)]">2 Pratos</strong>. O primeiro a chegar a zero Pratos vence a partida.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Hierarquia de jogadas</p>
            <ul className="flex flex-col gap-2 text-[var(--color-text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <CreditCard size={13} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
                <span>Cartas têm valores <strong className="text-[var(--color-text-primary)]">1 a 7</strong>. Selecione cartas <strong className="text-[var(--color-text-primary)]">adjacentes de mesmo valor</strong> na mão: 1 carta, dupla, trinca, etc. A ordem da mão é fixa — só muda ao comprar.</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowUpRight size={13} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
                <span><strong className="text-[var(--color-text-primary)]">Mais cartas bate qualquer jogada menor</strong> — uma dupla de 1s bate um 7 sozinho. Se o count for igual, <strong className="text-[var(--color-text-primary)]">valor maior</strong> vence.</span>
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Passar a vez</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed flex items-start gap-2">
              <RefreshCw size={13} className="mt-0.5 shrink-0" />
              <span>Compre uma carta do monte e escolha: inserir em qualquer posição da mão ou descartar. Monte esgotado? Passa sem comprar.
              Se todos passarem em sequência, o último que jogou ganha a <strong className="text-[var(--color-text-primary)]">vaza</strong>: pode pegar ou descartar a pilha e inicia o próximo turno.</span>
            </p>
          </section>

          <section className="flex flex-col gap-2 border border-[var(--color-warning)]/30 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-warning)] flex items-center gap-1.5">
              <Flame size={12} />
              Sabor
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Jogue <strong className="text-[var(--color-text-primary)]">2 ou mais cartas do mesmo tipo de comida</strong> para ativar o Sabor.
              O próximo jogador deve jogar <strong className="text-[var(--color-text-primary)]">pelo menos a mesma quantidade</strong> de cartas.
              As regras normais continuam: pode bater pelo valor (mesmo count, valor maior) ou jogar mais cartas.
              Jogar <strong className="text-[var(--color-text-primary)]">categorias mistas</strong> com a quantidade mínima <strong className="text-[var(--color-text-primary)]">quebra</strong> o Sabor.
            </p>
          </section>

        </div>
      </Modal>
    </div>
  );
}
