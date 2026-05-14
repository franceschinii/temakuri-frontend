const REACTIONS = ['😋', '😂', '🔥', '😤', '🤯', '👀', '💀'];

interface ReactionBarProps {
  onReact: (emoji: string) => void;
  disabled?: boolean;
}

export function ReactionBar({ onReact, disabled }: ReactionBarProps) {
  return (
    <div className="flex gap-1.5 justify-center" data-testid="reaction-bar">
      {REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          disabled={disabled}
          data-testid={`reaction-btn-${emoji}`}
          className="text-lg w-9 h-9 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-surface)] hover:scale-110 active:scale-95 transition-all border border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
