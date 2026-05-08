import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, Crown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenDisplay } from '@/components/game/TokenDisplay';
import { useAuthStore } from '@/stores/authStore';
import { useLobbyStore } from '@/stores/lobbyStore';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { GAME_MODES, INITIAL_TOKENS } from '@/constants/game';
import api from '@/lib/api';
import type { RoomPublicState } from '@/types/game';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { currentRoom, setCurrentRoom, updateRoom, readyMap, setPlayerReady } = useLobbyStore();

  const { data: initialRoom } = useQuery<RoomPublicState>({
    queryKey: ['room', roomCode],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomCode}`);
      return data;
    },
    enabled: !!roomCode,
  });

  useEffect(() => {
    if (initialRoom) setCurrentRoom(initialRoom);
  }, [initialRoom]);

  useEffect(() => {
    if (roomCode) {
      emitSocketEvent('lobby:join_room', { roomCode });
    }
    return () => {
      if (roomCode) emitSocketEvent('lobby:leave_room', { roomCode });
    };
  }, [roomCode]);

  useSocketEvent<{ room: RoomPublicState }>('lobby:room_updated', useCallback(({ room }) => {
    updateRoom(room);
  }, [updateRoom]));

  useSocketEvent<{ userId: string; ready: boolean }>('lobby:player_ready', useCallback(({ userId, ready }) => {
    setPlayerReady(userId, ready);
  }, [setPlayerReady]));

  useSocketEvent<{ countdown: number }>('lobby:game_starting', useCallback(() => {
    toast.success('Jogo iniciando...');
    setTimeout(() => navigate(`/game/${roomCode}`), 3200);
  }, [navigate, roomCode]));

  useSocketEvent<{ code: string; message: string }>('lobby:error', useCallback(({ message }) => {
    toast.error(message);
  }, []));

  const room = currentRoom ?? initialRoom;
  if (!room) return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)]">
      <span className="text-[var(--color-text-muted)]">Carregando sala...</span>
    </div>
  );

  const isHost = room.hostId === user?.id;
  const mode = GAME_MODES.find(m => m.value === room.mode);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success('Código copiado!');
  };

  const handleToggleReady = () => {
    const current = readyMap[user?.id ?? ''] ?? false;
    emitSocketEvent('lobby:set_ready', { roomCode, ready: !current });
  };

  const handleStart = () => {
    emitSocketEvent('lobby:start_game', { roomCode });
  };

  const handleLeave = () => {
    emitSocketEvent('lobby:leave_room', { roomCode });
    navigate('/lobby');
  };

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-accent-soft)]">🍱 Temakuri</h1>
        <Button variant="ghost" size="sm" onClick={handleLeave}>
          <LogOut size={14} /> Sair
        </Button>
      </header>

      <main className="max-w-lg mx-auto w-full p-6 flex flex-col gap-6">
        {/* Room info */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Código da sala</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-[var(--color-accent-soft)]">{room.code}</span>
                <button onClick={handleCopyCode} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-mid)]">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)]">Modo</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{mode?.label}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">{mode?.description}</p>
        </div>

        {/* Players */}
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            Jogadores ({room.players.length}/{room.maxPlayers})
          </h2>
          <div className="flex flex-col gap-2">
            {room.players.map((p) => (
              <div
                key={p.userId}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                  readyMap[p.userId] ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                )}
              >
                <span className="w-8 h-8 rounded-full bg-[var(--color-panel)] flex items-center justify-center font-bold text-[var(--color-accent-soft)]">
                  {p.username[0].toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{p.username}</span>
                    {p.userId === room.hostId && <Crown size={12} className="text-[var(--color-token-gold)]" />}
                  </div>
                </div>
                <TokenDisplay tokens={INITIAL_TOKENS} size="sm" />
                {readyMap[p.userId] && (
                  <span className="text-xs text-[var(--color-accent-mid)]">Pronto</span>
                )}
              </div>
            ))}
            {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[var(--color-border)] opacity-40">
                <div className="w-8 h-8 rounded-full bg-[var(--color-panel)]" />
                <span className="text-sm text-[var(--color-text-muted)]">Aguardando...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
            <Button
              className="flex-1"
              onClick={handleStart}
              disabled={room.players.length < 2}
            >
              Iniciar Partida
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
