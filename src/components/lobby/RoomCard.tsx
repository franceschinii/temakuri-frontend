import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Swords } from 'lucide-react';
import type { RoomPublicState } from '@/types/game';
import { GAME_MODES } from '@/constants/game';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: RoomPublicState;
}

const MODE_COLOR: Record<string, string> = {
  TRADITIONAL: 'var(--color-accent-strong)',
  BLITZ: 'var(--color-warning)',
  CHAOS: 'var(--color-danger)',
};

export function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);
  const mode = GAME_MODES.find(m => m.value === room.mode);
  const accentColor = MODE_COLOR[room.mode] ?? 'var(--color-accent-strong)';
  const fillRatio = room.players.length / room.maxPlayers;
  const isInProgress = room.status === 'IN_PROGRESS';
  const isFull = room.players.length >= room.maxPlayers;

  return (
    <div
      data-testid={`lobby-room-card-${room.code}`}
      className={cn(
        'relative flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden',
        !isInProgress && 'hover:border-[var(--color-accent-mid)] transition-all duration-200 group',
        isInProgress && isFull && 'opacity-60',
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl transition-all group-hover:w-1"
        style={{ background: accentColor }}
      />

      <div className="flex flex-col gap-1.5 ml-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="font-mono text-sm font-bold text-[var(--color-accent-soft)] tracking-widest"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {room.code}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
            style={{
              color: accentColor,
              borderColor: `${accentColor}40`,
              background: `${accentColor}10`,
            }}
          >
            {mode?.label ?? room.mode}
          </span>
          {room.isRanked && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium text-[oklch(72%_0.2_240)] border-[oklch(72%_0.2_240)]/40 bg-[oklch(72%_0.2_240)]/10 flex items-center gap-0.5">
              <Swords size={9} /> Ranked
            </span>
          )}
          {isInProgress && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10">
              Em andamento
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Users size={11} />
            <span className="tabular-nums">{room.players.length}/{room.maxPlayers}</span>
          </div>
          <div className="w-16 h-1 rounded-full bg-[var(--color-panel)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fillRatio * 100}%`, background: accentColor }}
            />
          </div>
          <span className="text-xs text-[var(--color-text-muted)] truncate max-w-24">
            {room.players[0]?.username ?? 'sem host'}
          </span>
        </div>
      </div>

      {isInProgress && isFull ? (
        <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">Lotada</span>
      ) : (
        <Button
          size="sm"
          variant={isInProgress ? 'secondary' : 'primary'}
          disabled={entering}
          onClick={() => { setEntering(true); navigate(`/lobby/${room.code}`, { state: { isMatchmaking: false } }); }}
          data-testid={`lobby-room-join-btn-${room.code}`}
        >
          {entering ? '...' : isInProgress ? 'Espectador' : 'Entrar'}
        </Button>
      )}
    </div>
  );
}
