import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, Crown, LogOut, Bot, PlusCircle, X, Lock } from 'lucide-react';
import { AccessBar } from '@/components/ui/AccessBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { TokenDisplay } from '@/components/game/TokenDisplay';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import { useAuthStore } from '@/stores/authStore';
import { useLobbyStore } from '@/stores/lobbyStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { GAME_MODES, INITIAL_TOKENS } from '@/constants/game';
import api from '@/lib/api';
import type { RoomPublicState } from '@/types/game';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { startMusic, stopMusic } from '@/lib/music';
import { playSound } from '@/lib/sounds';
import { RulesDialog } from '@/components/game/RulesDialog';
import { RoomChat } from '@/components/lobby/RoomChat';
import { DevFooter } from '@/components/ui/DevFooter';
import { Input } from '@/components/ui/input';

export default function RoomPage() {
  useEffect(() => {
    startMusic('lobby');
    return () => stopMusic();
  }, []);

  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const { currentRoom, setCurrentRoom, updateRoom, readyMap, setPlayerReady } = useLobbyStore();
  const [addingBot, setAddingBot] = useState(false);

  const roomPassword = (location.state as any)?.password as string | undefined;
  const [pendingPassword, setPendingPassword] = useState<string>(roomPassword ?? '');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const hasJoinedRef = useRef(false);

  const { data: initialRoom, isLoading, isError } = useQuery<RoomPublicState>({
    queryKey: ['room', roomCode],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomCode}`);
      return data;
    },
    enabled: !!roomCode,
    retry: false,
  });

  useEffect(() => {
    if (initialRoom) setCurrentRoom(initialRoom);
  }, [initialRoom]);

  useEffect(() => {
    if (isError) {
      toast.error('Sala não encontrada ou indisponível');
      navigate('/lobby', { replace: true });
    }
  }, [isError, navigate]);

  const doJoin = useCallback((password?: string) => {
    hasJoinedRef.current = true;
    emitSocketEvent('lobby:join_room', { roomCode, password });
  }, [roomCode]);

  // Decide se precisa de senha antes de entrar
  useEffect(() => {
    if (!roomCode || !initialRoom || hasJoinedRef.current) return;
    const alreadyIn = initialRoom.players.some(p => p.userId === user?.id);
    if (alreadyIn || !initialRoom.hasPassword || roomPassword) {
      doJoin(roomPassword);
    } else {
      setShowPasswordDialog(true);
    }
  }, [initialRoom, roomCode, roomPassword, user, doJoin]);

  useSocketEvent<{ room: RoomPublicState }>('lobby:room_updated', useCallback(({ room: updated }) => {
    const prev = useLobbyStore.getState().currentRoom;
    if (prev) {
      const prevHumans = prev.players.filter(p => !p.isBot && !p.isSpectator).length;
      const nextHumans = updated.players.filter(p => !p.isBot && !p.isSpectator).length;
      if (nextHumans > prevHumans) playSound('player_join');
      else if (nextHumans < prevHumans) playSound('player_leave');
    }
    updateRoom(updated);
  }, [updateRoom]));

  useSocketEvent<{ userId: string; ready: boolean }>('lobby:player_ready', useCallback(({ userId, ready }) => {
    setPlayerReady(userId, ready);
  }, [setPlayerReady]));

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const room = currentRoom ?? initialRoom;
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  const navigateToGame = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    navigate(`/game/${roomCode}`, { replace: true });
  }, [navigate, roomCode]);

  useSocketEvent<{ countdown: number }>('lobby:game_starting', useCallback(({ countdown: ms }) => {
    const totalSeconds = Math.round(ms / 1000);
    setCountdown(totalSeconds);
    playSound('countdown_tick');
    let current = totalSeconds;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      current--;
      if (current <= 0) {
        clearInterval(countdownIntervalRef.current!);
        setCountdown(0);
        playSound('countdown_go');
        setTimeout(navigateToGame, 700);
      } else {
        setCountdown(current);
        playSound('countdown_tick');
      }
    }, 1000);
  }, [navigateToGame]));

  // Sinal autoritativo do backend: jogo iniciou, navega independente do timer local
  useSocketEvent<any>('game:state_sync', useCallback(() => {
    if (countdown !== null) navigateToGame();
  }, [countdown, navigateToGame]));

  useSocketEvent<{ code: string; message: string }>('lobby:error', useCallback(({ code, message }) => {
    if (code === 'WRONG_PASSWORD') {
      hasJoinedRef.current = false;
      setPasswordError(true);
      setShowPasswordDialog(true);
    } else {
      toast.error(message);
    }
  }, []));

  // Detecta entrada como espectador quando sala está em andamento e redireciona direto para o jogo
  useEffect(() => {
    if (!user || !room) return;
    const me = room.players.find(p => p.userId === user.id);
    if (me?.isSpectator) {
      setIsSpectator(true);
      if (room.status === 'IN_PROGRESS') {
        navigate(`/game/${roomCode}`, { replace: true });
      }
    } else {
      setIsSpectator(false);
    }
  }, [room, user, roomCode, navigate]);

  // Quando sala volta ao estado WAITING (após reset), sai do modo espectador
  useSocketEvent<{ room: RoomPublicState }>('lobby:room_updated', useCallback(({ room: updatedRoom }) => {
    if (updatedRoom.status === 'WAITING') {
      const me = updatedRoom.players.find(p => p.userId === user?.id);
      if (!me?.isSpectator) setIsSpectator(false);
    }
  }, [user]));

  // Promovido de espectador para jogador ativo
  useSocketEvent<{ roomCode: string }>('lobby:promoted_to_player', useCallback(() => {
    setIsSpectator(false);
    toast.success('Você entrou como jogador!');
  }, []));

  if (isError) return null;

  if (!room || isLoading) return (
    <div className="h-dvh flex items-center justify-center bg-[var(--color-base)] overflow-hidden">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-strong)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--color-text-muted)]">Carregando sala...</span>
      </div>
    </div>
  );

  const isHost = room.hostId === user?.id;
  // Sala de matchmaking = veio via navigate com state.isMatchmaking (MatchmakingDialog)
  const isMatchmakingRoom = !!(location.state as any)?.isMatchmaking;
  const mode = GAME_MODES.find(m => m.value === room.mode);
  const activePlayers = room.players.filter(p => !p.isSpectator);
  const allSlotsReady = activePlayers.filter(p => !p.isBot).every(p => readyMap[p.userId]);
  const humanPlayers = activePlayers.filter(p => !p.isBot);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success('Código copiado!');
  };

  const handleToggleReady = () => {
    const current = readyMap[user?.id ?? ''] ?? false;
    playSound(current ? 'unready' : 'ready');
    emitSocketEvent('lobby:set_ready', { roomCode, ready: !current });
  };

  const handleAddBot = async () => {
    setAddingBot(true);
    try {
      const { data } = await api.post(`/rooms/${roomCode}/bots`);
      updateRoom(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erro ao adicionar bot');
    } finally {
      setAddingBot(false);
    }
  };

  const handleRemoveBot = async (botId: string) => {
    try {
      const { data } = await api.delete(`/rooms/${roomCode}/bots/${botId}`);
      updateRoom(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erro ao remover bot');
    }
  };

  const handleStart = () => {
    emitSocketEvent('lobby:start_game', { roomCode });
  };

  const handleLeave = () => {
    emitSocketEvent('lobby:leave_room', { roomCode });
    navigate('/lobby');
  };

  // Build seat grid: real players first, then empty slots
  const emptySlots = room.maxPlayers - activePlayers.length;

  return (
    <div className="h-dvh bg-[var(--color-base)] flex flex-col overflow-hidden">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={20} />
          <span
            className="text-lg font-semibold text-[var(--color-accent-soft)] tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Temakuri
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <RulesDialog />
          <AccessBar />
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-panel)]"
            title="Sair da sala"
            data-testid="room-leave-btn"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">

        {/* Room code card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2">Código da sala</p>
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-2xl sm:text-3xl font-bold text-[var(--color-accent-soft)] tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  data-testid="room-code-display"
                >
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)] hover:bg-[var(--color-panel)] transition-all"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">Modo</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{mode?.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{mode?.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Players grid */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-[var(--color-text-muted)]">
              Jogadores
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {room.players.length}/{room.maxPlayers}
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AnimatePresence mode="popLayout">
              {room.players.map((p) => {
                const isReady = readyMap[p.userId] || p.isBot;
                return (
                  <motion.div
                    key={p.userId}
                    data-testid={`room-player-${p.userId}`}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'relative flex flex-col gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all duration-300',
                      isReady
                        ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/8'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                    )}
                  >
                    {/* Ready glow */}
                    {isReady && (
                      <div className="absolute inset-0 rounded-xl bg-[var(--color-accent-strong)]/5 pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          {p.isBot
                            ? <div className="w-8 h-8 rounded-full bg-[var(--color-panel)] flex items-center justify-center ring-1 ring-[var(--color-border)]"><Bot size={13} className="text-[var(--color-accent-soft)]" /></div>
                            : <AvatarWithBorder index={p.avatarIndex ?? 0} level={p.level ?? 1} size={32} />
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {p.username}
                            </span>
                            {p.userId === room.hostId && (
                              <Crown size={11} className="text-[var(--color-token-gold)] shrink-0" />
                            )}
                            <MedalBadge count={p.sessionWins ?? 0} />
                          </div>
                          {p.isBot
                            ? <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">bot</span>
                            : p.isGuest
                            ? <span
                                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full w-fit mt-0.5"
                                style={{
                                  background: 'var(--color-panel)',
                                  color: 'var(--color-text-muted)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                Convidado
                              </span>
                            : <div className="flex flex-col gap-0.5 mt-0.5">
                                <div className="flex items-center gap-1.5">
                                  <LevelBadge level={p.level ?? 1} size="xs" />
                                  <RankBadge pds={p.pds ?? 0} size="sm" showPds={room.isRanked} />
                                </div>
                                {p.isAdmin && (
                                  <span
                                    className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-full w-fit"
                                    style={{
                                      background: 'var(--color-accent-mid)1a',
                                      color: 'var(--color-accent-mid)',
                                      border: '1px solid var(--color-accent-mid)33',
                                    }}
                                  >
                                    Admin
                                  </span>
                                )}
                              </div>
                          }
                        </div>
                      </div>

                      {/* Remove bot button */}
                      {isHost && p.isBot && (
                        <button
                          onClick={() => handleRemoveBot(p.userId)}
                          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-0.5 rounded"
                          data-testid={`room-remove-bot-btn-${p.userId}`}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <TokenDisplay tokens={room.initialTokens ?? 2} size="sm" />
                      {isReady && !p.isBot && (
                        <span
                          className="text-[10px] text-[var(--color-accent-mid)] font-medium uppercase tracking-wide"
                          data-testid={`room-player-ready-${p.userId}`}
                        >
                          pronto
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty slots */}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-[var(--color-border)]/50 opacity-30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-panel)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">Aguardando...</span>
                  </div>
                  <div className="h-4" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat */}
        <RoomChat roomCode={roomCode!} />

        {/* Spectator waiting banner */}
        {isSpectator && room.status === 'WAITING' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-center"
          >
            <p className="text-sm text-[var(--color-text-muted)]">
              Sala lotada — você está na <strong className="text-[var(--color-text-primary)]">fila de espera</strong>.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 opacity-70">
              Entrará automaticamente quando uma vaga abrir.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {!isHost && !isSpectator && (
            <Button
              variant={readyMap[user?.id ?? ''] ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={handleToggleReady}
              data-testid="room-ready-btn"
            >
              {readyMap[user?.id ?? ''] ? 'Cancelar' : 'Pronto'}
            </Button>
          )}
          {isHost && !isMatchmakingRoom && (
            <>
              <Button
                variant={readyMap[user?.id ?? ''] ? 'secondary' : 'outline'}
                onClick={handleToggleReady}
                className="shrink-0"
                data-testid="room-ready-btn"
              >
                {readyMap[user?.id ?? ''] ? 'Cancelar' : 'Pronto'}
              </Button>
              <Button
                variant="outline"
                onClick={handleAddBot}
                disabled={addingBot || activePlayers.length >= room.maxPlayers}
                className="shrink-0"
                data-testid="room-add-bot-btn"
              >
                <PlusCircle size={14} /> Bot
              </Button>
              <Button
                className="flex-1"
                onClick={handleStart}
                disabled={room.players.length < 2 || (!allSlotsReady && humanPlayers.length > 1)}
                data-testid="room-start-btn"
              >
                {allSlotsReady || humanPlayers.length <= 1
                  ? 'Iniciar Partida'
                  : `Aguardando (${humanPlayers.filter(p => readyMap[p.userId]).length}/${humanPlayers.length})`}
              </Button>
            </>
          )}
          {isHost && isMatchmakingRoom && (
            <Button
              variant={readyMap[user?.id ?? ''] ? 'secondary' : 'outline'}
              onClick={handleToggleReady}
              className="shrink-0"
            >
              {readyMap[user?.id ?? ''] ? 'Cancelar' : 'Pronto'}
            </Button>
          )}
          {isMatchmakingRoom && (
            <p className="w-full text-center text-xs text-[var(--color-text-muted)] pt-1">
              Inicia automaticamente quando todos confirmarem
            </p>
          )}
        </motion.div>
        </div>
      </main>

      <DevFooter />

      {/* Password dialog */}
      <AnimatePresence>
        {showPasswordDialog && (
          <>
            <motion.div
              key="pw-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => { navigate('/lobby', { replace: true }); }}
            />
            <motion.div
              key="pw-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-[var(--color-accent-mid)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Sala protegida</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Esta sala requer senha para entrar.</p>
              <div className="flex flex-col gap-1.5">
                <Input
                  type="password"
                  placeholder="Senha da sala"
                  value={pendingPassword}
                  onChange={e => { setPendingPassword(e.target.value); setPasswordError(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && pendingPassword.trim()) {
                      setShowPasswordDialog(false);
                      doJoin(pendingPassword.trim());
                    }
                  }}
                  autoFocus
                  maxLength={32}
                  className={passwordError ? 'border-[var(--color-danger)]' : ''}
                />
                {passwordError && (
                  <span className="text-[11px] text-[var(--color-danger)]">Senha incorreta. Tente novamente.</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/lobby', { replace: true })}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!pendingPassword.trim()}
                  onClick={() => {
                    setShowPasswordDialog(false);
                    doJoin(pendingPassword.trim());
                  }}
                >
                  Entrar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Game starting countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-base)]/90 backdrop-blur-md"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-4"
              >
                {countdown === 0 ? (
                  <span
                    className="text-[15vw] sm:text-7xl font-bold text-[var(--color-accent-soft)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    GO!
                  </span>
                ) : (
                  <span
                    className="text-[20vw] sm:text-9xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {countdown}
                  </span>
                )}
                <span className="text-sm text-[var(--color-text-muted)] tracking-widest uppercase">
                  Partida iniciando
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
