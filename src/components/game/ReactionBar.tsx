const REACTIONS = ['😋', '🔥', '😤', '🤯', '👀', '💀'];

interface ReactionBarProps {
  onReact: (emoji: string) => void;
  disabled?: boolean;
  usesLeft?: number;
}

export function ReactionBar({ onReact, disabled, usesLeft = 5 }: ReactionBarProps) {
  return (
    <div className="flex flex-col items-center gap-1" data-testid="reaction-bar">
      <div className="flex gap-1.5 justify-center">
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            disabled={disabled}
            data-testid={`reaction-btn-${emoji}`}
            className="text-lg w-9 h-9 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-surface)] hover:scale-110 active:scale-95 transition-all border border-[var(--color-border)] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            {emoji}
          </button>
        ))}
      </div>
      {!disabled && usesLeft < 5 && (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-all ${i < usesLeft ? 'bg-[var(--color-accent-mid)]' : 'bg-[var(--color-border)] opacity-30'}`}
            />
          ))}
        </div>
      )}
      {disabled && (
        <span className="text-[9px] text-[var(--color-text-muted)] animate-pulse">cooldown...</span>
      )}
    </div>
  );
}
