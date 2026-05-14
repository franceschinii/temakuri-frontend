import { Square } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';
import { MedalBadge } from '@/components/ui/MedalBadge';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { RankBadge } from '@/components/ui/RankBadge';
import type { PublicPlayerState } from '@/types/game';
import { cn } from '@/lib/utils';

interface OpponentRowProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
  /**
   * Versao enxuta para mobile: avatar 28px, sem fan de cartas, sem RankBadge,
   * tudo em uma linha horizontal com width 120px. Mantem highlight de turno
   * e marcacao de eliminado/desconectado.
   */
  compact?: boolean;
  /**
   * Quando passado, o bloco vira clicavel (button) e dispara este callback
   * em vez de abrir nada por conta propria. Usado pelo GameBoard para abrir
   * PlayerDetailsDialog.
   */
  onClick?: () => void;
}

export function OpponentRow({ player, isCurrentTurn, compact, onClick }: OpponentRowProps) {
  const visibleCards = Math.min(player.cardCount, 8);
  const extraCards = player.cardCount - visibleCards;

  if (compact) {
    const Wrapper: any = onClick ? 'button' : 'div';
    return (
      <Wrapper
        data-testid={`opponent-row-${player.userId}`}
        onClick={onClick}
        type={onClick ? 'button' : undefined}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors shrink-0 text-left',
          isCurrentTurn
            ? 'border-[var(--color-accent-strong)] bg-[var(--color-surface)] shadow-[0_0_6px_var(--color-accent-glow)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]',
          onClick && 'cursor-pointer hover:bg-[var(--color-panel)] active:scale-[0.98]',
          player.isEliminated && 'opacity-30',
        )}
        style={{ width: 130 }}
      >
        {isCurrentTurn && (
          <span data-testid={`current-turn-indicator-${player.userId}`} className="sr-only">
            current turn
          </span>
        )}
        <AvatarWithBorder index={player.avatarIndex ?? 0} level={player.level ?? 1} size={28} />
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={cn(
                'text-xs font-medium truncate min-w-0',
                (player.pds ?? 0) >= 4000
                  ? 'text-[var(--color-danger)]'
                  : isCurrentTurn
                    ? 'text-[var(--color-accent-soft)]'
                    : 'text-[var(--color-text-primary)]',
              )}
              title={player.username}
            >
              {player.username}
            </span>
            {!player.isConnected && (
              <span className="text-[9px] text-[var(--color-danger)] shrink-0" title="Desconectado">●</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <TokenDisplay tokens={player.tokensLeft} size="sm" playerId={player.userId} />
            <span
              className="text-[10px] text-[var(--color-text-muted)] tabular-nums font-mono shrink-0"
              data-testid={`opponent-card-count-${player.userId}`}
            >
              {player.cardCount}c
            </span>
          </div>
        </div>
      </Wrapper>
    );
  }

  const FullWrapper: any = onClick ? 'button' : 'div';
  return (
    <FullWrapper
      data-testid={`opponent-row-${player.userId}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0',
        isCurrentTurn && 'ring-2 ring-[var(--color-accent-soft)] bg-[var(--color-surface)]',
        onClick && 'cursor-pointer hover:bg-[var(--color-panel)] active:scale-[0.98]',
        player.isEliminated && 'opacity-30',
      )}
      style={{ width: 200 }}
    >
      {isCurrentTurn && (
        <span
          data-testid={`current-turn-indicator-${player.userId}`}
          className="sr-only"
        >
          current turn
        </span>
      )}
      {/* Avatar + name */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'shrink-0',
          isCurrentTurn && 'ring-2 ring-[var(--color-accent-soft)] rounded-full',
        )}>
          <AvatarWithBorder index={player.avatarIndex ?? 0} level={player.level ?? 1} size={52} />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'text-sm font-medium truncate max-w-[7rem] sm:max-w-32',
                (player.pds ?? 0) >= 4000 ? 'text-[var(--color-danger)]' :
                isCurrentTurn ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-primary)]',
              )}
              title={player.username}
            >
              {player.username}
            </span>
            <MedalBadge count={player.sessionWins ?? 0} />
            {!player.isConnected && (
              <span className="text-[10px] text-[var(--color-danger)] shrink-0">●</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {player.isGuest ? (
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--color-panel)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Convidado
              </span>
            ) : (
              <>
                <LevelBadge level={player.level ?? 1} size="xs" />
                <RankBadge pds={player.pds ?? 0} size="sm" showPds={false} />
              </>
            )}
            {player.isAdmin && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
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
        </div>
      </div>

      {/* Tokens */}
      <TokenDisplay tokens={player.tokensLeft} size="sm" playerId={player.userId} />

      {/* Cards facedown — fanned layout */}
      <div className="flex items-end justify-center" style={{ height: 28 }}>
        {Array.from({ length: visibleCards }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-7 rounded border border-[var(--color-border)] bg-[var(--color-panel)] -ml-2 first:ml-0 flex items-center justify-center"
            style={{ zIndex: i }}
          >
            <Square size={6} className="opacity-40 text-[var(--color-text-muted)]" />
          </div>
        ))}
        {extraCards > 0 && (
          <span className="text-[10px] text-[var(--color-text-muted)] ml-1 self-end">+{extraCards}</span>
        )}
      </div>

      <span
        className="text-[10px] text-[var(--color-text-muted)] tabular-nums"
        data-testid={`opponent-card-count-${player.userId}`}
      >
        {player.cardCount} carta{player.cardCount !== 1 ? 's' : ''}
      </span>
    </FullWrapper>
  );
}
