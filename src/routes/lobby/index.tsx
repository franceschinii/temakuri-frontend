import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Swords, Trophy } from 'lucide-react';
import { DevFooter } from '@/components/ui/DevFooter';
import { AdBanner } from '@/components/ui/AdBanner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { RulesModal } from '@/components/ui/RulesModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoomCard } from '@/components/lobby/RoomCard';
import { CreateRoomModal } from '@/components/lobby/CreateRoomModal';
import { NewsCard } from '@/components/lobby/NewsCard';
import { ChangelogCard } from '@/components/lobby/ChangelogCard';
import { MatchmakingDialog } from '@/components/matchmaking/MatchmakingDialog';
import { useAuthStore } from '@/stores/authStore';
import { useSocketEvent } from '@/hooks/useSocket';
import { useOnlineCount } from '@/hooks/useOnlineCount';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onlineCount = useOnlineCount();
  const [createOpen, setCreateOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
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
      {/* Header — AppNavbar comum a todas as telas, com "Como jogar" ao lado do logo */}
      <AppNavbar onHowToPlay={() => setRulesOpen(true)} />

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 sm:gap-6">

        {/* Sidebar esquerda: Noticias + Changelog (so visivel em lg+; abaixo, fica embaixo) */}
        <aside className="flex flex-col gap-3 order-2 lg:order-1">
          <NewsCard />
          <ChangelogCard />
        </aside>

        {/* Coluna principal: acoes + salas abertas */}
        <section className="flex flex-col gap-5 sm:gap-6 order-1 lg:order-2 min-w-0">

        {/* Join or Create */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-2"
        >
          {/* Mobile: duas linhas — (codigo + entrar) e (criar / buscar / ranking).
              sm+: linha unica como antes. */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Linha 1: codigo + entrar */}
            <div className="flex gap-2 sm:contents">
              <Input
                placeholder="Código"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinNeedsPassword(false); setJoinPassword(''); }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={6}
                className="font-mono tracking-widest flex-1 sm:flex-none"
                aria-label="Código da sala"
              />
              <Button variant="outline" onClick={handleJoin} disabled={joining} className="shrink-0" aria-label="Entrar">
                {joining ? '...' : (<><Search size={15} /> Entrar</>)}
              </Button>
            </div>
            {/* Linha 2: criar / buscar / ranking */}
            <div className="grid grid-cols-3 gap-2 sm:contents">
              <Button onClick={() => setCreateOpen(true)} className="shrink-0 w-full sm:w-auto" data-testid="lobby-create-room-btn">
                <Plus size={15} /> Criar
              </Button>
              {!user?.isGuest && (
                <Button variant="secondary" onClick={() => setMatchOpen(true)} className="shrink-0 w-full sm:w-auto" data-testid="lobby-matchmaking-btn">
                  <Swords size={15} /> Buscar
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/ranked')} className="shrink-0 w-full sm:w-auto" data-testid="access-bar-leaderboard-link">
                <Trophy size={15} /> Ranking
              </Button>
            </div>
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
          <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
            <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--color-text-muted)]">
              Salas abertas
            </span>
            {rooms.length > 0 && (
              <span className="text-xs bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-accent-mid)] rounded-full px-2 py-0.5 font-mono">
                {rooms.length}
              </span>
            )}
            {onlineCount !== null && onlineCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[var(--color-text-muted)] tabular-nums"
                title="Jogadores online agora"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mid)] animate-pulse" />
                {onlineCount} online
              </span>
            )}
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(i => (
                <Skeleton key={i} variant="card" className="h-16" />
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
        </section>
        </div>
      </main>

      <DevFooter />

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <MatchmakingDialog open={matchOpen} onClose={() => setMatchOpen(false)} />

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
