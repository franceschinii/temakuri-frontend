const REACTIONS = ['😋', '🔥', '😤', '🤯', '👀', '💀'];

interface ReactionBarProps {
  onReact: (emoji: string) => void;
}

export function ReactionBar({ onReact }: ReactionBarProps) {
  return (
    <div className="flex gap-1.5 justify-center">
      {REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="text-lg w-9 h-9 rounded-full bg-[var(--color-panel)] hover:bg-[var(--color-surface)] hover:scale-110 active:scale-95 transition-all border border-[var(--color-border)]"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
