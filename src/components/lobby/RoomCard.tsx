import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { RoomPublicState } from '@/types/game';
import { GAME_MODES } from '@/constants/game';

interface RoomCardProps {
  room: RoomPublicState;
}

export function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();
  const mode = GAME_MODES.find(m => m.value === room.mode);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-mid)] transition-all">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--color-accent-soft)]">{room.code}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-panel)] text-[var(--color-text-muted)]">
            {mode?.label ?? room.mode}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <Users size={12} />
          <span>{room.players.length}/{room.maxPlayers}</span>
          <span>· {room.players[0]?.username ?? 'sem host'}</span>
        </div>
      </div>
      <Button size="sm" onClick={() => navigate(`/lobby/${room.code}`)}>
        Entrar
      </Button>
    </div>
  );
}
