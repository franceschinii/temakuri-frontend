import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, HelpCircle, User, ShoppingBag, LogOut, Swords, Wine, Trophy } from 'lucide-react';
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
  const [joinPassword, setJoinPassword] = useState('');
  const [joinNeedsPassword, setJoinNeedsPassword] = useState(false);

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
      const { data: roomInfo } = await api.get(`/rooms/${code}`);
      if (roomInfo?.hasPassword && !joinNeedsPassword) {
        setJoinNeedsPassword(true);
        setJoining(false);
        return;
      }
      if (joinNeedsPassword) {
        await api.get(`/rooms/${code}`, { params: { password: joinPassword.trim() } });
      }
      navigate(`/lobby/${code}`, { state: { isMatchmaking: false, password: joinPassword.trim() || undefined } });
    } catch {
      toast.error(joinNeedsPassword ? 'Senha incorreta' : 'Sala não encontrada');
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
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Código da sala (ex: ABC123)"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinNeedsPassword(false); setJoinPassword(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              className="font-mono tracking-widest"
            />
            <Button variant="outline" onClick={handleJoin} disabled={joining} className="shrink-0">
              {joining ? '...' : <><Search size={15} /> Entrar</>}
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="shrink-0" data-testid="lobby-create-room-btn">
              <Plus size={15} /> Criar
            </Button>
            {!user?.isGuest && (
              <Button variant="secondary" onClick={() => setMatchOpen(true)} className="shrink-0" data-testid="lobby-matchmaking-btn">
                <Swords size={15} /> Buscar
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/ranked')} className="shrink-0" data-testid="access-bar-leaderboard-link">
              <Trophy size={15} /> Ranking
            </Button>
          </div>
          {joinNeedsPassword && (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Senha da sala"
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={32}
                autoFocus
              />
              <Button onClick={handleJoin} disabled={joining || !joinPassword.trim()} className="shrink-0">
                {joining ? '...' : 'Confirmar'}
              </Button>
            </div>
          )}
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

          <section className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Preparação</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              3 a 6 jogadores. Cada um recebe <strong className="text-[var(--color-text-primary)]">8 cartas</strong>. A ordem das cartas na mão <strong className="text-[var(--color-text-primary)]">não pode ser alterada</strong> — só muda ao comprar ou pegar a pilha.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Objetivo</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Quem ficar com cartas na mão ao fim da rodada perde <strong className="text-[var(--color-text-primary)]">1 Prato</strong>. Os demais sobrevivem. O primeiro a perder todos os Pratos vence.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">A — Jogar cartas</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Selecione cartas <strong className="text-[var(--color-text-primary)]">adjacentes de mesmo valor</strong> e jogue na pilha central. A jogada deve superar a anterior:
            </p>
            <ul className="list-disc list-inside text-[var(--color-text-muted)] space-y-0.5 pl-1">
              <li><strong className="text-[var(--color-text-primary)]">Mais cartas</strong> batem qualquer jogada menor</li>
              <li>Mesmo count: <strong className="text-[var(--color-text-primary)]">valor mais alto</strong> vence</li>
            </ul>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Após jogar, <strong className="text-[var(--color-text-primary)]">pegue a pilha</strong> (insere na mão) ou <strong className="text-[var(--color-text-primary)]">descarte</strong>.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">B — Passar a vez</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Compre uma carta do monte: insira na mão ou descarte. Monte vazio? Passa sem comprar. Se todos passarem, a pilha é descartada e quem jogou por último reinicia o turno.
            </p>
          </section>

          <section className="flex flex-col gap-1.5 border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-panel)]/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-warning)]">Modo Duelo (2 jogadores)</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Cada um recebe <strong className="text-[var(--color-text-primary)]">11 cartas</strong> + <strong className="text-[var(--color-text-primary)]">2 cartas de mesa</strong> (viradas para cima). Ao passar, pegue uma carta de mesa — não do monte. Sem cartas de mesa: perde.
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Vença esvaziando a mão <strong className="text-[var(--color-text-primary)]">ou</strong> forçando o adversário a passar <strong className="text-[var(--color-text-primary)]">3 vezes na mesma rodada</strong>.
            </p>
          </section>

        </div>
      </Modal>
    </div>
  );
}
