import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Swords, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/components/ui/Avatar';
import { useSocketEvent, emitSocketEvent } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface QueuePlayer {
  userId: string;
  username: string;
  avatarIndex: number;
  level: number;
  pds: number;
}

type MatchStatus = 'idle' | 'queued' | 'found';

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function MatchmakingDialog({ open, onClose }: Props) {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [status, setStatus] = useState<MatchStatus>('idle');
  const [type, setType] = useState<'RANKED' | 'QUICK'>('QUICK');
  const [queueTime, setQueueTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [matchData, setMatchData] = useState<{ roomCode: string; players: QueuePlayer[]; isRanked: boolean } | null>(null);
  const [confirmTimer, setConfirmTimer] = useState(20);
  const [confirmTimerMax, setConfirmTimerMax] = useState(20);
  const [myConfirmed, setMyConfirmed] = useState(false);
  const [confirmedUserIds, setConfirmedUserIds] = useState<string[]>([]);

  const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setQueueTime(0);
    setPosition(0);
    setQueueSize(0);
    setMatchData(null);
    setConfirmTimer(20);
    setConfirmTimerMax(20);
    setMyConfirmed(false);
    setConfirmedUserIds([]);
    roomCodeRef.current = null;
    if (queueTimerRef.current) clearInterval(queueTimerRef.current);
    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
  }, []);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      if (status === 'queued') {
        emitSocketEvent('matchmaking:leave', {});
      }
      resetState();
    }
  }, [open, status, resetState]);

  // Queue elapsed timer
  useEffect(() => {
    if (status === 'queued') {
      queueTimerRef.current = setInterval(() => {
        setQueueTime(t => t + 1);
      }, 1000);
    } else {
      if (queueTimerRef.current) clearInterval(queueTimerRef.current);
    }
    return () => {
      if (queueTimerRef.current) clearInterval(queueTimerRef.current);
    };
  }, [status]);

  // Confirm countdown timer
  useEffect(() => {
    if (status === 'found') {
      confirmTimerRef.current = setInterval(() => {
        setConfirmTimer(t => {
          if (t <= 1) {
            if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
            if (roomCodeRef.current) {
              navigate(`/lobby/${roomCodeRef.current}`, { state: { isMatchmaking: true } });
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
    }
    return () => {
      if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
    };
  }, [status, navigate]);

  useSocketEvent<{ type: string; position: number; queueSize: number }>('matchmaking:queued', useCallback((data) => {
    setPosition(data.position);
    setQueueSize(data.queueSize);
    setStatus('queued');
  }, []));

  useSocketEvent<{ roomCode: string; players: QueuePlayer[]; isRanked?: boolean }>('matchmaking:match_found', useCallback((data) => {
    if (queueTimerRef.current) clearInterval(queueTimerRef.current);
    roomCodeRef.current = data.roomCode;
    const isRanked = data.isRanked === true;
    setMatchData({ roomCode: data.roomCode, players: data.players, isRanked });
    const initialTimer = isRanked ? 120 : 20;
    setConfirmTimer(initialTimer);
    setConfirmTimerMax(initialTimer);
    setMyConfirmed(false);
    setConfirmedUserIds([]);
    setStatus('found');
  }, []));

  useSocketEvent<{ message: string }>('matchmaking:error', useCallback((data) => {
    toast.error(data.message);
    resetState();
  }, [resetState]));

  useSocketEvent<{ userId: string; ready: boolean }>('lobby:player_ready', useCallback(() => {
    // Placeholder — confirmedUserIds vem de lobby:ready_snapshot (fonte de verdade)
  }, []));

  useSocketEvent<{ ready: string[] }>('lobby:ready_snapshot', useCallback((data) => {
    if (status !== 'found') return;
    setConfirmedUserIds(data.ready);
    // Sincroniza myConfirmed com servidor: se nosso userId esta no snapshot, marcamos como confirmado
    if (user?.id && data.ready.includes(user.id)) {
      setMyConfirmed(true);
    }
  }, [status, user?.id]));

  useSocketEvent<{ reason: string }>('matchmaking:cancelled', useCallback((data) => {
    toast.info(data.reason);
    // Volta para o estado 'queued' — backend ja recolocou na fila
    setMatchData(null);
    setMyConfirmed(false);
    setConfirmedUserIds([]);
    setStatus('queued');
  }, []));

  const handleSearch = () => {
    if (!user) return;
    emitSocketEvent('matchmaking:join', {
      type,
      avatarIndex: user.avatarIndex ?? 0,
      level: user.level ?? 1,
      pds: user.pds ?? 0,
    });
  };

  const handleCancel = () => {
    emitSocketEvent('matchmaking:leave', {});
    resetState();
  };

  const handleConfirm = () => {
    if (!matchData || myConfirmed) return;
    emitSocketEvent('lobby:set_ready', { roomCode: matchData.roomCode, ready: true });
    setMyConfirmed(true);
    // confirmedUserIds sera atualizado via lobby:ready_snapshot (fonte de verdade)
  };

  const handleDecline = () => {
    if (!matchData) return;
    emitSocketEvent('matchmaking:decline', { roomCode: matchData.roomCode });
    resetState();
  };

  if (!open) return null;

  const confirmProgress = confirmTimerMax > 0 ? (confirmTimer / confirmTimerMax) * 100 : 0;
  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference * (1 - confirmProgress / 100);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-testid="matchmaking-dialog">
      <div className="relative w-full max-w-sm max-h-[90dvh] rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <Swords size={16} className="text-[var(--color-accent-soft)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Buscar Partida</span>
          </div>
          {status !== 'found' && (
            <button
              onClick={onClose}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1 min-h-0">
          {/* IDLE: type selection */}
          {status === 'idle' && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-widest font-medium text-[var(--color-text-muted)]">Modo</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setType('QUICK')}
                    className={[
                      'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all',
                      type === 'QUICK'
                        ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10 text-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-strong)]/50',
                    ].join(' ')}
                  >
                    <Zap size={18} />
                    <span className="text-xs font-medium">Casual</span>
                  </button>
                  <button
                    onClick={() => (user?.level ?? 1) >= 10 && setType('RANKED')}
                    disabled={(user?.level ?? 1) < 10}
                    title={(user?.level ?? 1) < 10 ? 'Nível 10 necessário' : undefined}
                    className={[
                      'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all',
                      (user?.level ?? 1) < 10 && 'opacity-40 cursor-not-allowed',
                      type === 'RANKED'
                        ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-strong)]/10 text-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-strong)]/50',
                    ].join(' ')}
                  >
                    <Trophy size={18} />
                    <span className="text-xs font-medium">Ranqueada</span>
                    {(user?.level ?? 1) < 10 && <span className="text-[9px] text-[var(--color-text-muted)]">Nível 10+</span>}
                  </button>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full" data-testid="matchmaking-start-btn">
                <Swords size={15} /> Buscar
              </Button>
            </>
          )}

          {/* QUEUED */}
          {status === 'queued' && (
            <div className="flex flex-col items-center gap-4 py-2">
              {/* Spinner */}
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="var(--color-accent-strong)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    className="origin-center animate-spin"
                    style={{ animationDuration: '1.4s' }}
                  />
                </svg>
                <Swords
                  size={18}
                  className="absolute inset-0 m-auto text-[var(--color-accent-soft)]"
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-[var(--color-text-primary)]" data-testid="matchmaking-status">Procurando partida...</span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{formatTime(queueTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={[
                  'text-xs font-medium px-2 py-0.5 rounded-full border',
                  type === 'RANKED'
                    ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                    : 'border-[var(--color-accent-strong)]/40 text-[var(--color-accent-soft)] bg-[var(--color-accent-strong)]/10',
                ].join(' ')}>
                  {type === 'RANKED' ? 'Ranqueada' : 'Casual'}
                </span>
                {position > 0 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {position}/{queueSize} na fila
                  </span>
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-[var(--color-danger)]" data-testid="matchmaking-cancel-btn">
                Cancelar
              </Button>
            </div>
          )}

          {/* FOUND */}
          {status === 'found' && matchData && (
            <div className="flex flex-col items-center gap-4">
              {/* Countdown circle */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                  <circle
                    cx="30" cy="30" r="26"
                    fill="none"
                    stroke={confirmTimer <= 10 ? 'var(--color-danger)' : 'var(--color-accent-mid)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <span className={[
                  'absolute inset-0 flex items-center justify-center text-sm font-mono font-bold',
                  confirmTimer <= 10 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]',
                ].join(' ')}>
                  {confirmTimer}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Partida encontrada!</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {confirmedUserIds.length}/{matchData.players.length} confirmados
                </span>
              </div>

              {/* Players — verde para QUALQUER um que confirmou (visivel para todos) */}
              <div className="grid grid-cols-4 gap-2 w-full">
                {matchData.players.map(p => {
                  const isConfirmed = confirmedUserIds.includes(p.userId);
                  return (
                    <div key={p.userId} className="flex flex-col items-center gap-1">
                      <div className={[
                        'rounded-full overflow-hidden border-2 transition-colors',
                        isConfirmed ? 'border-emerald-500' : 'border-[var(--color-border)]',
                      ].join(' ')}>
                        <AvatarImage index={p.avatarIndex} size={40} />
                      </div>
                      <span
                        className={[
                          'text-[10px] truncate max-w-full text-center leading-tight',
                          isConfirmed ? 'text-emerald-400 font-medium' : 'text-[var(--color-text-muted)]',
                        ].join(' ')}
                      >
                        {p.username}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={myConfirmed}
                  className="flex-1"
                >
                  Recusar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={myConfirmed}
                  className="flex-1"
                  style={myConfirmed ? { opacity: 0.6 } : {}}
                >
                  {myConfirmed ? 'Confirmado' : 'Confirmar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
