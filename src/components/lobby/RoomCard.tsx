import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
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
  const mode = GAME_MODES.find(m => m.value === room.mode);
  const accentColor = MODE_COLOR[room.mode] ?? 'var(--color-accent-strong)';
  const fillRatio = room.players.length / room.maxPlayers;

  return (
    <div
      className={cn(
        'relative flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden',
        'hover:border-[var(--color-accent-mid)] transition-all duration-200 group',
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl transition-all group-hover:w-1"
        style={{ background: accentColor }}
      />

      <div className="flex flex-col gap-1.5 ml-2">
        <div className="flex items-center gap-2.5">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Users size={11} />
            <span className="tabular-nums">{room.players.length}/{room.maxPlayers}</span>
          </div>
          {/* Player fill bar */}
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

      <Button size="sm" onClick={() => navigate(`/lobby/${room.code}`)}>
        Entrar
      </Button>
    </div>
  );
}
