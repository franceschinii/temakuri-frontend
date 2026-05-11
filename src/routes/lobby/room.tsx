import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, Crown, LogOut, Bot, PlusCircle, X } from 'lucide-react';
import { AccessBar } from '@/components/ui/AccessBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { TokenDisplay } from '@/components/game/TokenDisplay';
import { useAuthStore } from '@/stores/authStore';
import { useLobbyStore } from '@/stores/lobbyStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { GAME_MODES, INITIAL_TOKENS } from '@/constants/game';
import api from '@/lib/api';
import type { RoomPublicState } from '@/types/game';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { startMusic, stopMusic } from '@/lib/music';
import { playSound } from '@/lib/sounds';

export default function RoomPage() {
  useEffect(() => {
    startMusic('lobby');
    return () => stopMusic();
  }, []);

  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { currentRoom, setCurrentRoom, updateRoom, readyMap, setPlayerReady } = useLobbyStore();
  const [addingBot, setAddingBot] = useState(false);

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

  useEffect(() => {
    if (roomCode) {
      emitSocketEvent('lobby:join_room', { roomCode });
    }
    // cleanup intencional omitido: desmontar o componente não é sair da sala.
    // O botão "Sair" (handleLeave) emite o leave explicitamente.
    // handleDisconnect no gateway cobre fechamento de aba.
  }, [roomCode]);

  useSocketEvent<{ room: RoomPublicState }>('lobby:room_updated', useCallback(({ room }) => {
    updateRoom(room);
  }, [updateRoom]));

  useSocketEvent<{ userId: string; ready: boolean }>('lobby:player_ready', useCallback(({ userId, ready }) => {
    setPlayerReady(userId, ready);
  }, [setPlayerReady]));

  const [countdown, setCountdown] = useState<number | null>(null);

  useSocketEvent<{ countdown: number }>('lobby:game_starting', useCallback(({ countdown: ms }) => {
    const totalSeconds = Math.round(ms / 1000);
    setCountdown(totalSeconds);
    playSound('countdown_tick');
    let current = totalSeconds;
    const interval = setInterval(() => {
      current--;
      if (current <= 0) {
        clearInterval(interval);
        setCountdown(0);
        playSound('countdown_go');
        setTimeout(() => navigate(`/game/${roomCode}`), 700);
      } else {
        setCountdown(current);
        playSound('countdown_tick');
      }
    }, 1000);
  }, [navigate, roomCode]));

  useSocketEvent<{ code: string; message: string }>('lobby:error', useCallback(({ message }) => {
    toast.error(message);
  }, []));

  const room = currentRoom ?? initialRoom;
  if (isError) return null;
  if (!room || isLoading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-strong)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--color-text-muted)]">Carregando sala...</span>
      </div>
    </div>
  );

  const isHost = room.hostId === user?.id;
  const mode = GAME_MODES.find(m => m.value === room.mode);
  const allSlotsReady = room.players.filter(p => !p.isBot).every(p => readyMap[p.userId]);
  const humanPlayers = room.players.filter(p => !p.isBot);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success('Código copiado!');
  };

  const handleToggleReady = () => {
    const current = readyMap[user?.id ?? ''] ?? false;
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
  const emptySlots = room.maxPlayers - room.players.length;

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={20} />
          <span
            className="text-lg font-semibold text-[var(--color-accent-soft)] tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Temakuri
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AccessBar />
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">

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
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          isReady
                            ? 'bg-[var(--color-accent-strong)]/30 text-[var(--color-accent-soft)]'
                            : 'bg-[var(--color-panel)] text-[var(--color-accent-soft)]',
                        )}>
                          {p.isBot ? <Bot size={13} /> : p.username[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {p.username}
                            </span>
                            {p.userId === room.hostId && (
                              <Crown size={11} className="text-[var(--color-token-gold)] shrink-0" />
                            )}
                          </div>
                          {p.isBot && (
                            <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">bot</span>
                          )}
                        </div>
                      </div>

                      {/* Remove bot button */}
                      {isHost && p.isBot && (
                        <button
                          onClick={() => handleRemoveBot(p.userId)}
                          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-0.5 rounded"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <TokenDisplay tokens={INITIAL_TOKENS} size="sm" />
                      {isReady && !p.isBot && (
                        <span className="text-[10px] text-[var(--color-accent-mid)] font-medium uppercase tracking-wide">
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          {!isHost && (
            <Button
              variant={readyMap[user?.id ?? ''] ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={handleToggleReady}
            >
              {readyMap[user?.id ?? ''] ? 'Cancelar' : 'Pronto'}
            </Button>
          )}
          {isHost && (
            <>
              <Button
                variant="outline"
                onClick={handleAddBot}
                disabled={addingBot || room.players.length >= room.maxPlayers}
              >
                <PlusCircle size={14} /> Bot
              </Button>
              <Button
                className="flex-1"
                onClick={handleStart}
                disabled={room.players.length < 2}
              >
                {allSlotsReady || humanPlayers.length <= 1 ? 'Iniciar Partida' : `Aguardando (${humanPlayers.filter(p => readyMap[p.userId]).length}/${humanPlayers.length})`}
              </Button>
            </>
          )}
        </motion.div>
      </main>

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
                    className="text-7xl font-bold text-[var(--color-accent-soft)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    GO!
                  </span>
                ) : (
                  <span
                    className="text-9xl font-bold text-[var(--color-text-primary)]"
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
